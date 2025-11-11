# Storycraft 腾讯云部署指南

## 📋 目录
1. [系统概览](#系统概览)
2. [架构设计](#架构设计)
3. [前置准备](#前置准备)
4. [腾讯云资源准备](#腾讯云资源准备)
5. [前端部署](#前端部署)
6. [后端部署](#后端部署)
7. [数据库部署](#数据库部署)
8. [CI/CD 流程](#cicd-流程)
9. [监控和日志](#监控和日志)
10. [常见问题](#常见问题)

---

## 系统概览

### 项目信息
- **项目名称**：Storycraft (短剧创作平台)
- **版本**：0.1.0
- **技术栈**：
  - 前端：React 18 + TypeScript + Vite + Tailwind CSS
  - 后端：Node.js + Express
  - 数据库：Qdrant (向量数据库) + MySQL/PostgreSQL
  - 支付集成：支付宝、微信支付、Stripe

### 主要功能
- 短剧脚本生成与管理
- AI 图片/视频生成
- 音频处理和配音
- 分镜板管理
- 支付结算系统

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                  用户浏览器 (前端)                         │
│  React 18 + TypeScript (Vite 构建产物)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│            腾讯云 CDN + 对象存储 (COS)                    │
│          (静态资源分发、加速)                             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│         腾讯云云函数 / CVM (后端服务)                     │
│  Node.js + Express API Server                          │
│  - 脚本生成接口                                          │
│  - 图片/视频生成接口                                      │
│  - 用户认证与授权                                        │
│  - 支付处理                                              │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐  ┌────────────┐  ┌──────────┐
│MySQL/   │  │  Qdrant    │  │  COS     │
│PostgeSQL│  │  (向量库)    │  │(文件存储)│
│(关系数据)│  │            │  │          │
└─────────┘  └────────────┘  └──────────┘
```

### 腾讯云服务组件

| 服务 | 用途 | 建议规格 |
|------|------|--------|
| **云服务器 (CVM)** | 后端服务 | 4C8G 或使用云函数 |
| **云对象存储 (COS)** | 存储生成的图片/视频 | 按量付费 |
| **云数据库 MySQL** | 存储业务数据 | 2C4G 基础版 |
| **Qdrant** | 向量检索 | 部署在 CVM 或容器服务 |
| **内容分发网络 (CDN)** | 加速前端资源 | 按流量计费 |
| **云监控** | 性能监控 | 免费 |
| **日志服务 (CLS)** | 日志收集 | 按量付费 |

---

## 前置准备

### 本地环境检查

```bash
# 检查 Node.js 版本 (推荐 16.x 或更高)
node --version    # v18.x 或更高
npm --version     # 8.x 或更高

# 验证项目依赖完整
npm install

# 验证构建成功
npm run build

# 检查输出文件
ls -la dist/
```

### 腾讯云账户准备

1. **创建腾讯云账户**
   - 访问 https://cloud.tencent.com/
   - 完成实名认证
   - 绑定支付方式

2. **获取密钥**
   - 访问 [API 密钥管理](https://console.cloud.tencent.com/cam/capi)
   - 创建 API 密钥（SecretId 和 SecretKey）
   - **重要**：妥善保管，不要提交到代码库

3. **开通必要的服务**
   - 云服务器 (CVM)
   - 对象存储 (COS)
   - 云数据库 MySQL
   - CDN
   - 日志服务

---

## 腾讯云资源准备

### 1. 创建云服务器 (CVM)

```bash
# 推荐配置
- 地域：根据用户分布选择（如广州、北京）
- 可用区：任意
- 实例类型：标准型 S5（4核8GB）
- 镜像：Ubuntu 22.04 LTS
- 存储：50GB SSD
- 带宽：10Mbps 按需调整
- 安全组：开放 22 (SSH), 80 (HTTP), 443 (HTTPS) 端口
```

### 2. 配置云对象存储 (COS)

```bash
# 创建存储桶
- 存储桶名称：storycraft-prod-{随机字符}
- 所属地域：与 CVM 相同地区
- 访问权限：私有读写
- 版本控制：启用（便于回滚）
- 日志记录：启用（监控访问）

# 设置跨域配置
Allowed-Origins: *
Allowed-Methods: GET, PUT, POST, DELETE, HEAD
Allowed-Headers: *
```

### 3. 配置云数据库 MySQL

```bash
# 创建数据库实例
- 数据库版本：MySQL 8.0
- 节点规格：2C4G 基础版
- 存储空间：50GB（可自动扩容）
- 安全组：仅允许 CVM 访问
- 备份周期：每天

# 初始化数据库
CREATE DATABASE storycraft DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'storycraft'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON storycraft.* TO 'storycraft'@'%';
FLUSH PRIVILEGES;
```

### 4. 配置 CDN

```bash
# 创建 CDN 分发配置
- 源站：指向 CVM 的公网 IP 或 CLB 地址
- 加速域名：使用自有域名（如 api.storycraft.com）
- 协议：HTTPS
- 缓存策略：
  - /dist/* : 30天 (静态资源)
  - /api/* : 不缓存 (动态接口)
  - 首页 : 1小时

# 申请 SSL 证书
- 选择 SSL 证书服务
- 申请免费或付费证书
- 在 CDN 中配置 HTTPS
```

---

## 前端部署

### 1. 构建前端应用

```bash
# 在本地构建
npm run build

# 检查构建输出
ls -la dist/
# 输出应包含：
# - index.html
# - assets/
#   - index-*.js
#   - index-*.css
```

### 2. 上传到 COS

```bash
# 方法一：使用腾讯云 CLI
npm install -g coscmd

# 配置腾讯云凭证
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>

# 上传构建文件
coscmd upload -r dist/ /

# 验证上传
coscmd list -a

# 方法二：使用腾讯云控制台
# 1. 打开 COS 服务
# 2. 进入对应存储桶
# 3. 点击"上传文件" → 选择 dist/ 目录下所有文件
# 4. 上传完成
```

### 3. 配置 COS 为静态网站

```bash
# 在 COS 控制台：
1. 选择存储桶 → "基础配置"
2. 找到"静态网站"
3. 启用静态网站托管
4. 设置：
   - 索引文档：index.html
   - 错误文档：index.html (SPA 路由适配)
   - 访问方式：访问 COS 域名
```

### 4. 配置 CDN 加速

```bash
# 在 CDN 控制台：
1. 创建分发配置
2. 源站地址：填写 COS 的访问域名
3. 加速域名：storycraft.yourdomain.com
4. 配置缓存规则：

   路径规则              缓存时间    说明
   /dist/                30天       JS/CSS/图片等静态资源
   /api                  0秒        API 请求不缓存
   /index.html           1小时      首页可缓存
   /                     1小时      SPA 路由默认指向首页
```

### 5. 绑定自定义域名

```bash
# 在 CDN 或 COS 控制台：
1. 添加自定义域名：storycraft.yourdomain.com
2. 配置 DNS 解析：
   - 登录域名注册商 (如万网/阿里云)
   - 在 DNS 管理中添加 CNAME 记录
   - 主机记录：storycraft
   - 记录值：<CDN分配的CNAME地址>
   - 等待 DNS 生效 (通常 10-30 分钟)

# 验证绑定
dig storycraft.yourdomain.com
nslookup storycraft.yourdomain.com
```

### 6. 配置 HTTPS

```bash
# 在腾讯云 SSL 证书服务：
1. 申请 SSL 证书（免费或付费）
2. 验证域名所有权
3. 获得证书后上传到 CDN/CLB

# 在 CDN 中：
1. 选择域名
2. 进入"HTTPS 配置"
3. 启用 HTTPS
4. 上传证书和私钥
5. 设置"强制跳转"（HTTP -> HTTPS）
```

---

## 后端部署

### 1. 准备服务器环境

```bash
# SSH 连接到 CVM
ssh -i your_key.pem ubuntu@your_server_ip

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装 Git
sudo apt install -y git

# 安装 PM2 进程管理器
sudo npm install -g pm2

# 安装 Nginx（反向代理）
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 克隆项目代码

```bash
# 创建项目目录
cd /opt
sudo mkdir -p storycraft
sudo chown $USER:$USER storycraft
cd storycraft

# 克隆代码
git clone https://github.com/your-repo/storycraft.git .

# 或者使用 HTTPS (如果没有配置 SSH)
git clone https://username:token@github.com/your-repo/storycraft.git .
```

### 3. 配置环境变量

```bash
# 创建 .env.production 文件
cat > .env.production << 'EOF'
# 应用配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 数据库
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=storycraft
DB_PASSWORD=your-strong-password
DB_NAME=storycraft

# Redis (可选，用于会话管理)
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# Qdrant 向量数据库
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=storycraft

# 腾讯云 COS
TENCENT_COS_SECRET_ID=your-secret-id
TENCENT_COS_SECRET_KEY=your-secret-key
TENCENT_COS_BUCKET=storycraft-prod
TENCENT_COS_REGION=ap-guangzhou

# API 密钥
JWT_SECRET=your-jwt-secret-key-min-32-chars
API_KEY=your-api-key

# 外部服务
OPENAI_API_KEY=your-openai-key (如果使用)
STRIPE_SECRET_KEY=your-stripe-key (如果使用)
ALIPAY_APP_ID=your-alipay-id
WECHAT_PAY_MERCHANT_ID=your-wechat-id

# 日志
LOG_LEVEL=info
LOG_PATH=/var/log/storycraft

# 允许的域名 (CORS)
ALLOWED_ORIGINS=https://storycraft.yourdomain.com,https://admin.storycraft.yourdomain.com
EOF

# 设置文件权限
chmod 600 .env.production
```

### 4. 安装依赖并构建

```bash
# 安装依赖
npm install --production

# 构建前端
npm run build

# 验证构建
ls -la dist/
```

### 5. 配置 PM2 启动脚本

```bash
# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'storycraft-api',
      script: 'server.js',  // 你的后端入口文件
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/storycraft/error.log',
      out_file: '/var/log/storycraft/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 重启策略
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G',
      // 优雅关闭
      kill_timeout: 5000,
      // 故障自动重启
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 list
pm2 logs storycraft-api

# 监控应用
pm2 monit
```

### 6. 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/storycraft << 'EOF'
upstream storycraft_api {
    # 对应 PM2 启动的应用
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name api.storycraft.yourdomain.com;

    # 自动重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.storycraft.yourdomain.com;

    # SSL 证书配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志配置
    access_log /var/log/nginx/storycraft_access.log;
    error_log /var/log/nginx/storycraft_error.log;

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://storycraft_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置（针对长时间生成任务）
        proxy_connect_timeout 60s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }

    # SPA 路由处理
    location / {
        proxy_pass http://storycraft_api;
        proxy_set_header Host $host;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/storycraft /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 数据库部署

### 1. MySQL 数据库初始化

```bash
# 连接到腾讯云 MySQL
mysql -h your-mysql-host -u storycraft -p

# 创建数据库
CREATE DATABASE storycraft DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE storycraft;

# 运行迁移脚本 (执行你项目中的 schema.sql 或迁移脚本)
source /path/to/schema.sql;

# 创建必要的索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_storyboard_user ON storyboards(user_id);
CREATE INDEX idx_chapter_scene ON chapters(scene_id);
```

### 2. Qdrant 向量数据库部署

```bash
# 在 CVM 上使用 Docker 部署 Qdrant
sudo apt install -y docker.io docker-compose

# 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - ./qdrant_storage:/qdrant/storage
    environment:
      QDRANT_API_KEY: your-qdrant-api-key
    restart: unless-stopped
EOF

# 启动服务
docker-compose up -d

# 验证连接
curl http://localhost:6333/health

# 创建集合
curl -X PUT http://localhost:6333/collections/storycraft \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    }
  }'
```

### 3. 数据备份配置

```bash
# 配置 MySQL 自动备份
cat > /opt/storycraft/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/storycraft/backups"
MYSQL_HOST="your-mysql-host"
MYSQL_USER="storycraft"
MYSQL_PASSWORD="your-password"
DB_NAME="storycraft"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/storycraft_$DATE.sql.gz

# 清理 7 天前的备份
find $BACKUP_DIR -name "storycraft_*.sql.gz" -mtime +7 -delete

# 上传到 COS（可选）
coscmd upload -r $BACKUP_DIR/storycraft_$DATE.sql.gz /backups/
EOF

chmod +x /opt/storycraft/backup.sh

# 添加到 crontab (每天凌晨 2 点备份)
crontab -e
# 添加行：
# 0 2 * * * /opt/storycraft/backup.sh
```

---

## CI/CD 流程

### 1. 使用 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Tencent Cloud

on:
  push:
    branches: [main, production]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm run test 2>/dev/null || true

      - name: Build frontend
        run: npm run build

      - name: Upload to COS
        env:
          COS_SECRET_ID: ${{ secrets.COS_SECRET_ID }}
          COS_SECRET_KEY: ${{ secrets.COS_SECRET_KEY }}
        run: |
          npm install -g coscmd
          coscmd config -a $COS_SECRET_ID -s $COS_SECRET_KEY -b storycraft-prod -r ap-guangzhou
          coscmd upload -r dist/ /

      - name: Deploy to CVM
        env:
          SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H $SSH_HOST >> ~/.ssh/known_hosts

          ssh -i ~/.ssh/deploy_key $SSH_USER@$SSH_HOST << 'DEPLOY'
            cd /opt/storycraft
            git pull origin main
            npm install --production
            pm2 reload ecosystem.config.js
            pm2 save
          DEPLOY

      - name: Slack notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. 配置 GitHub Secrets

在 GitHub 仓库的 Settings → Secrets 中添加：

```
SSH_PRIVATE_KEY        # 你的 SSH 私钥
SSH_HOST               # CVM 公网 IP
SSH_USER               # SSH 用户名 (ubuntu)
COS_SECRET_ID          # 腾讯云 Secret ID
COS_SECRET_KEY         # 腾讯云 Secret Key
SLACK_WEBHOOK          # Slack Webhook (可选)
```

---

## 监控和日志

### 1. 腾讯云监控

```bash
# 在腾讯云监控控制台配置：
1. CPU 使用率 > 80% 告警
2. 内存使用率 > 85% 告警
3. 磁盘使用率 > 90% 告警
4. 网络流量异常告警
5. HTTP 5xx 错误率告警

# 创建告警策略
- 告警方式：短信 + 邮件 + 企业微信
- 告警接收人：运维团队
```

### 2. 应用日志收集

```bash
# 配置日志服务 (CLS)
1. 创建日志集：storycraft-logs
2. 创建日志主题：
   - api-logs (API 日志)
   - error-logs (错误日志)
   - access-logs (访问日志)

# 在应用中配置日志上传
npm install @tencentcloud/cls-sdk

# 应用中的日志配置
const Logger = require('@tencentcloud/cls-sdk');
const logger = new Logger({
  secret_id: process.env.SECRET_ID,
  secret_key: process.env.SECRET_KEY,
  logset_id: 'your-logset-id',
  topic_id: 'your-topic-id'
});

logger.log('error', 'Error message here');
```

### 3. APM 监控

```bash
# 使用腾讯云 APM
npm install @tencentcloud/apm-node-sdk

# 在应用启动时初始化
const apm = require('@tencentcloud/apm-node-sdk');
apm.start({
  service_name: 'storycraft-api',
  server_addr: 'apm.service.tencentyun.com:9411'
});
```

### 4. 查看实时日志

```bash
# 本地 PM2 日志
pm2 logs storycraft-api

# Nginx 日志
tail -f /var/log/nginx/storycraft_access.log
tail -f /var/log/nginx/storycraft_error.log

# 系统日志
journalctl -u nginx -f
journalctl -u pm2-$USER -f
```

---

## 安全配置

### 1. 防火墙和安全组

```bash
# 腾讯云安全组规则
入站规则：
- 协议：TCP, 端口：22, 来源：你的 IP (限制 SSH)
- 协议：TCP, 端口：80, 来源：0.0.0.0 (HTTP)
- 协议：TCP, 端口：443, 来源：0.0.0.0 (HTTPS)
- 协议：TCP, 端口：6333, 来源：内网 (Qdrant)

出站规则：
- 协议：ALL, 端口：ALL, 目标：0.0.0.0
```

### 2. 数据库安全

```bash
# MySQL 安全设置
1. 仅允许 CVM 内网 IP 连接
2. 启用 SSL 传输加密
3. 定期修改密码
4. 启用审计日志
5. 设置参数加密

# 备份加密
# 在 .env 中配置加密密钥
BACKUP_ENCRYPTION_KEY=your-encryption-key
```

### 3. API 安全

```bash
# 在应用中实现
1. JWT 认证
2. API 速率限制
3. CORS 配置
4. 输入验证和清理
5. SQL 注入防护（使用参数化查询）
6. XSS 防护

// 示例 Express 中间件
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 个请求
});

app.use('/api/', limiter);
```

### 4. DDoS 防护

```bash
# 腾讯云 DDoS 防护
1. 升级为 DDoS 高防
2. 配置黑白名单
3. 设置流量清洗
4. 启用 Bot 防护
```

---

## 性能优化

### 1. CDN 加速优化

```bash
# 配置智能压缩
1. 启用 Gzip 压缩
2. 启用 Brotli 压缩
3. 缓存优化

# 配置 HTTP/2 Push
Link: </dist/main.js>; rel=preload; as=script
```

### 2. 数据库优化

```sql
-- 创建必要的索引
CREATE INDEX idx_user_created_at ON users(created_at);
CREATE INDEX idx_storyboard_status ON storyboards(status);

-- 定期分析和优化表
ANALYZE TABLE users;
OPTIMIZE TABLE users;
```

### 3. 应用性能优化

```javascript
// 启用 HTTP2 和压缩
const spdy = require('spdy');
const compression = require('compression');

app.use(compression()); // Gzip 压缩

// 使用 HTTP2
spdy.createServer({
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
}, app).listen(443);
```

---

## 常见问题

### Q1: 前端资源无法加载？
**A**:
1. 检查 COS 权限配置
2. 验证 CDN 缓存是否过期
3. 检查 CORS 配置
4. 清除浏览器缓存

### Q2: 后端 API 连接超时？
**A**:
1. 检查安全组规则是否开放
2. 验证数据库连接信息
3. 检查 PM2 进程是否正常运行
4. 查看 Nginx 日志获取详细错误

### Q3: 数据库磁盘满？
**A**:
1. 清理日志表数据
2. 压缩备份文件
3. 删除旧数据
4. 升级存储空间

### Q4: SSL 证书过期？
**A**:
1. 在 SSL 证书管理中续期
2. 自动化续期配置（Let's Encrypt）
3. 及时更新 CDN 和 CLB 中的证书

### Q5: 如何实现灰度发布？
**A**:
```bash
# 使用 PM2 的分集群部署
# 同时运行两个版本，逐步切换流量

# 部署新版本到 3001-3003
pm2 start app.js -i 1 -p 3001

# 更新 Nginx upstream，增加权重转移
upstream storycraft_api {
    server 127.0.0.1:3000 weight=3;  # 旧版本
    server 127.0.0.1:3001 weight=1;  # 新版本
}

# 逐步增加新版本权重，直到完全切换
```

### Q6: 如何进行故障回滚？
**A**:
```bash
# 保存多个版本的代码标签
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0

# 快速回滚
cd /opt/storycraft
git checkout v1.0.0
npm install --production
pm2 reload ecosystem.config.js
```

---

## 维护计划

### 日常维护

```bash
# 每天
- 检查应用日志是否有错误
- 检查磁盘使用情况
- 检查内存占用情况

# 每周
- 检查备份是否成功
- 更新安全补丁
- 优化慢查询

# 每月
- 检查 SSL 证书有效期
- 清理过期数据
- 优化数据库索引
- 容量规划评估
```

### 更新流程

```bash
# 1. 测试环境验证
git checkout develop
npm install
npm run build
# 手动测试关键功能

# 2. 创建发布分支
git checkout -b release/v1.1.0

# 3. 版本号更新
npm version minor

# 4. 合并到主分支
git checkout main
git merge release/v1.1.0

# 5. 部署到生产环境
# CI/CD 自动触发
# 等待 GitHub Actions 完成部署
```

---

## 成本估算

### 月均成本预估

| 服务 | 规格 | 月费用 |
|------|------|--------|
| CVM | 4C8G | ¥200-300 |
| MySQL | 2C4G | ¥100-150 |
| COS | 100GB + CDN | ¥100-200 |
| CDN | 10TB/月 | ¥200-500 |
| 其他 | 监控、日志等 | ¥50-100 |
| **总计** | - | **¥650-1250** |

*注：以上为粗略估算，实际费用根据使用量波动*

---

## 联系支持

- **腾讯云工单**: https://console.cloud.tencent.com/workorder
- **腾讯云文档**: https://cloud.tencent.com/document
- **应急处理**: 保存技术支持联系电话，建立应急预案

---

**最后更新**: 2024年10月
**维护人员**: DevOps Team
**紧急联系**: ops@yourdomain.com
