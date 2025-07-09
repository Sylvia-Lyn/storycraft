import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 启动前端开发服务器
const frontend = spawn('pnpm', ['dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

console.log('🚀 启动 StoryCraft 开发服务器...');
console.log('📝 使用腾讯云 CloudBase 进行身份认证和数据库管理');

frontend.on('error', (error) => {
    console.error('❌ 启动失败:', error);
});

frontend.on('close', (code) => {
    console.log(`📋 开发服务器已关闭，退出码: ${code}`);
}); 