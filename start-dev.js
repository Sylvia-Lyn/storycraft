const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动开发环境...\n');

// 启动后端服务器
console.log('📡 启动后端服务器 (端口 5173)...');
const backend = spawn('node', ['src/server.ts'], {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        PORT: '5173'
    }
});

// 等待2秒后启动前端服务器
setTimeout(() => {
    console.log('🌐 启动前端服务器 (端口 3000)...');
    const frontend = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });

    frontend.on('error', (error) => {
        console.error('❌ 前端服务器启动失败:', error);
    });
}, 2000);

backend.on('error', (error) => {
    console.error('❌ 后端服务器启动失败:', error);
});

// 处理进程退出
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    backend.kill();
    process.exit(0);
}); 