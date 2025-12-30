# 快速开始指南

## 🚀 5分钟部署

### 方式一：直接运行（推荐用于开发）

```bash
# 1. 进入项目目录
cd chat

# 2. 安装依赖
pnpm install

# 3. 启动服务器
pnpm start
```

访问 http://localhost:11451

### 方式二：Docker（推荐用于生产）

```bash
# 1. 使用Docker Compose启动
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 访问服务
# http://localhost:11451
```

### 方式三：PM2（推荐用于服务器）

```bash
# 1. 安装PM2
pnpm add -g pm2

# 2. 启动服务
pm2 start ecosystem.config.cjs

# 3. 设置开机自启
pm2 startup
pm2 save
```

## 📝 基本配置

创建 `.env` 文件（可选）：

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置
# nano .env
```

最小配置：

```env
PORT=11451
API_KEY=your-secure-api-key-here
```

## 🧪 测试

### 1. 健康检查

```bash
curl http://localhost:11451/api/health
```

### 2. 获取统计信息

```bash
curl -H "X-API-Key: your-api-key" \
     http://localhost:11451/api/stats
```

### 3. WebSocket测试

打开浏览器访问：http://localhost:11451

## 🔒 生产环境配置

### 必做事项

1. **修改API密钥**
```env
API_KEY=使用强密码生成器生成32位以上的随机密钥
```

2. **设置环境为生产模式**
```env
NODE_ENV=production
LOG_LEVEL=warn
```

3. **配置防火墙**
```bash
# 仅允许HTTP/HTTPS访问
ufw allow 11451/tcp
```

4. **使用反向代理**

Nginx配置：
```nginx
server {
    listen 80;
    server_name chat.yourdomain.com;

    location / {
        proxy_pass http://localhost:11451;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 推荐配置

```env
# 生产环境优化配置
NODE_ENV=production
PORT=11451
HOST=0.0.0.0

# 性能调优
MAX_CONNECTIONS=5000
MAX_MESSAGES_PER_SECOND=50
MAX_PAYLOAD_SIZE=8192

# 安全
API_KEY=your-secure-random-key-min-32-chars
CORS_ORIGIN=https://yourdomain.com

# 日志
LOG_LEVEL=warn
ENABLE_ACCESS_LOG=false
```

## 📊 监控

### PM2监控

```bash
# 查看状态
pm2 status

# 实时日志
pm2 logs chat-server

# 监控面板
pm2 monit
```

### API监控

```bash
# 创建监控脚本
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  curl -s -H "X-API-Key: your-api-key" \
       http://localhost:11451/api/stats | jq '.data.currentConnections'
  sleep 10
done
EOF

chmod +x monitor.sh
./monitor.sh
```

## 🔧 常见问题

### Q: 端口被占用

```bash
# 查找占用进程
netstat -ano | findstr :11451  # Windows
lsof -i :11451                 # Linux/Mac

# 修改端口
echo "PORT=12345" > .env
```

### Q: 无法连接WebSocket

1. 检查防火墙设置
2. 确认使用正确的协议（ws:// 或 wss://）
3. 查看服务器日志：`pm2 logs` 或 `docker logs`

### Q: API返回401错误

检查API密钥配置：
```bash
# .env文件中设置
API_KEY=your-key

# 请求时包含
curl -H "X-API-Key: your-key" http://localhost:11451/api/stats
```

## 📚 下一步

- 阅读完整文档：[README-v2.md](./README-v2.md)
- API参考：[API.md](./API.md)
- 高级配置：查看 `.env.example`

## 🆘 获取帮助

遇到问题？

1. 检查日志：`pm2 logs` 或 `docker logs`
2. 测试健康检查：`curl http://localhost:11451/api/health`
3. 查看文档：README-v2.md 和 API.md
4. 提交Issue：描述问题和环境信息

---

**祝你使用愉快！** 🎉
