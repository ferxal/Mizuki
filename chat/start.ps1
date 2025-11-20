###############################################################################
# 聊天服务器启动脚本 (PowerShell)
# 支持直接启动和 PM2 管理两种模式
###############################################################################

param(
    [Parameter(Position=0)]
    [ValidateSet('pm2', 'direct', 'background')]
    [string]$Mode = 'pm2'
)

# 颜色输出函数
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning-Message {
    param([string]$Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

# 检查 Node.js 版本
function Test-NodeVersion {
    Write-Info "检查 Node.js 版本..."
    $result = node check-node-version.js
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Message "Node.js 版本不兼容"
        exit 1
    }
}

# 检查环境变量文件
function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Warning-Message "未找到 .env 文件"
        Write-Info "从 .env.example 创建 .env 文件..."
        Copy-Item ".env.example" ".env"
        Write-Success "已创建 .env 文件，请根据需要修改配置"
    }
}

# 检查 PM2 是否可用
function Test-PM2Available {
    $global = Get-Command pm2 -ErrorAction SilentlyContinue
    $local = Test-Path "node_modules\.bin\pm2.cmd"
    return ($null -ne $global) -or $local
}

# 使用 PM2 启动
function Start-WithPM2 {
    Write-Info "使用 PM2 启动服务器..."
    
    if (Get-Command pm2 -ErrorAction SilentlyContinue) {
        # 全局 PM2
        pm2 start ecosystem.config.cjs
    } else {
        # 本地 PM2
        npx pm2 start ecosystem.config.cjs
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "服务器已启动"
        Write-Info "查看日志: pnpm pm2:logs"
        Write-Info "查看状态: pnpm pm2:status"
        Write-Info "停止服务: pnpm pm2:stop"
    } else {
        Write-Error-Message "启动失败"
        exit 1
    }
}

# 直接启动（前台运行）
function Start-Direct {
    Write-Info "直接启动服务器（前台运行）..."
    node server-optimized.js
}

# 后台启动
function Start-Background {
    Write-Info "后台启动服务器..."
    $job = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        node server-optimized.js *> logs\server.log
    }
    
    $job.Id | Out-File -FilePath ".server.pid"
    Write-Success "服务器已在后台启动 (Job ID: $($job.Id))"
    Write-Info "查看日志: Get-Content logs\server.log -Wait"
    Write-Info "停止服务: Stop-Job -Id $($job.Id); Remove-Job -Id $($job.Id)"
}

# 主函数
function Main {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     聊天服务器启动脚本 v2.0               ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # 检查版本
    Test-NodeVersion
    
    # 检查环境变量
    Test-EnvFile
    
    # 创建日志目录
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    # 根据模式选择启动方式
    switch ($Mode) {
        'pm2' {
            if (Test-PM2Available) {
                Start-WithPM2
            } else {
                Write-Error-Message "PM2 未安装"
                Write-Info "安装方法："
                Write-Host "  1. 全局安装: npm install -g pm2"
                Write-Host "  2. 本地安装: pnpm install"
                Write-Host "  3. 或使用其他启动方式: .\start.ps1 direct"
                exit 1
            }
        }
        'direct' {
            Start-Direct
        }
        'background' {
            Start-Background
        }
    }
}

# 运行主函数
Main
