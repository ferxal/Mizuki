# PM2 安装和使用指南

## ❌ 常见问题

### 问题: `pm2: not found`

**原因**: PM2 未安装或不在 PATH 中

---

## ✅ 解决方案

### 方案1: 全局安装 PM2（推荐）

#### 使用 npm

```bash
# 安装
npm install -g pm2

# 验证
pm2 --version

# 启动服务器
cd chat
pnpm pm2:start
```

#### 使用 pnpm

```bash
# 安装
pnpm add -g pm2

# 验证
pm2 --version

# 启动服务器
cd chat
pnpm pm2:start
```

#### 使用 yarn

```bash
# 安装
yarn global add pm2

# 验证
pm2 --version

# 启动服务器
cd chat
pnpm pm2:start
```

---

### 方案2: 使用本地 PM2（已包含在项目中）

项目已将 PM2 添加为开发依赖，无需全局安装：

```bash
cd chat

# 安装依赖（包含 PM2）
pnpm install

# 使用 npx 运行本地 PM2
npx pm2 start ecosystem.config.cjs

# 或使用 pnpm 脚本
pnpm pm2:start
```

---

### 方案3: 不使用 PM2，直接启动

如果不需要 PM2 的进程管理功能：

```bash
cd chat

# 直接启动（前台运行）
pnpm start

# 或后台启动（Linux/macOS）
nohup pnpm start > logs/server.log 2>&1 &

# 或后台启动（Windows）
Start-Job { cd chat; pnpm start }
```

---

### 方案4: 使用启动脚本（已提供）

#### Linux/macOS

```bash
# PM2 模式（自动检测并安装）
./start.sh pm2

# 直接启动（前台）
./start.sh direct

# 后台启动
./start.sh background
```

#### Windows PowerShell

```powershell
# PM2 模式
.\start.ps1 pm2

# 直接启动（前台）
.\start.ps1 direct

# 后台启动
.\start.ps1 background
```

---

## 📦 PM2 基本使用

### 启动应用

```bash
# 使用配置文件启动
pm2 start ecosystem.config.cjs

# 或使用 pnpm 脚本
pnpm pm2:start

# 直接启动文件
pm2 start server-optimized.js --name chat-server
```

### 管理应用

```bash
# 查看状态
pm2 status
# 或
pnpm pm2:status

# 查看日志
pm2 logs chat-server
# 或
pnpm pm2:logs

# 停止应用
pm2 stop chat-server
# 或
pnpm pm2:stop

# 重启应用
pm2 restart chat-server
# 或
pnpm pm2:restart

# 重载应用（零停机）
pm2 reload chat-server
# 或
pnpm pm2:reload

# 删除应用
pm2 delete chat-server
# 或
pnpm pm2:delete
```

### 查看详细信息

```bash
# 查看实时监控
pm2 monit

# 查看详细信息
pm2 show chat-server

# 查看日志（实时）
pm2 logs --lines 100
```

---

## 🚀 生产环境配置

### 1. 开机自启动

```bash
# 保存当前 PM2 进程列表
pm2 save

# 生成开机自启动脚本
pm2 startup

# 按照提示执行命令（通常需要 sudo）
```

### 2. 配置内存限制

在 `ecosystem.config.cjs` 中设置：

```javascript
module.exports = {
  apps: [{
    name: 'chat-server',
    script: './server-optimized.js',
    max_memory_restart: '500M',  // 内存超过 500MB 自动重启
    // ... 其他配置
  }]
}
```

### 3. 集群模式（多进程）

```bash
# 启动 4 个进程
pm2 start ecosystem.config.cjs -i 4

# 根据 CPU 核心数自动设置
pm2 start ecosystem.config.cjs -i max
```

⚠️ **注意**: WebSocket 应用在集群模式下需要配置 Redis 等消息队列来同步状态。

---

## 🐳 Docker 环境

### Dockerfile 已配置

项目的 `Dockerfile` 已经包含 PM2：

```dockerfile
# 安装 PM2
RUN npm install -g pm2

# 使用 pm2-runtime 启动
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t chat-server .

# 运行容器
docker run -d \
  --name chat-server \
  -p 11451:11451 \
  -e NODE_ENV=production \
  chat-server

# 查看日志
docker logs -f chat-server
```

### 使用 Docker Compose

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

## 🛠️ 故障排查

### 问题1: PM2 命令找不到

```bash
# 检查全局安装位置
npm root -g

# 检查 PATH
echo $PATH  # Linux/macOS
echo $env:PATH  # Windows

# 重新安装
npm uninstall -g pm2
npm install -g pm2
```

### 问题2: 权限错误

```bash
# Linux/macOS: 使用 sudo
sudo npm install -g pm2

# 或配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g pm2
```

### 问题3: 端口冲突

```bash
# 查看占用端口的进程
pm2 list

# 停止所有 PM2 进程
pm2 kill

# 重新启动
pnpm pm2:start
```

### 问题4: 应用崩溃

```bash
# 查看错误日志
pm2 logs chat-server --err

# 查看详细信息
pm2 show chat-server

# 重启应用
pm2 restart chat-server
```

---

## 📊 监控和日志

### 实时监控

```bash
# 打开监控面板
pm2 monit

# 查看 CPU 和内存使用
pm2 status
```

### 日志管理

```bash
# 查看所有日志
pm2 logs

# 查看特定应用日志
pm2 logs chat-server

# 查看最近 100 行
pm2 logs --lines 100

# 清空日志
pm2 flush

# 重载日志（日志切割后）
pm2 reloadLogs
```

### 日志文件位置

默认日志路径：
- **Linux/macOS**: `~/.pm2/logs/`
- **Windows**: `%USERPROFILE%\.pm2\logs\`

自定义日志路径（在 `ecosystem.config.cjs` 中）：

```javascript
module.exports = {
  apps: [{
    name: 'chat-server',
    script: './server-optimized.js',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
```

---

## 🎯 推荐配置

### 开发环境

不推荐使用 PM2，直接使用：

```bash
pnpm dev  # 支持热重载
```

### 生产环境

推荐使用 PM2：

```bash
# 1. 全局安装 PM2
npm install -g pm2

# 2. 启动应用
pnpm pm2:start

# 3. 配置开机自启
pm2 save
pm2 startup

# 4. 查看状态
pm2 status
```

### Docker/容器环境

使用 `pm2-runtime`（已在 Dockerfile 中配置）：

```dockerfile
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
```

---

## 📚 更多资源

- [PM2 官方文档](https://pm2.keymetrics.io/)
- [PM2 GitHub](https://github.com/Unitech/pm2)
- [生态系统文件](https://pm2.keymetrics.io/docs/usage/application-declaration/)

---

## ✅ 快速检查清单

安装和启动 PM2 前请确认：

- [ ] Node.js 版本在 18-22 范围内
- [ ] 已安装依赖 (`pnpm install`)
- [ ] 已创建 `.env` 文件
- [ ] 端口 11451 未被占用
- [ ] PM2 已安装（全局或本地）
- [ ] 有正确的文件权限

---

**现在可以顺利使用 PM2 管理您的聊天服务器了！** 🎉
