# StoryCraft 部署指南

完整的打包、部署、配置和启动指南。

## 目录
1. [项目信息](#项目信息)
2. [环境要求](#环境要求)
3. [打包构建](#打包构建)
4. [部署选项](#部署选项)
5. [配置说明](#配置说明)
6. [启动运行](#启动运行)
7. [常见问题](#常见问题)

---

## 项目信息

- **项目名称**: StoryCraft
- **项目类型**: React 18 + TypeScript + Vite
- **Node 版本**: 18+ 推荐
- **包管理器**: npm 或 pnpm
- **构建输出目录**: `build/`
- **开发端口**: 3000
- **生产构建命令**: `npm run build`

---

## 环境要求

### 本地开发

```bash
# 系统要求
- Node.js >= 16.0.0 (推荐 18+)
- npm >= 8.0.0 或 pnpm >= 7.0.0
- Git

# 验证版本
node --version
npm --version
```

### 生产环境

```bash
- Node.js >= 16.0.0 (推荐 18+)
- Web 服务器 (Nginx / Apache)
- 或 Node.js HTTP 服务器
```

---

## 打包构建

### 1. 本地开发编译

```bash
# 进入项目目录
cd /path/to/storycraft

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 开发环境运行（含热更新）
npm run dev
# 或
npm run dev:full

# 访问
http://localhost:3000
```

### 2. 生产编译打包

```bash
# 执行 TypeScript 编译和 Vite 构建
npm run build

# 输出结果
# 编译后的文件位于: ./build/
# 输出包含:
# - index.html (主入口)
# - assets/ (JS/CSS/图片等)
# - 其他静态资源
```

### 3. 构建产物说明

```
build/
├── index.html              # 主入口 HTML 文件
├── assets/
│   ├── index-XXXXX.js     # 主 JS bundle
│   ├── index-XXXXX.css    # 主 CSS bundle
│   ├── vendor-XXXXX.js    # 第三方库 bundle
│   └── [其他资源文件]
└── [其他静态资源]
```

---

## 部署选项

### 选项 A：Nginx 静态部署（推荐用于生产）

#### Nginx 配置

```nginx
# /etc/nginx/conf.d/storycraft.conf

upstream api_backend {
    server 18.181.192.140:8321;  # 后端 API 地址
}

server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS（可选）
    # return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;  # 或 listen 80 (如不使用 HTTPS)
    server_name your-domain.com;

    # SSL 证书配置（可选）
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

    # 日志
    access_log /var/log/nginx/storycraft_access.log;
    error_log /var/log/nginx/storycraft_error.log;

    # 性能优化
    client_max_body_size 100M;
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1024;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
        root /var/www/storycraft;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /episode-api/ {
        proxy_pass http://api_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cookie_path / /;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # 其他 API 代理（如需要）
    location /api/ {
        proxy_pass http://localhost:5173/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # SPA 路由配置（重要）
    location / {
        root /var/www/storycraft;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

#### Nginx 部署步骤

```bash
# 1. 编译项目
cd /path/to/storycraft
npm run build

# 2. 创建 web 根目录
sudo mkdir -p /var/www/storycraft

# 3. 复制构建产物
sudo cp -r build/* /var/www/storycraft/

# 4. 设置权限
sudo chown -R www-data:www-data /var/www/storycraft
sudo chmod -R 755 /var/www/storycraft

# 5. 复制 Nginx 配置
sudo cp storycraft.conf /etc/nginx/conf.d/

# 6. 测试 Nginx 配置
sudo nginx -t

# 7. 重启 Nginx
sudo systemctl restart nginx

# 8. 检查状态
sudo systemctl status nginx
```

---

### 选项 B：Node.js 服务器部署

使用 `vite preview` 命令启动生产预览服务器。

```bash
# 构建
npm run build

# 启动 Vite 预览服务器（默认 5173 端口）
npm run preview

# 或使用 npm start
npm start
```

使用 PM2 管理进程（生产推荐）：

```bash
# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'storycraft',
      script: 'npm',
      args: 'run preview',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs storycraft

# 停止应用
pm2 stop storycraft

# 重启应用
pm2 restart storycraft

# 删除应用
pm2 delete storycraft

# 设置开机自启
pm2 startup
pm2 save
```

---

### 选项 C：Docker 容器部署

#### 创建 Dockerfile

```dockerfile
# Dockerfile

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 只需要预览服务器的依赖
COPY package*.json ./
RUN npm ci --only=production && \
    npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/build ./build

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# 启动应用
CMD ["serve", "-s", "build", "-l", "3000"]
```

#### Docker 部署步骤

```bash
# 构建 Docker 镜像
docker build -t storycraft:latest .

# 运行容器（开发测试）
docker run -d \
  --name storycraft \
  -p 3000:3000 \
  storycraft:latest

# 查看容器日志
docker logs -f storycraft

# 停止容器
docker stop storycraft

# 删除容器
docker rm storycraft

# 推送到仓库（可选）
docker tag storycraft:latest your-registry/storycraft:latest
docker push your-registry/storycraft:latest
```

#### Docker Compose 配置

```yaml
# docker-compose.yml

version: '3.8'

services:
  storycraft:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: storycraft
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
    volumes:
      - ./build:/app/build
    networks:
      - storycraft-network

  nginx:
    image: nginx:latest
    container_name: storycraft-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./storycraft.conf:/etc/nginx/conf.d/default.conf
      - /var/www/storycraft:/var/www/storycraft
      - /etc/letsencrypt:/etc/letsencrypt  # SSL 证书（可选）
    depends_on:
      - storycraft
    networks:
      - storycraft-network
    restart: always

networks:
  storycraft-network:
    driver: bridge
```

启动 Docker Compose：

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 配置说明

### 环境配置

#### 开发环境配置 (vite.config.ts)

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // API 代理配置
      '/episode-api': {
        target: 'http://18.181.192.140:8321',  // 后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/episode-api/, ''),
      }
    }
  },
  build: {
    outDir: 'build',  // 输出目录
    emptyOutDir: true,
  }
});
```

#### 生产环境 API 配置

前端使用相对 API 路径（由 Nginx 代理）：

```typescript
// src/services/authService.ts
const STORYAI_API_BASE = '/episode-api/storyai';  // 相对路径

// Nginx 会代理到后端
// /episode-api/ -> http://18.181.192.140:8321/
```

#### 环境变量配置

```bash
# .env.production（如需要）
VITE_API_BASE=/episode-api/storyai
VITE_APP_VERSION=0.1.0
```

在代码中使用：

```typescript
const apiBase = import.meta.env.VITE_API_BASE || '/episode-api/storyai';
```

---

## 启动运行

### 开发环境

```bash
# 进入项目
cd /path/to/storycraft

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产环境

#### 使用 Nginx（推荐）

```bash
# 构建
npm run build

# 复制到 web 根目录
sudo cp -r build/* /var/www/storycraft/

# 通过 Nginx 访问
# http://your-domain.com
```

#### 使用 Node.js 直接启动

```bash
# 构建
npm run build

# 启动预览服务器
npm run preview

# 或使用 serve (需要安装: npm install -g serve)
serve -s build -l 3000

# 访问 http://localhost:3000
```

#### 使用 PM2 管理

```bash
# 启动
pm2 start ecosystem.config.js --name storycraft

# 查看状态
pm2 status

# 重启
pm2 restart storycraft

# 停止
pm2 stop storycraft

# 查看日志
pm2 logs storycraft
```

---

## 常见问题

### Q1: 部署后页面刷新跳转到登录页面

**问题描述**: 登录成功后刷新页面又回到登录页面

**解决方案**:
1. 检查 Nginx 配置的 SPA 路由支持（`try_files $uri $uri/ /index.html`）
2. 确保后端 `/user/heartbeat` 接口正常工作
3. 检查浏览器 Cookie 设置（`credentials: 'include'`）
4. 验证 AuthContext 的 session 验证逻辑

### Q2: API 请求 404 或跨域错误

**问题描述**: 前端无法调用后端 API

**解决方案**:
1. 检查 Nginx 代理配置是否正确
2. 确认后端 API 地址正确（18.181.192.140:8321）
3. 查看网络请求是否被正确代理
4. 检查 CORS 头设置

### Q3: 构建输出文件过大

**问题描述**: 构建后的 bundle 太大

**优化方案**:
```bash
# 分析 bundle 大小
npm install -g vite-plugin-visualizer
# 在 vite.config.ts 中使用 visualizer 插件

# 使用 gzip 压缩
# Nginx 配置中已启用 gzip

# 开启生产优化
npm run build -- --minify esbuild
```

### Q4: 页面样式加载不出来

**问题描述**: CSS 文件 404

**解决方案**:
1. 检查 Nginx 配置的静态文件路径
2. 确保 `root /var/www/storycraft` 正确
3. 检查文件权限（755）
4. 清除浏览器缓存

### Q5: 登录后 sessionStorage 丢失

**问题描述**: 刷新页面后 userId 从 sessionStorage 消失

**原因**: sessionStorage 在标签页关闭时被清空

**解决方案**:
- 确保后端设置了持久 session cookie
- 使用 `credentials: 'include'` 发送 cookie
- heartbeat 接口必须返回有效用户数据

---

## 性能优化建议

### 1. 启用 Gzip 压缩
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1024;
```

### 2. 静态资源缓存
```nginx
location ~* \.(js|css|png|jpg)$ {
  expires 365d;
  add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN
- 将 `build/assets` 目录上传到 CDN
- 在 vite.config.ts 中配置 base 路径

### 4. 代码分割
Vite 自动处理代码分割，优化加载性能

### 5. 监控和日志
```bash
# Nginx 日志分析
tail -f /var/log/nginx/storycraft_access.log

# PM2 日志
pm2 logs storycraft

# Docker 日志
docker logs -f storycraft
```

---

## 安全建议

### 1. HTTPS 配置
```nginx
listen 443 ssl http2;
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
```

### 2. 安全头设置
```nginx
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### 3. 定期更新依赖
```bash
npm audit
npm update
npm audit fix
```

---

## 监控和维护

### 健康检查

```bash
# 检查应用是否正常
curl http://localhost:3000

# 检查 API 连接
curl http://your-domain.com/episode-api/user/heartbeat

# 检查 Nginx 状态
sudo systemctl status nginx
```

### 日志管理

```bash
# 查看错误日志
tail -f /var/log/nginx/storycraft_error.log

# 定期清理旧日志
find /var/log/nginx -name "*.log" -mtime +30 -delete
```

### 自动备份

```bash
# 定期备份构建产物和配置
#!/bin/bash
BACKUP_DIR="/backup/storycraft"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cp -r /var/www/storycraft "$BACKUP_DIR/storycraft_$TIMESTAMP"
cp /etc/nginx/conf.d/storycraft.conf "$BACKUP_DIR/nginx_conf_$TIMESTAMP"

# 只保留最近 7 天的备份
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \;
```

---

## 联系和支持

如有问题，请检查：
1. 日志文件
2. 浏览器控制台错误
3. 网络请求状态
4. 服务器资源使用情况

---

**文档版本**: 1.0
**最后更新**: 2024-11-03
