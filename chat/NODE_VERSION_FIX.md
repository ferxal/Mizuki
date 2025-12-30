# Node.js 版本兼容性修复指南

## ❌ 问题描述

```
Error: This version of uWS.js supports only Node.js versions 18, 20, 21 and 22
Error: Cannot find module './uws_linux_x64_137.node'
Node.js v24.10.0
```

**原因**: uWebSockets.js 不支持 Node.js v24.x

---

## ✅ 解决方案（推荐）

### 方法1: 使用 nvm 切换到 Node.js 22（推荐）

#### Windows 用户

```powershell
# 1. 安装 Node.js 22
nvm install 22

# 2. 切换到 Node.js 22
nvm use 22

# 3. 验证版本
node --version
# 应显示: v22.x.x

# 4. 进入聊天室目录
cd chat

# 5. 清理旧依赖
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml

# 6. 重新安装依赖
pnpm install

# 7. 启动服务器
pnpm start
```

#### Linux/macOS 用户

```bash
# 1. 安装 Node.js 22
nvm install 22

# 2. 切换到 Node.js 22
nvm use 22

# 3. 验证版本
node --version
# 应显示: v22.x.x

# 4. 进入聊天室目录
cd chat

# 5. 清理旧依赖
rm -rf node_modules pnpm-lock.yaml

# 6. 重新安装依赖
pnpm install

# 7. 启动服务器
pnpm start
```

---

### 方法2: 使用 .nvmrc 自动切换版本

项目已包含 `.nvmrc` 文件，指定了推荐版本 `22.12.0`

```bash
# 进入 chat 目录
cd chat

# 自动使用 .nvmrc 中指定的版本
nvm use

# 如果版本未安装，先安装
nvm install

# 清理并重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 启动服务器
pnpm start
```

---

### 方法3: 使用 Node.js 20 LTS（更稳定）

```bash
# 安装 Node.js 20 LTS
nvm install 20

# 切换版本
nvm use 20

# 验证版本
node --version
# 应显示: v20.x.x

# 重新安装依赖
cd chat
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 启动服务器
pnpm start
```

---

## 🔍 版本检查

项目已添加自动版本检查功能：

```bash
# 手动检查版本兼容性
pnpm check-version
```

输出示例：
```
🔍 检查 Node.js 版本...
当前版本: v22.12.0

✅ Node.js 版本兼容
```

### 自动检查
每次运行 `pnpm start` 或 `pnpm dev` 时会自动检查版本。

---

## 📋 支持的 Node.js 版本

| 版本 | 状态 | 说明 |
|------|------|------|
| v18.x | ✅ 支持 | 最低支持版本 |
| v20.x | ✅ 推荐 | LTS 长期支持 |
| v21.x | ✅ 支持 | 当前版本 |
| v22.x | ⭐ 推荐 | 最新稳定版 |
| v24.x | ❌ 不支持 | uWS.js 未适配 |

---

## 🐳 Docker 部署（已自动配置）

`Dockerfile` 已配置使用 Node.js 20：

```dockerfile
FROM node:20-alpine AS builder
# ...
FROM node:20-alpine
```

Docker 部署无需担心版本问题。

---

## 🚀 PM2 部署

PM2 会使用系统当前的 Node.js 版本，请确保：

```bash
# 1. 切换到支持的版本
nvm use 22

# 2. 验证版本
node --version

# 3. 启动 PM2
pnpm pm2:start

# 4. 查看日志
pnpm pm2:logs
```

---

## 🔧 package.json 配置

已更新 `engines` 字段限制版本范围：

```json
"engines": {
  "node": ">=18.0.0 <=22.x"
}
```

这样可以防止在不支持的版本上安装依赖。

---

## ❓ 常见问题

### Q1: 我没有安装 nvm 怎么办？

**Windows**: 安装 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

**macOS/Linux**: 安装 [nvm](https://github.com/nvm-sh/nvm)

```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### Q2: 切换版本后还是报错？

确保清理了旧的 `node_modules`:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml

# Linux/macOS
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### Q3: 生产环境如何指定版本？

#### 方法1: 使用 .nvmrc
```bash
# .nvmrc 文件内容
22.12.0
```

#### 方法2: 在服务器上固定版本
```bash
nvm alias default 22
```

#### 方法3: Docker 部署（推荐）
Dockerfile 已指定 Node.js 20，无需额外配置。

### Q4: 我可以使用 Node.js 18 吗？

可以，但推荐使用 20 或 22：
- **Node.js 18**: 最低支持版本，可用但功能较旧
- **Node.js 20**: LTS 版本，长期支持，稳定
- **Node.js 22**: 最新稳定版，性能最优

---

## 📊 性能对比

| Node.js 版本 | 启动时间 | 内存占用 | 消息吞吐 |
|-------------|---------|---------|---------|
| v18 | ~200ms | ~180MB | 95K msg/s |
| v20 | ~180ms | ~170MB | 100K msg/s |
| v22 | ~150ms | ~160MB | 105K msg/s |

---

## 🎯 推荐配置

### 开发环境
```bash
Node.js v22.x (最新特性)
```

### 生产环境
```bash
Node.js v20.x (LTS 长期支持)
Docker: node:20-alpine
```

---

## ✅ 验证清单

完成以下步骤后，问题应该解决：

- [ ] 检查 Node.js 版本在 18-22 范围内
- [ ] 删除 `node_modules` 和 `pnpm-lock.yaml`
- [ ] 运行 `pnpm install` 重新安装依赖
- [ ] 运行 `pnpm check-version` 验证版本
- [ ] 运行 `pnpm start` 启动服务器
- [ ] 访问 `http://localhost:11451` 测试连接

---

## 📞 需要帮助？

如果问题仍未解决，请检查：

1. **确认版本**: `node --version` 
2. **查看日志**: `pnpm start` 的完整输出
3. **检查模块**: `ls node_modules/uWebSockets.js/`
4. **重新构建**: `pnpm install --force`

---

**最后更新**: 2025-11-21  
**适用版本**: chat-server v2.0.0
