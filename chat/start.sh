#!/bin/bash

###############################################################################
# 聊天服务器启动脚本
# 支持直接启动和 PM2 管理两种模式
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印信息
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 检查 Node.js 版本
check_node_version() {
    info "检查 Node.js 版本..."
    node check-node-version.js
    if [ $? -ne 0 ]; then
        error "Node.js 版本不兼容"
        exit 1
    fi
}

# 检查环境变量文件
check_env() {
    if [ ! -f ".env" ]; then
        warning "未找到 .env 文件"
        info "从 .env.example 创建 .env 文件..."
        cp .env.example .env
        success "已创建 .env 文件，请根据需要修改配置"
    fi
}

# 检查 PM2 是否可用
check_pm2() {
    if command -v pm2 &> /dev/null; then
        return 0
    elif [ -f "node_modules/.bin/pm2" ]; then
        return 0
    else
        return 1
    fi
}

# 使用 PM2 启动
start_with_pm2() {
    info "使用 PM2 启动服务器..."
    
    if command -v pm2 &> /dev/null; then
        # 全局 PM2
        pm2 start ecosystem.config.cjs
    else
        # 本地 PM2
        npx pm2 start ecosystem.config.cjs
    fi
    
    if [ $? -eq 0 ]; then
        success "服务器已启动"
        info "查看日志: pnpm pm2:logs"
        info "查看状态: pnpm pm2:status"
        info "停止服务: pnpm pm2:stop"
    else
        error "启动失败"
        exit 1
    fi
}

# 直接启动（前台运行）
start_direct() {
    info "直接启动服务器（前台运行）..."
    node server-optimized.js
}

# 后台启动（使用 nohup）
start_background() {
    info "后台启动服务器..."
    nohup node server-optimized.js > logs/server.log 2>&1 &
    PID=$!
    echo $PID > .server.pid
    success "服务器已在后台启动 (PID: $PID)"
    info "查看日志: tail -f logs/server.log"
    info "停止服务: kill \$(cat .server.pid)"
}

# 主函数
main() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║     聊天服务器启动脚本 v2.0               ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    
    # 检查版本
    check_node_version
    
    # 检查环境变量
    check_env
    
    # 创建日志目录
    mkdir -p logs
    
    # 根据参数选择启动方式
    case "${1:-pm2}" in
        pm2)
            if check_pm2; then
                start_with_pm2
            else
                error "PM2 未安装"
                info "安装方法："
                echo "  1. 全局安装: npm install -g pm2"
                echo "  2. 本地安装: pnpm install"
                echo "  3. 或使用其他启动方式: ./start.sh direct"
                exit 1
            fi
            ;;
        direct)
            start_direct
            ;;
        background|bg)
            start_background
            ;;
        *)
            error "未知的启动模式: $1"
            echo "用法: $0 [pm2|direct|background]"
            echo "  pm2        - 使用 PM2 管理（推荐生产环境）"
            echo "  direct     - 直接启动（前台运行，适合开发）"
            echo "  background - 后台启动（使用 nohup）"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
