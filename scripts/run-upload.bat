@echo off
REM ===========================================
REM B站番剧封面上传脚本
REM ===========================================
REM 此脚本用于设置B站Cookie环境变量并运行上传脚本
REM 
REM 使用方法:
REM 1. 将 "您的...值" 替换为实际的Cookie值
REM 2. 保存此文件
REM 3. 双击运行此脚本
REM 
REM 获取Cookie的方法:
REM 请参考 scripts/README-BILIBILI-UPLOAD.md 中的说明

REM 设置B站Cookie环境变量
set BILIBILI_SESSDATA=您的SESSDATA值
set BILIBILI_CSRF=您的CSRF值
set BILIBILI_DEDEUSERID=您的DedeUserID值
set BILIBILI_SID=您的sid值

REM 检查环境变量设置
node scripts/check-env.js

pause

REM 运行上传脚本
node scripts/upload-bangumi-covers.js

pause