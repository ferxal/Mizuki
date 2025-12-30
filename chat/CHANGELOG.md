# Changelog

所有重要的变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2025-11-20

### 新增 ✨

#### 性能优化
- **批量消息处理**: 优化广播算法，使用Buffer零拷贝传输
- **速率限制**: 防止消息洪泛攻击，可配置每用户每秒消息数
- **连接池管理**: 支持10,000+并发连接
- **内存优化**: 自动清理过期数据和速率限制器
- **背压处理**: WebSocket背压管理，防止内存溢出

#### RESTful API
- `GET /api/stats` - 获取服务器统计信息（总连接、消息数、峰值等）
- `GET /api/users` - 获取在线用户列表和详细信息
- `GET /api/health` - 健康检查端点（用于负载均衡和监控）
- API密钥验证机制，保护敏感接口
- CORS支持，可配置允许的来源

#### 配置管理
- `.env` 环境变量支持
- `config.js` 统一配置管理模块
- 多环境支持（development/production）
- 可配置的性能参数（连接数、速率、消息大小等）
- 可配置的日志级别

#### 部署支持
- **Docker**: 完整的Dockerfile和多阶段构建
- **Docker Compose**: 一键部署配置
- **PM2**: 进程管理配置文件（ecosystem.config.cjs）
- 健康检查机制
- 优雅关闭处理

#### 监控和日志
- 分级日志系统（debug/info/warn/error/silent）
- 详细的连接和消息统计
- 峰值连接数追踪
- 运行时长和uptime统计
- 每用户消息计数

#### WebSocket功能增强
- `get_stats` 消息类型：获取实时统计信息
- 更详细的错误消息
- 消息长度验证
- 昵称长度可配置

### 改进 🔧

#### 性能
- 移除不必要的`readyState`检查（uWS不支持）
- 使用try-catch优雅处理发送失败
- 优化广播循环，添加发送计数
- 批量心跳检查，减少循环开销

#### 代码质量
- 模块化配置管理
- 添加详细注释
- 错误处理改进
- 符合ESLint规范（使用Number.parseInt等）

#### 用户体验
- 更友好的启动日志
- 详细的API文档
- 快速开始指南
- 多种部署方式选择

### 文档 📚
- `API.md` - 完整的API文档，包含WebSocket和REST API
- `README-v2.md` - 详细的使用文档
- `QUICKSTART.md` - 快速开始指南
- `.env.example` - 环境变量配置示例
- `CHANGELOG.md` - 版本变更记录

### 安全 🔒
- API密钥验证
- 速率限制防止滥用
- 消息长度限制
- 输入验证增强
- 生产环境安全建议

### 依赖 📦
- 新增 `dotenv@16.6.1` - 环境变量管理

### 向后兼容 ⚠️
- 保留 `server.js` 旧版服务器
- 可通过 `pnpm start:legacy` 运行旧版本
- WebSocket API完全兼容v1.0

---

## [1.0.0] - 2025-11-20

### 新增 ✨
- 基于uWebSockets.js的WebSocket服务器
- 实时聊天功能（公共消息和私聊）
- 用户昵称系统
- 在线用户列表
- 心跳机制
- 响应式Web聊天界面
- 用户加入/离开通知
- 自动重连机制

### 功能
- 昵称设置与验证（2-20字符）
- 公共聊天广播
- 点对点私聊
- 实时用户列表更新
- 心跳保活（30秒间隔，60秒超时）
- 消息压缩（SHARED_COMPRESSOR）
- 16KB消息大小限制
- 120秒空闲超时

### 技术栈
- Node.js + uWebSockets.js
- 纯ESM模块
- pnpm包管理
- 纯内存存储

---

## 升级指南

### 从 v1.0 升级到 v2.0

1. **安装新依赖**
```bash
pnpm install
```

2. **创建配置文件（可选）**
```bash
cp .env.example .env
# 编辑 .env 文件设置API密钥等
```

3. **启动新版本**
```bash
# 方式1: 直接运行
pnpm start

# 方式2: PM2
pnpm pm2:start

# 方式3: Docker
docker-compose up -d
```

4. **验证升级**
```bash
# 健康检查
curl http://localhost:11451/api/health

# 查看统计（需设置API密钥）
curl -H "X-API-Key: your-key" http://localhost:11451/api/stats
```

### 配置迁移

v1.0使用硬编码配置，v2.0支持环境变量：

| v1.0 | v2.0 (.env) |
|------|-------------|
| PORT: 11451 | PORT=11451 |
| 心跳间隔: 30000 | HEARTBEAT_INTERVAL=30000 |
| 心跳超时: 60000 | HEARTBEAT_TIMEOUT=60000 |
| - | MAX_CONNECTIONS=10000 |
| - | MAX_MESSAGES_PER_SECOND=100 |
| - | API_KEY=your-key |

### 破坏性变更

**无破坏性变更**。v2.0完全向后兼容v1.0。

如需使用v1.0，运行：
```bash
pnpm start:legacy
```

---

## 路线图

### v2.1.0 (计划中)
- [ ] Redis支持（可选的持久化）
- [ ] 房间/频道功能
- [ ] 用户认证系统
- [ ] 消息历史记录
- [ ] 在线状态更新

### v2.2.0 (计划中)
- [ ] 集群支持（多实例）
- [ ] 消息队列集成
- [ ] 文件传输支持
- [ ] 表情和富文本
- [ ] 管理后台界面

### v3.0.0 (未来)
- [ ] 端到端加密
- [ ] 语音/视频通话
- [ ] 机器人API
- [ ] 插件系统
- [ ] GraphQL API

---

## 贡献者

感谢所有贡献者！

## 许可证

MIT License
