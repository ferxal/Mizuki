# B站番剧封面上传脚本

## 功能说明

这个脚本用于自动下载Bangumi番剧封面并上传到Bilibili图床。

## 前置要求

1. Node.js 14+ 
2. 有效的B站登录Cookie

## 获取Cookie方法

### 方法一：浏览器开发者工具

1. 登录B站 (https://www.bilibili.com)
2. 打开开发者工具 (F12)
3. 进入Application/存储 -> Cookies -> https://www.bilibili.com
4. 找到以下Cookie：
   - `SESSDATA` - 用户会话凭证
   - `bili_jct` - CSRF Token
   - `DedeUserID` - 用户ID
   - `sid` - 会话ID

### 方法二：使用浏览器扩展

1. 安装Cookie编辑器扩展
2. 导出Cookie并查找SESSDATA和bili_jct

## 设置环境变量

### 方法一：直接设置环境变量

#### Windows (PowerShell)
```powershell
$env:BILIBILI_SESSDATA="你的SESSDATA值"
$env:BILIBILI_CSRF="你的bili_jct值"
$env:BILIBILI_DEDEUSERID="你的DedeUserID值"
$env:BILIBILI_SID="你的sid值"
```

#### Linux/macOS (Bash)
```bash
export BILIBILI_SESSDATA="你的SESSDATA值"
export BILIBILI_CSRF="你的bili_jct值"
export BILIBILI_DEDEUSERID="你的DedeUserID值"
export BILIBILI_SID="你的sid值"
```

### 方法二：使用脚本设置环境变量

项目提供了两种脚本用于设置环境变量并运行上传脚本：

1. 批处理脚本 (Windows): `scripts/run-upload.bat`
2. PowerShell脚本 (Windows): `scripts/run-upload.ps1`

使用方法：
1. 选择合适的脚本:
   - Windows CMD用户: `run-upload.bat`
   - PowerShell用户: `run-upload.ps1`
2. 右键点击选择的脚本文件，选择"编辑"或使用文本编辑器打开
3. 找到环境变量设置部分
4. 将 `您的...值` 替换为实际的Cookie值
   - 请参考上方"获取Cookie"部分的说明来获取这些值
5. 保存文件
6. 运行脚本

注意：这些脚本文件中的示例值仅为演示，请务必替换为您的实际Cookie值。



## 测试Cookie有效性

运行测试脚本验证Cookie是否有效：

```bash
node scripts/test-cookie.js <SESSDATA> <CSRF> [DedeUserID] [sid]
```

示例：
```bash
node scripts/test-cookie.js abc123def456 xyz789 123456789 abcdef123456789
```

## 检查环境变量设置

运行检查脚本验证环境变量是否正确设置：

```bash
# 直接运行脚本
node scripts/check-env.js

# 或使用npm命令
npm run check-bilibili-env
```

检查脚本会显示每个环境变量的设置情况，并在有缺失时提供解决方法。

## 使用脚本

1. 首先设置环境变量（参考上方"设置环境变量"部分）
2. (可选) 运行检查脚本验证环境变量是否正确设置：

```bash
node scripts/check-env.js
```

3. 运行上传脚本：

```bash
node scripts/upload-bangumi-covers.js
```

上传脚本会自动检查环境变量设置，如果未正确设置会显示错误信息和解决方法。

**重要提示：请勿在代码中直接填写Cookie信息，应始终使用环境变量以确保安全性。**

## 调试模式

脚本支持调试模式，默认只处理前3张图片：

```bash
# 启用调试模式（默认）
node scripts/upload-bangumi-covers.js

# 处理所有图片（禁用调试）
DEBUG_MODE=false node scripts/upload-bangumi-covers.js
```

## 注意事项

1. Cookie有效期通常为30天，过期后需要重新获取
2. 不要泄露你的Cookie信息
3. 脚本会自动缓存已处理的图片，避免重复上传
4. 上传的图片会保存在B站图床，可用于文章、动态等
5. DedeUserID和sid参数对于上传功能同样重要，缺少会导致上传失败

## 故障排除

### 常见错误

- "账号未登录": Cookie无效或过期，或环境变量未正确设置
- "网络错误": 检查网络连接
- "图片下载失败": 源站图片不可用
- "环境变量未设置": 脚本检测到必要的环境变量为空值

### Cookie过期

如果遇到账号未登录的错误，并且确认环境变量已正确设置，则可能是Cookie已过期。请重新登录B站获取新的Cookie并更新环境变量设置。

### 解决方法

1. 重新登录B站获取新的Cookie
2. 检查网络连接
3. 验证Cookie有效性
4. 检查环境变量是否正确设置，确保所有四个参数(SESSDATA、bili_jct、DedeUserID、sid)都已设置且不为空
5. 使用项目提供的脚本(run-upload.bat或run-upload.ps1)来设置环境变量并运行上传脚本
6. 如果确认环境变量已正确设置但仍遇到账号未登录错误，可能是Cookie过期，请重新获取Cookie并更新环境变量设置

## 文件说明

- `upload-bangumi-covers.js` - 主上传脚本
- `test-cookie.js` - Cookie测试脚本
- `.bangumi-cache.json` - 处理缓存文件（自动生成）
- `temp/` - 临时下载目录（自动创建）

## 技术支持

如有问题，请检查：
1. Cookie是否正确设置
2. 网络连接是否正常
3. Node.js版本是否符合要求