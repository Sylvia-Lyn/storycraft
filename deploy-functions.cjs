const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 开始部署云函数...\n');

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

    // 部署works_manager云函数
    console.log('\n📦 部署 works_manager 云函数...');
    const worksManagerPath = path.join(__dirname, 'functions', 'works_manager');

    execSync(`cloudbase fn deploy works_manager -e stroycraft-1ghmi4ojd3b4a20b`, {
        stdio: 'inherit',
        cwd: worksManagerPath
    });

    console.log('\n📦 部署 prompt_manager 云函数...');
    const promptManagerPath = path.join(__dirname, 'functions', 'prompt_manager');

    execSync(`cloudbase fn deploy prompt_manager -e stroycraft-1ghmi4ojd3b4a20b`, {
        stdio: 'inherit',
        cwd: promptManagerPath
    });

    console.log('\n✅ 云函数部署成功！');
    console.log('\n📋 接下来需要配置：');
    console.log('1. 在腾讯云开发控制台创建 works 和 prompts 数据集合');
    console.log('2. 设置数据库权限');
    console.log('3. 配置用户身份验证');

} catch (error) {
    console.error('❌ 部署失败:', error.message);
    console.log('\n💡 如果遇到权限问题，请先运行：');
    console.log('cloudbase login');
} 