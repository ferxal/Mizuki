# ===========================================
# B站番剧封面上传脚本
# ===========================================
# 此脚本用于设置B站Cookie环境变量并运行上传脚本
# 
# 使用方法:
# 1. 将 "您的...值" 替换为实际的Cookie值
# 2. 保存此文件
# 3. 在PowerShell中运行此脚本
# 
# 获取Cookie的方法:
# 请参考 scripts/README-BILIBILI-UPLOAD.md 中的说明

# 设置B站Cookie环境变量
$env:BILIBILI_SESSDATA="您的SESSDATA值"
$env:BILIBILI_CSRF="您的CSRF值"
$env:BILIBILI_DEDEUSERID="您的DedeUserID值"
$env:BILIBILI_SID="您的sid值"

# 检查环境变量设置
node scripts/check-env.js

# 暂停以便用户查看检查结果
Read-Host "按Enter键继续运行上传脚本"

# 运行上传脚本
node scripts/upload-bangumi-covers.js