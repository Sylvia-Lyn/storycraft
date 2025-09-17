#!/bin/bash

# 小说转剧本生成API部署脚本

echo "🚀 开始部署小说转剧本生成API..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在script_generator目录下运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  警告：DEEPSEEK_API_KEY 环境变量未设置"
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  警告：GEMINI_API_KEY 环境变量未设置"
fi

# 运行测试
echo "🧪 运行测试..."
node test.js

if [ $? -eq 0 ]; then
    echo "✅ 测试通过"
else
    echo "❌ 测试失败，停止部署"
    exit 1
fi

# 部署云函数
echo "☁️  部署云函数..."
tcb functions:deploy script_generator

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo ""
    echo "📋 部署信息："
    echo "- 函数名称：script_generator"
    echo "- 环境：stroycraft-1ghmi4ojd3b4a20b"
    echo "- 版本：1.0.0"
    echo ""
    echo "🔗 API地址："
    echo "https://stroycraft-1ghmi4ojd3b4a20b.tcb.qcloud.la/script_generator"
    echo ""
    echo "📚 使用文档："
    echo "请查看 README.md 文件了解详细使用方法"
    echo ""
    echo "🧪 健康检查："
    echo "curl https://stroycraft-1ghmi4ojd3b4a20b.tcb.qcloud.la/script_generator/health"
else
    echo "❌ 部署失败"
    exit 1
fi
