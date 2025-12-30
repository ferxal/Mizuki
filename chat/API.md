# 聊天室 API 文档

## WebSocket API

### 连接

```javascript
const ws = new WebSocket('ws://localhost:11451');
```

### 消息格式

所有消息都使用JSON格式。

#### 1. 设置昵称

**发送：**
```json
{
  "type": "set_nickname",
  "nickname": "用户名"
}
```

**响应：**
```json
{
  "type": "nickname_set",
  "nickname": "用户名",
  "timestamp": 1234567890
}
```

#### 2. 发送公共消息

**发送：**
```json
{
  "type": "public",
  "content": "消息内容"
}
```

**接收（广播给所有人）：**
```json
{
  "type": "public",
  "nickname": "发送者昵称",
  "content": "消息内容",
  "timestamp": 1234567890
}
```

#### 3. 发送私聊消息

**发送：**
```json
{
  "type": "private",
  "target": "目标用户昵称",
  "content": "消息内容"
}
```

**接收（目标用户）：**
```json
{
  "type": "private",
  "from": "发送者昵称",
  "content": "消息内容",
  "timestamp": 1234567890
}
```

**接收（发送者确认）：**
```json
{
  "type": "private",
  "to": "目标用户昵称",
  "content": "消息内容",
  "timestamp": 1234567890
}
```

#### 4. 心跳

**发送：**
```json
{
  "type": "heartbeat"
}
```

**响应：**
```json
{
  "type": "heartbeat",
  "timestamp": 1234567890
}
```

#### 5. 获取用户列表

**发送：**
```json
{
  "type": "get_users"
}
```

**响应：**
```json
{
  "type": "user_list",
  "users": [
    {
      "id": "用户ID",
      "nickname": "昵称"
    }
  ],
  "count": 2,
  "timestamp": 1234567890
}
```

#### 6. 获取统计信息

**发送：**
```json
{
  "type": "get_stats"
}
```

**响应：**
```json
{
  "type": "stats",
  "stats": {
    "totalConnections": 100,
    "currentConnections": 10,
    "totalMessages": 500,
    "publicMessages": 400,
    "privateMessages": 100,
    "peakConnections": 50,
    "uptime": 3600000,
    "currentUsers": 10
  },
  "timestamp": 1234567890
}
```

### 系统消息

#### 用户加入
```json
{
  "type": "join",
  "nickname": "新用户昵称",
  "timestamp": 1234567890
}
```

#### 用户离开
```json
{
  "type": "leave",
  "nickname": "离开用户昵称",
  "timestamp": 1234567890
}
```

#### 错误消息
```json
{
  "type": "error",
  "message": "错误描述",
  "timestamp": 1234567890
}
```

---

## HTTP REST API

所有API端点需要在请求头中包含API密钥：

```
X-API-Key: your-secret-api-key-here
```

### 1. 获取服务器统计信息

**请求：**
```
GET /api/stats
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalConnections": 100,
    "currentConnections": 10,
    "totalMessages": 500,
    "publicMessages": 400,
    "privateMessages": 100,
    "startTime": 1234567890,
    "peakConnections": 50,
    "uptime": 3600000,
    "currentUsers": 10,
    "config": {
      "maxConnections": 10000,
      "maxMessagesPerSecond": 100
    }
  },
  "timestamp": 1234567890
}
```

### 2. 获取在线用户列表

**请求：**
```
GET /api/users
```

**响应：**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "u1abc_123",
        "nickname": "Alice",
        "connectedAt": 1234567890,
        "messageCount": 50
      }
    ],
    "count": 1
  },
  "timestamp": 1234567890
}
```

### 3. 健康检查

**请求：**
```
GET /api/health
```

**响应：**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 3600000,
  "connections": 10,
  "timestamp": 1234567890
}
```

---

## 使用示例

### JavaScript/Node.js

```javascript
// WebSocket连接
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:11451');

ws.on('open', () => {
  // 设置昵称
  ws.send(JSON.stringify({
    type: 'set_nickname',
    nickname: 'Alice'
  }));
  
  // 发送公共消息
  ws.send(JSON.stringify({
    type: 'public',
    content: 'Hello everyone!'
  }));
  
  // 发送私聊
  ws.send(JSON.stringify({
    type: 'private',
    target: 'Bob',
    content: 'Hi Bob!'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('收到消息:', message);
});

// REST API调用
const axios = require('axios');

async function getStats() {
  const response = await axios.get('http://localhost:11451/api/stats', {
    headers: {
      'X-API-Key': 'your-secret-api-key-here'
    }
  });
  console.log('统计信息:', response.data);
}
```

### Python

```python
import asyncio
import websockets
import json

async def chat():
    uri = "ws://localhost:11451"
    async with websockets.connect(uri) as websocket:
        # 设置昵称
        await websocket.send(json.dumps({
            "type": "set_nickname",
            "nickname": "Alice"
        }))
        
        # 发送消息
        await websocket.send(json.dumps({
            "type": "public",
            "content": "Hello from Python!"
        }))
        
        # 接收消息
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            print(f"收到消息: {data}")

asyncio.run(chat())
```

### cURL (REST API)

```bash
# 获取统计信息
curl -H "X-API-Key: your-secret-api-key-here" \
     http://localhost:11451/api/stats

# 获取用户列表
curl -H "X-API-Key: your-secret-api-key-here" \
     http://localhost:11451/api/users

# 健康检查
curl http://localhost:11451/api/health
```

---

## 性能限制

- **最大连接数**: 10,000（可配置）
- **消息速率限制**: 100条/秒/用户（可配置）
- **最大消息长度**: 1000字符（可配置）
- **昵称长度**: 2-20字符（可配置）
- **心跳超时**: 60秒（可配置）

---

## 错误代码

- `昵称长度必须在2-20个字符之间` - 昵称验证失败
- `该昵称已被使用` - 昵称冲突
- `请先设置昵称` - 未设置昵称就发送消息
- `用户不在线` - 私聊目标用户不存在
- `消息发送过快，请稍后再试` - 触发速率限制
- `消息长度不能超过1000字符` - 消息过长
- `消息处理失败` - 服务器内部错误

---

## 配置说明

在 `.env` 文件中配置服务器参数：

```env
# 基础配置
PORT=11451
HOST=0.0.0.0
NODE_ENV=production

# 性能配置
MAX_CONNECTIONS=10000
MAX_MESSAGES_PER_SECOND=100

# API配置
ENABLE_API=true
API_KEY=your-secret-key

# 日志配置
LOG_LEVEL=info
```

更多配置选项请参考 `.env.example` 文件。
