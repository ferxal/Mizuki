// 配置管理模块
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 加载环境变量
config({ path: resolve(__dirname, '.env') });

export default {
  // 服务器配置
  server: {
    port: Number.parseInt(process.env.PORT) || 11451,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // 性能配置
  performance: {
    maxPayloadSize: Number.parseInt(process.env.MAX_PAYLOAD_SIZE) || 16 * 1024,
    idleTimeout: Number.parseInt(process.env.IDLE_TIMEOUT) || 120,
    maxBackpressure: Number.parseInt(process.env.MAX_BACKPRESSURE) || 1024 * 1024,
    compression: true
  },

  // 心跳配置
  heartbeat: {
    interval: Number.parseInt(process.env.HEARTBEAT_INTERVAL) || 30000,
    timeout: Number.parseInt(process.env.HEARTBEAT_TIMEOUT) || 60000
  },

  // 并发限制
  limits: {
    maxConnections: Number.parseInt(process.env.MAX_CONNECTIONS) || 10000,
    maxMessagesPerSecond: Number.parseInt(process.env.MAX_MESSAGES_PER_SECOND) || 100,
    maxNicknameLength: 20,
    minNicknameLength: 2,
    maxMessageLength: 1000
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableAccessLog: process.env.ENABLE_ACCESS_LOG === 'true'
  },

  // API配置
  api: {
    enabled: process.env.ENABLE_API !== 'false',
    key: process.env.API_KEY || 'dev-secret-key'
  },

  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};
