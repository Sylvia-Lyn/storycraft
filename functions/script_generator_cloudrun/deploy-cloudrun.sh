#!/bin/bash

# 云托管部署脚本
# 用于将script_generator迁移到函数型云托管

set -e

echo "🚀 开始部署script_generator到云托管..."

# 检查环境
echo "📋 检查部署环境..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js版本过低，需要16+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
fi

echo "✅ npm检查通过: $(npm -v)"

# 检查腾讯云开发CLI
if ! command -v tcb &> /dev/null; then
    echo "⚠️  腾讯云开发CLI未安装，请先安装: npm install -g @cloudbase/cli"
    echo "   或者使用腾讯云控制台手动部署"
fi

# 进入项目目录
cd "$(dirname "$0")"
echo "📁 当前目录: $(pwd)"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 运行测试
echo "🧪 运行测试..."
if [ -n "$DEEPSEEK_API_KEY" ]; then
    echo "✅ 检测到DEEPSEEK_API_KEY，运行完整测试"
    node test-cloudrun.js
else
    echo "⚠️  未设置DEEPSEEK_API_KEY，跳过AI功能测试"
    echo "   设置环境变量后运行: DEEPSEEK_API_KEY=your_key node test-cloudrun.js"
fi

# 创建部署包
echo "📦 创建部署包..."
DEPLOY_PACKAGE="script_generator_cloudrun_$(date +%Y%m%d_%H%M%S).zip"

# 排除不需要的文件
zip -r "$DEPLOY_PACKAGE" . \
    -x "*.git*" \
    -x "node_modules/*" \
    -x "*.md" \
    -x "test-*.js" \
    -x "deploy-*.sh" \
    -x "*.log" \
    -x ".DS_Store" \
    -x "*.zip"

echo "✅ 部署包创建完成: $DEPLOY_PACKAGE"

# 显示部署信息
echo ""
echo "🎯 部署信息:"
echo "   部署包: $DEPLOY_PACKAGE"
echo "   服务名称: script_generator_cloudrun"
echo "   环境ID: stroycraft-1ghmi4ojd3b4a20b"
echo ""

# 检查是否安装了CLI工具
if command -v tcb &> /dev/null; then
    echo "🔧 检测到腾讯云开发CLI，是否要自动部署？(y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🚀 开始自动部署..."
        
        # 这里需要根据实际的CLI命令进行调整
        # 由于CLI命令可能变化，建议查看最新文档
        echo "⚠️  请手动使用以下命令部署:"
        echo "   tcb cloudrun:deploy $DEPLOY_PACKAGE"
        echo "   或使用腾讯云控制台上传部署包"
    fi
else
    echo "📋 手动部署步骤:"
    echo "1. 登录腾讯云开发控制台"
    echo "2. 进入函数型云托管服务"
    echo "3. 创建新服务或更新现有服务"
    echo "4. 上传部署包: $DEPLOY_PACKAGE"
    echo "5. 配置环境变量:"
    echo "   - DEEPSEEK_API_KEY=your_deepseek_api_key"
    echo "   - DEEPSEEK_API_BASE=https://api.deepseek.com"
    echo "   - GEMINI_API_KEY=your_gemini_api_key (可选)"
    echo "   - GEMINI_API_BASE=https://generativelanguage.googleapis.com (可选)"
    echo "6. 部署服务"
fi

echo ""
echo "✅ 部署准备完成！"
echo "📋 部署后验证步骤:"
echo "1. 健康检查: curl -X GET 'https://your-cloudrun-url/health'"
echo "2. API测试: 使用CLOUDRUN_DEPLOYMENT.md中的测试命令"
echo "3. 更新客户端调用方式: 参考CLOUDRUN_DEPLOYMENT.md"

echo ""
echo "📚 更多信息请查看: CLOUDRUN_DEPLOYMENT.md"
