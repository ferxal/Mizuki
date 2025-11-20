import uWS from 'uWebSockets.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 消息类型常量
const MSG_TYPES = {
  SYSTEM: 'system',
  PUBLIC: 'public',
  PRIVATE: 'private',
  USER_LIST: 'user_list',
  JOIN: 'join',
  LEAVE: 'leave',
  NICKNAME_SET: 'nickname_set',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat',
  STATS: 'stats'
};

// 内存存储
const users = new Map();
const nicknames = new Map();
const messageRateLimiter = new Map(); // 速率限制器

// 统计信息
const stats = {
  totalConnections: 0,
  currentConnections: 0,
  totalMessages: 0,
  publicMessages: 0,
  privateMessages: 0,
  startTime: Date.now(),
  peakConnections: 0
};

// 生成唯一ID（性能优化版）
let idCounter = 0;
const generateId = () => `u${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

// 日志工具
const logger = {
  info: (...args) => {
    if (config.logging.level !== 'silent') console.log('[INFO]', ...args);
  },
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => {
    if (config.logging.level === 'debug') console.log('[DEBUG]', ...args);
  }
};

// 速率限制检查
function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = messageRateLimiter.get(userId) || { count: 0, resetTime: now + 1000 };
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + 1000;
  } else {
    userLimit.count++;
  }
  
  messageRateLimiter.set(userId, userLimit);
  return userLimit.count <= config.limits.maxMessagesPerSecond;
}

// 广播消息（优化版 - 批量发送）
function broadcast(message, excludeWs = null) {
  const data = JSON.stringify(message);
  const dataBuffer = Buffer.from(data);
  let sentCount = 0;
  
  for (const [ws] of users) {
    if (ws !== excludeWs) {
      try {
        ws.send(dataBuffer, false); // false = 不压缩（批量发送时更快）
        sentCount++;
      } catch (err) {
        logger.error('广播失败:', err.message);
      }
    }
  }
  
  logger.debug(`广播消息给 ${sentCount} 个用户:`, message.type);
  return sentCount;
}

// 发送在线用户列表
function sendUserList(ws = null) {
  const userList = Array.from(users.values())
    .filter(u => u.nickname)
    .map(u => ({ id: u.id, nickname: u.nickname }));
  
  const message = {
    type: MSG_TYPES.USER_LIST,
    users: userList,
    count: userList.length,
    timestamp: Date.now()
  };
  
  if (ws) {
    ws.send(JSON.stringify(message));
  } else {
    broadcast(message);
  }
}

// 处理用户断开
function handleDisconnect(ws) {
  const user = users.get(ws);
  if (user) {
    if (user.nickname) {
      broadcast({
        type: MSG_TYPES.LEAVE,
        nickname: user.nickname,
        timestamp: Date.now()
      }, ws);
      nicknames.delete(user.nickname);
    }
    
    users.delete(ws);
    messageRateLimiter.delete(user.id);
    stats.currentConnections--;
    sendUserList();
    
    logger.info(`用户断开: ${user.nickname || user.id} (在线: ${stats.currentConnections})`);
  }
}

// 心跳检查（优化 - 批量处理）
setInterval(() => {
  const now = Date.now();
  const disconnectList = [];
  
  for (const [ws, user] of users) {
    if (now - user.lastHeartbeat > config.heartbeat.timeout) {
      disconnectList.push({ ws, user });
    }
  }
  
  for (const { ws, user } of disconnectList) {
    logger.warn(`心跳超时: ${user.nickname || user.id}`);
    ws.close();
    handleDisconnect(ws);
  }
}, config.heartbeat.interval);

// 统计信息清理（每小时）
setInterval(() => {
  if (messageRateLimiter.size > 10000) {
    messageRateLimiter.clear();
    logger.info('速率限制器已清理');
  }
}, 3600000);

// 创建WebSocket处理器
const wsHandler = {
  compression: config.performance.compression ? uWS.SHARED_COMPRESSOR : uWS.DISABLED,
  maxPayloadLength: config.performance.maxPayloadSize,
  idleTimeout: config.performance.idleTimeout,
  maxBackpressure: config.performance.maxBackpressure,
  
  open: (ws) => {
    // 连接数限制
    if (stats.currentConnections >= config.limits.maxConnections) {
      ws.close();
      logger.warn('连接数已达上限，拒绝新连接');
      return;
    }
    
    const userId = generateId();
    const user = {
      id: userId,
      nickname: null,
      lastHeartbeat: Date.now(),
      connectedAt: Date.now(),
      messageCount: 0
    };
    
    users.set(ws, user);
    stats.totalConnections++;
    stats.currentConnections++;
    stats.peakConnections = Math.max(stats.peakConnections, stats.currentConnections);
    
    ws.send(JSON.stringify({
      type: MSG_TYPES.SYSTEM,
      message: '欢迎来到聊天室！请输入昵称加入聊天',
      userId,
      serverTime: Date.now(),
      timestamp: Date.now()
    }));
    
    logger.info(`新连接: ${userId} (在线: ${stats.currentConnections})`);
  },
  
  message: (ws, message) => {
    try {
      const data = JSON.parse(Buffer.from(message).toString());
      const user = users.get(ws);
      
      if (!user) {
        logger.warn('收到消息但用户不存在');
        return;
      }
      
      // 速率限制
      if (!checkRateLimit(user.id)) {
        ws.send(JSON.stringify({
          type: MSG_TYPES.ERROR,
          message: '消息发送过快，请稍后再试',
          timestamp: Date.now()
        }));
        return;
      }
      
      user.lastHeartbeat = Date.now();
      user.messageCount++;
      
      logger.debug(`消息 [${user.nickname || user.id}]:`, data.type);
      
      switch (data.type) {
        case 'set_nickname': {
          const nickname = data.nickname?.trim();
          
          if (!nickname || 
              nickname.length < config.limits.minNicknameLength || 
              nickname.length > config.limits.maxNicknameLength) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: `昵称长度必须在${config.limits.minNicknameLength}-${config.limits.maxNicknameLength}个字符之间`,
              timestamp: Date.now()
            }));
            break;
          }
          
          if (nicknames.has(nickname)) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: '该昵称已被使用',
              timestamp: Date.now()
            }));
            break;
          }
          
          if (user.nickname) {
            nicknames.delete(user.nickname);
          }
          
          user.nickname = nickname;
          nicknames.set(nickname, ws);
          
          ws.send(JSON.stringify({
            type: MSG_TYPES.NICKNAME_SET,
            nickname,
            timestamp: Date.now()
          }));
          
          broadcast({
            type: MSG_TYPES.JOIN,
            nickname,
            timestamp: Date.now()
          }, ws);
          
          sendUserList();
          logger.info(`用户设置昵称: ${user.id} -> ${nickname}`);
          break;
        }
        
        case 'public': {
          if (!user.nickname) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: '请先设置昵称',
              timestamp: Date.now()
            }));
            break;
          }
          
          const content = data.content?.trim();
          if (!content || content.length > config.limits.maxMessageLength) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: `消息长度不能超过${config.limits.maxMessageLength}字符`,
              timestamp: Date.now()
            }));
            break;
          }
          
          broadcast({
            type: MSG_TYPES.PUBLIC,
            nickname: user.nickname,
            content,
            timestamp: Date.now()
          });
          
          stats.totalMessages++;
          stats.publicMessages++;
          logger.debug(`公共消息 [${user.nickname}]: ${content.substring(0, 50)}`);
          break;
        }
        
        case 'private': {
          if (!user.nickname) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: '请先设置昵称',
              timestamp: Date.now()
            }));
            break;
          }
          
          const targetNickname = data.target?.trim();
          const content = data.content?.trim();
          
          if (!targetNickname || !content) break;
          
          if (content.length > config.limits.maxMessageLength) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: `消息长度不能超过${config.limits.maxMessageLength}字符`,
              timestamp: Date.now()
            }));
            break;
          }
          
          const targetWs = nicknames.get(targetNickname);
          if (!targetWs) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.ERROR,
              message: `用户 ${targetNickname} 不在线`,
              timestamp: Date.now()
            }));
            break;
          }
          
          const privateMsg = {
            type: MSG_TYPES.PRIVATE,
            from: user.nickname,
            content,
            timestamp: Date.now()
          };
          
          targetWs.send(JSON.stringify(privateMsg));
          ws.send(JSON.stringify({
            ...privateMsg,
            to: targetNickname,
            from: undefined
          }));
          
          stats.totalMessages++;
          stats.privateMessages++;
          logger.debug(`私聊 [${user.nickname} -> ${targetNickname}]`);
          break;
        }
        
        case 'heartbeat': {
          ws.send(JSON.stringify({
            type: MSG_TYPES.HEARTBEAT,
            timestamp: Date.now()
          }));
          break;
        }
        
        case 'get_users': {
          sendUserList(ws);
          break;
        }
        
        case 'get_stats': {
          if (config.api.enabled) {
            ws.send(JSON.stringify({
              type: MSG_TYPES.STATS,
              stats: {
                ...stats,
                uptime: Date.now() - stats.startTime,
                currentUsers: stats.currentConnections
              },
              timestamp: Date.now()
            }));
          }
          break;
        }
      }
    } catch (err) {
      logger.error('处理消息错误:', err);
      ws.send(JSON.stringify({
        type: MSG_TYPES.ERROR,
        message: '消息处理失败',
        timestamp: Date.now()
      }));
    }
  },
  
  close: (ws, code) => {
    handleDisconnect(ws);
    logger.debug('连接关闭:', code);
  },
  
  drain: () => {
    logger.debug('WebSocket drain event');
  }
};

// 创建应用
uWS.App({})
  .ws('/*', wsHandler)
  
  // HTTP API端点
  .get('/api/stats', (res, req) => {
    if (!config.api.enabled) {
      res.writeStatus('403 Forbidden').end('API disabled');
      return;
    }
    
    // API密钥验证
    const apiKey = req.getHeader('x-api-key');
    if (apiKey !== config.api.key) {
      res.writeStatus('401 Unauthorized').end('Invalid API key');
      return;
    }
    
    res.writeHeader('Content-Type', 'application/json');
    res.writeHeader('Access-Control-Allow-Origin', config.cors.origin);
    res.end(JSON.stringify({
      success: true,
      data: {
        ...stats,
        uptime: Date.now() - stats.startTime,
        currentUsers: stats.currentConnections,
        config: {
          maxConnections: config.limits.maxConnections,
          maxMessagesPerSecond: config.limits.maxMessagesPerSecond
        }
      },
      timestamp: Date.now()
    }));
  })
  
  .get('/api/users', (res, req) => {
    if (!config.api.enabled) {
      res.writeStatus('403 Forbidden').end('API disabled');
      return;
    }
    
    const apiKey = req.getHeader('x-api-key');
    if (apiKey !== config.api.key) {
      res.writeStatus('401 Unauthorized').end('Invalid API key');
      return;
    }
    
    const userList = Array.from(users.values())
      .filter(u => u.nickname)
      .map(u => ({
        id: u.id,
        nickname: u.nickname,
        connectedAt: u.connectedAt,
        messageCount: u.messageCount
      }));
    
    res.writeHeader('Content-Type', 'application/json');
    res.writeHeader('Access-Control-Allow-Origin', config.cors.origin);
    res.end(JSON.stringify({
      success: true,
      data: {
        users: userList,
        count: userList.length
      },
      timestamp: Date.now()
    }));
  })
  
  .get('/api/health', (res) => {
    res.writeHeader('Content-Type', 'application/json');
    res.writeHeader('Access-Control-Allow-Origin', config.cors.origin);
    res.end(JSON.stringify({
      success: true,
      status: 'healthy',
      uptime: Date.now() - stats.startTime,
      connections: stats.currentConnections,
      timestamp: Date.now()
    }));
  })
  
  // 前端页面
  .get('/*', (res) => {
    try {
      const html = readFileSync(join(__dirname, 'index.html'), 'utf8');
      res.writeHeader('Content-Type', 'text/html; charset=utf-8');
      res.writeHeader('Cache-Control', 'no-cache');
      res.end(html);
    } catch {
      res.writeStatus('200 OK');
      res.writeHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>聊天室服务器</title>
        </head>
        <body>
          <h1>WebSocket聊天室服务器运行中</h1>
          <p>端口: ${config.server.port}</p>
          <p>WebSocket: ws://${config.server.host}:${config.server.port}</p>
          <p>当前在线: ${stats.currentConnections}</p>
        </body>
        </html>
      `);
    }
  })
  
  .listen(config.server.port, (token) => {
    if (token) {
      logger.info('='.repeat(50));
      logger.info('✅ 聊天室服务器启动成功');
      logger.info(`🚀 监听端口: ${config.server.port}`);
      logger.info(`📡 WebSocket: ws://${config.server.host}:${config.server.port}`);
      logger.info(`🌐 测试页面: http://${config.server.host}:${config.server.port}`);
      logger.info(`⚙️  环境: ${config.server.nodeEnv}`);
      logger.info(`🔌 最大连接: ${config.limits.maxConnections}`);
      logger.info(`📊 API状态: ${config.api.enabled ? '启用' : '禁用'}`);
      logger.info('='.repeat(50));
    } else {
      logger.error(`❌ 启动失败，端口 ${config.server.port} 可能被占用`);
      process.exit(1);
    }
  });

// 优雅关闭
const gracefulShutdown = (signal) => {
  logger.info(`\n收到 ${signal} 信号，正在关闭服务器...`);
  
  broadcast({
    type: MSG_TYPES.SYSTEM,
    message: '服务器即将关闭，请稍后重新连接',
    timestamp: Date.now()
  });
  
  setTimeout(() => {
    logger.info('服务器已关闭');
    logger.info(`总连接数: ${stats.totalConnections}`);
    logger.info(`总消息数: ${stats.totalMessages}`);
    logger.info(`运行时长: ${((Date.now() - stats.startTime) / 1000 / 60).toFixed(2)} 分钟`);
    process.exit(0);
  }, 1000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 未捕获异常处理
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  gracefulShutdown('EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  logger.error('未处理的Promise拒绝:', reason);
});
