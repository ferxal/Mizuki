import uWS from 'uWebSockets.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 11451;
const HEARTBEAT_INTERVAL = 30000; // 30秒心跳间隔
const HEARTBEAT_TIMEOUT = 60000; // 60秒超时

// 内存存储
const users = new Map(); // ws -> { id, nickname, lastHeartbeat }
const nicknames = new Map(); // nickname -> ws

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 消息类型
const MSG_TYPES = {
  SYSTEM: 'system',
  PUBLIC: 'public',
  PRIVATE: 'private',
  USER_LIST: 'user_list',
  JOIN: 'join',
  LEAVE: 'leave',
  NICKNAME_SET: 'nickname_set',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat'
};

// 广播消息给所有用户
function broadcast(message, excludeWs = null) {
  const data = JSON.stringify(message);
  let sentCount = 0;
  for (const [ws] of users) {
    if (ws !== excludeWs) {
      try {
        ws.send(data);
        sentCount++;
      } catch (err) {
        console.error('发送失败:', err.message);
      }
    }
  }
  console.log(`广播消息给 ${sentCount} 个用户:`, message.type);
}

// 发送在线用户列表
function sendUserList(ws = null) {
  const userList = Array.from(users.values())
    .filter(u => u.nickname)
    .map(u => ({ id: u.id, nickname: u.nickname }));
  
  const message = {
    type: MSG_TYPES.USER_LIST,
    users: userList,
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
  if (user?.nickname) {
    // 通知其他用户
    broadcast({
      type: MSG_TYPES.LEAVE,
      nickname: user.nickname,
      timestamp: Date.now()
    }, ws);
    
    nicknames.delete(user.nickname);
  }
  users.delete(ws);
  sendUserList();
}

// 心跳检查
setInterval(() => {
  const now = Date.now();
  for (const [ws, user] of users) {
    if (now - user.lastHeartbeat > HEARTBEAT_TIMEOUT) {
      console.log(`用户 ${user.nickname || user.id} 心跳超时，断开连接`);
      ws.close();
      handleDisconnect(ws);
    }
  }
}, HEARTBEAT_INTERVAL);

// 创建服务器
uWS.App({})
  .ws('/*', {
    // WebSocket配置
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024, // 16KB
    idleTimeout: 120, // 120秒空闲超时
    
    // 连接打开
    open: (ws) => {
      const userId = generateId();
      users.set(ws, {
        id: userId,
        nickname: null,
        lastHeartbeat: Date.now()
      });
      
      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: MSG_TYPES.SYSTEM,
        message: '欢迎来到聊天室！请输入昵称加入聊天',
        userId,
        timestamp: Date.now()
      }));
      
      console.log(`新连接: ${userId}`);
    },
    
    // 接收消息
    message: (ws, message) => {
      try {
        const data = JSON.parse(Buffer.from(message).toString());
        const user = users.get(ws);
        
        if (!user) {
          console.log('警告: 收到消息但用户不存在');
          return;
        }
        
        console.log(`收到消息 [${user.nickname || user.id}]:`, data.type, data.content?.substring(0, 20));
        
        // 更新心跳时间
        user.lastHeartbeat = Date.now();
        
        switch (data.type) {
          // 设置昵称
          case 'set_nickname': {
            const nickname = data.nickname?.trim();
            
            if (!nickname || nickname.length < 2 || nickname.length > 20) {
              ws.send(JSON.stringify({
                type: MSG_TYPES.ERROR,
                message: '昵称长度必须在2-20个字符之间',
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
            
            // 如果已有昵称，先清理旧的
            if (user.nickname) {
              nicknames.delete(user.nickname);
            }
            
            user.nickname = nickname;
            nicknames.set(nickname, ws);
            
            // 通知用户昵称设置成功
            ws.send(JSON.stringify({
              type: MSG_TYPES.NICKNAME_SET,
              nickname,
              timestamp: Date.now()
            }));
            
            // 广播用户加入
            broadcast({
              type: MSG_TYPES.JOIN,
              nickname,
              timestamp: Date.now()
            }, ws);
            
            sendUserList();
            console.log(`用户 ${user.id} 设置昵称: ${nickname}`);
            break;
          }
          
          // 公共消息
          case 'public': {
            if (!user.nickname) {
              ws.send(JSON.stringify({
                type: MSG_TYPES.ERROR,
                message: '请先设置昵称',
                timestamp: Date.now()
              }));
              break;
            }
            
            const message = data.content?.trim();
            if (!message) break;
            
            // 广播给所有用户（包括发送者，前端会处理去重）
            broadcast({
              type: MSG_TYPES.PUBLIC,
              nickname: user.nickname,
              content: message,
              timestamp: Date.now()
            });
            
            console.log(`公共消息 [${user.nickname}]: ${message}`);
            break;
          }
          
          // 私聊消息
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
            const message = data.content?.trim();
            
            if (!targetNickname || !message) break;
            
            const targetWs = nicknames.get(targetNickname);
            if (!targetWs) {
              ws.send(JSON.stringify({
                type: MSG_TYPES.ERROR,
                message: `用户 ${targetNickname} 不在线`,
                timestamp: Date.now()
              }));
              break;
            }
            
            // 发送给目标用户
            targetWs.send(JSON.stringify({
              type: MSG_TYPES.PRIVATE,
              from: user.nickname,
              content: message,
              timestamp: Date.now()
            }));
            
            // 发送给发送者确认（前端会处理去重）
            ws.send(JSON.stringify({
              type: MSG_TYPES.PRIVATE,
              to: targetNickname,
              content: message,
              timestamp: Date.now()
            }));
            
            console.log(`私聊 [${user.nickname} -> ${targetNickname}]: ${message}`);
            break;
          }
          
          // 心跳
          case 'heartbeat': {
            ws.send(JSON.stringify({
              type: MSG_TYPES.HEARTBEAT,
              timestamp: Date.now()
            }));
            break;
          }
          
          // 获取用户列表
          case 'get_users': {
            sendUserList(ws);
            break;
          }
        }
      } catch (err) {
        console.error('处理消息错误:', err);
        ws.send(JSON.stringify({
          type: MSG_TYPES.ERROR,
          message: '消息处理失败',
          timestamp: Date.now()
        }));
      }
    },
    
    // 连接关闭
    close: (ws, code) => {
      handleDisconnect(ws);
      console.log('连接关闭:', code);
    }
  })
  
  // HTTP路由 - 提供简单的测试页面
  .get('/*', (res, req) => {
    try {
      const html = readFileSync(join(__dirname, 'index.html'), 'utf8');
      res.writeHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    } catch {
      res.writeStatus('200 OK');
      res.writeHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>聊天室</title>
        </head>
        <body>
          <h1>WebSocket聊天室服务器运行中</h1>
          <p>端口: ${PORT}</p>
          <p>WebSocket地址: ws://localhost:${PORT}</p>
          <p>请使用WebSocket客户端连接</p>
        </body>
        </html>
      `);
    }
  })
  
  .listen(PORT, (token) => {
    if (token) {
      console.log('✅ 聊天室服务器启动成功');
      console.log(`🚀 监听端口: ${PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
      console.log(`🌐 测试页面: http://localhost:${PORT}`);
    } else {
      console.error(`❌ 启动失败，端口 ${PORT} 可能被占用`);
    }
  });

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  broadcast({
    type: MSG_TYPES.SYSTEM,
    message: '服务器即将关闭',
    timestamp: Date.now()
  });
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});
