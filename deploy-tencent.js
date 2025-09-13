import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('开始构建项目...');

// 1. 构建项目
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('构建完成!');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
}

// 2. 检查构建输出
const buildDir = join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.error('构建目录不存在:', buildDir);
  process.exit(1);
}

console.log('构建文件列表:');
const files = fs.readdirSync(buildDir, { recursive: true });
files.forEach(file => console.log('  ', file));

console.log('\n部署准备完成!');
console.log('请手动将 build/ 目录下的文件上传到腾讯云静态网站托管');
console.log('或者使用腾讯云 CLI 工具自动部署');
