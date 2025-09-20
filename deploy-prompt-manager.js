const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 开始部署 prompt_manager 云函数...\n');

try {
    // 检查是否安装了云开发CLI
    try {
        execSync('cloudbase --version', { stdio: 'pipe' });
        console.log('✅ 云开发CLI已安装');
    } catch (error) {
        console.log('❌ 云开发CLI未安装，请先安装：');
        console.log('npm install -g @cloudbase/cli');
        process.exit(1);
    }

    // 进入prompt_manager目录
    const functionPath = path.join(__dirname, 'functions', 'prompt_manager');
    console.log(`📁 函数目录: ${functionPath}`);

    // 安装依赖
    console.log('\n📦 安装依赖...');
    execSync('npm install', {
        stdio: 'inherit',
        cwd: functionPath
    });

    // 部署云函数
    console.log('\n🚀 部署 prompt_manager 云函数...');
    execSync(`cloudbase fn deploy prompt_manager -e stroycraft-1ghmi4ojd3b4a20b`, {
        stdio: 'inherit',
        cwd: functionPath
    });

    console.log('\n✅ prompt_manager 云函数部署成功！');
    console.log('\n📋 接下来需要配置：');
    console.log('1. 在腾讯云开发控制台创建 prompts 数据集合');
    console.log('2. 设置数据库权限为"所有用户可读写"');
    console.log('3. 测试API端点');

} catch (error) {
    console.error('❌ 部署失败:', error.message);
    console.log('\n💡 如果遇到权限问题，请先运行：');
    console.log('cloudbase login');
    console.log('\n💡 如果遇到依赖问题，请检查 package.json 文件');
}
