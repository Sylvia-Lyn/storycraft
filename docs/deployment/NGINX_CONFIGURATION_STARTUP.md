# Nginx 配置启动完全指南

## 📋 目录

- [Nginx 基础](#nginx-基础)
- [安装 Nginx](#安装-nginx)
- [创建 Nginx 配置](#创建-nginx-配置)
- [启动和管理 Nginx](#启动和管理-nginx)
- [验证配置](#验证配置)
- [常见配置场景](#常见配置场景)
- [故障排查](#故障排查)

---

## Nginx 基础

### ✓ Nginx 是什么

```
Nginx = HTTP 服务器 + 反向代理 + 负载均衡器

对于前端来说：
- 直接提供 HTML/CSS/JS 等静态文件
- 无需任何后端服务
- 可以处理 SPA 路由
```

### Nginx 优势

```
✓ 轻量级，占用内存少
✓ 性能高，支持高并发
✓ 配置简单
✓ 免费开源
✓ 跨平台
```

---

## 安装 Nginx

### Ubuntu/Debian

```bash
# 更新包管理器
sudo apt update

# 安装 Nginx
sudo apt install -y nginx

# 验证安装
nginx -v
# nginx version: nginx/1.24.0

# 查看 Nginx 安装位置
which nginx
# /usr/sbin/nginx

# 查看配置文件位置
nginx -V 2>&1 | grep "conf-path"
# --conf-path=/etc/nginx/nginx.conf
```

### CentOS/RHEL

```bash
# 更新包管理器
sudo yum update -y

# 安装 Nginx
sudo yum install -y nginx

# 验证安装
nginx -v
```

### macOS (本地开发)

```bash
# 使用 Homebrew
brew install nginx

# 验证安装
nginx -v

# 启动 Nginx
# 方法 1: 直接启动
sudo nginx

# 方法 2: 使用 brew services
brew services start nginx
```

---

## 创建 Nginx 配置

### 配置文件位置

```bash
# Linux 系统
/etc/nginx/nginx.conf              # 主配置文件
/etc/nginx/sites-available/        # 可用的站点配置目录
/etc/nginx/sites-enabled/          # 启用的站点配置目录
/var/log/nginx/                    # 日志目录

# macOS
/usr/local/etc/nginx/nginx.conf    # 主配置文件
/usr/local/etc/nginx/servers/      # 站点配置目录
```

### 方法 1: 创建独立的站点配置文件 (推荐)

#### 步骤 1: 创建配置文件

```bash
# 创建站点配置文件
sudo nano /etc/nginx/sites-available/storycraft

# 或使用 cat 命令
sudo tee /etc/nginx/sites-available/storycraft > /dev/null << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name storycraft.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    # 监听端口
    listen 443 ssl http2;
    listen [::]:443 ssl http2;  # IPv6 支持

    # 域名
    server_name storycraft.yourdomain.com;

    # SSL 证书配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 网站根目录
    root /var/www/html;

    # 默认文件
    index index.html;

    # 访问日志
    access_log /var/log/nginx/storycraft_access.log;
    error_log /var/log/nginx/storycraft_error.log;

    # 静态文件缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # HTML 文件不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA 路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
EOF
```

#### 步骤 2: 启用配置

```bash
# 创建软链接到 sites-enabled
sudo ln -s /etc/nginx/sites-available/storycraft /etc/nginx/sites-enabled/

# 删除默认配置 (可选)
sudo rm /etc/nginx/sites-enabled/default

# 验证软链接
ls -la /etc/nginx/sites-enabled/
# lrwxrwxrwx 1 root root 40 Oct 25 10:00 storycraft -> ../sites-available/storycraft
```

#### 步骤 3: 测试配置

```bash
# 检查配置文件语法
sudo nginx -t

# 输出应为：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 方法 2: 直接编辑主配置文件

```bash
# 编辑主配置文件
sudo nano /etc/nginx/nginx.conf

# 或查看当前内容
sudo cat /etc/nginx/nginx.conf
```

**主配置文件内容示例：**

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 768;
}

http {
    # 基础设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # MIME 类型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志
    access_log /var/log/nginx/access.log main;

    # 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss;

    # 包含其他配置文件
    include /etc/nginx/sites-enabled/*;
}
```

### 方法 3: 简单最小化配置

```bash
# 创建最简单的配置
sudo tee /etc/nginx/sites-available/storycraft > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 启用
sudo ln -s /etc/nginx/sites-available/storycraft /etc/nginx/sites-enabled/

# 测试
sudo nginx -t
```

---

## 启动和管理 Nginx

### 基本命令

```bash
# 1. 启动 Nginx
sudo systemctl start nginx

# 2. 查看状态
sudo systemctl status nginx

# 输出示例：
# ● nginx.service - A high performance web server and a reverse proxy server
#      Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
#      Active: active (running) since Fri 2024-10-25 10:00:00 UTC; 5min ago

# 3. 停止 Nginx
sudo systemctl stop nginx

# 4. 重启 Nginx (重新加载配置)
sudo systemctl restart nginx

# 5. 重新加载配置 (不中断连接)
sudo systemctl reload nginx

# 6. 设置开机自启
sudo systemctl enable nginx

# 7. 取消开机自启
sudo systemctl disable nginx
```

### 直接使用 nginx 命令

```bash
# 启动
sudo nginx

# 重新加载配置
sudo nginx -s reload

# 优雅关闭
sudo nginx -s quit

# 强制关闭
sudo nginx -s stop

# 查看进程
ps aux | grep nginx

# 查看 Nginx 版本
nginx -v

# 查看详细配置信息
nginx -V
```

### 快速启动脚本

```bash
# 创建启动脚本
cat > ~/start-nginx.sh << 'EOF'
#!/bin/bash

echo "启动 Nginx..."
sudo systemctl start nginx

echo "等待 1 秒..."
sleep 1

echo "检查状态..."
sudo systemctl status nginx

echo ""
echo "获取本地 IP..."
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "访问地址: http://$LOCAL_IP/"

echo ""
echo "✓ Nginx 启动完成"
EOF

chmod +x ~/start-nginx.sh
./start-nginx.sh
```

---

## 验证配置

### 测试 Nginx 配置

```bash
# 1. 检查语法
sudo nginx -t

# 2. 如果输出错误信息，查看详细错误
sudo nginx -t -c /etc/nginx/nginx.conf

# 3. 使用 grep 查找配置错误
sudo grep -n "error" /var/log/nginx/error.log

# 4. 查看 Nginx 监听的端口
sudo netstat -tlnp | grep nginx
# 或
sudo ss -tlnp | grep nginx

# 输出应为：
# tcp  0  0 0.0.0.0:80   0.0.0.0:*  LISTEN  1234/nginx
# tcp  0  0 0.0.0.0:443  0.0.0.0:*  LISTEN  1234/nginx
```

### 访问测试

```bash
# 1. 本地测试
curl http://localhost/

# 2. 远程测试
curl http://your_server_ip/

# 3. 检查响应头
curl -I http://your_server_ip/

# 应返回：
# HTTP/1.1 200 OK
# Server: nginx/1.24.0
# Content-Type: text/html; charset=utf-8

# 4. 浏览器访问
# http://your_server_ip/
```

### 查看日志

```bash
# 实时查看访问日志
sudo tail -f /var/log/nginx/storycraft_access.log

# 实时查看错误日志
sudo tail -f /var/log/nginx/storycraft_error.log

# 查看最后 20 行
sudo tail -20 /var/log/nginx/error.log

# 搜索特定错误
sudo grep "404" /var/log/nginx/storycraft_access.log

# 统计访问数
sudo wc -l /var/log/nginx/storycraft_access.log
```

---

## 常见配置场景

### 场景 1: 最简单配置 (仅 HTTP)

```nginx
server {
    listen 80;
    server_name storycraft.yourdomain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 场景 2: HTTP + HTTPS

```nginx
# HTTP 重定向
server {
    listen 80;
    server_name storycraft.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name storycraft.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 场景 3: 带有 API 代理

```nginx
server {
    listen 443 ssl;
    server_name storycraft.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # 前端静态文件
    root /var/www/html;

    # 代理 API 请求到后端
    location /api/ {
        proxy_pass http://localhost:3000;  # 后端 API 地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA 路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 场景 4: 带缓存和压缩

```nginx
server {
    listen 443 ssl http2;
    server_name storycraft.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    root /var/www/html;
    index index.html;

    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/javascript;
    gzip_min_length 1000;

    # 静态资源缓存 30 天
    location ~* \.(js|css|png|jpg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # HTML 不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 场景 5: 多个域名

```nginx
# 第一个应用
server {
    listen 443 ssl;
    server_name app1.yourdomain.com;
    root /var/www/app1;
    index index.html;

    ssl_certificate /etc/ssl/certs/cert1.pem;
    ssl_certificate_key /etc/ssl/private/key1.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 第二个应用
server {
    listen 443 ssl;
    server_name app2.yourdomain.com;
    root /var/www/app2;
    index index.html;

    ssl_certificate /etc/ssl/certs/cert2.pem;
    ssl_certificate_key /etc/ssl/private/key2.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 故障排查

### 问题 1: 配置文件错误

```bash
# 症状
sudo systemctl start nginx
# Job for nginx.service failed because the control process exited with error code

# 解决
# 1. 检查配置
sudo nginx -t

# 2. 查看详细错误
sudo nginx -t -c /etc/nginx/nginx.conf

# 3. 查看错误日志
sudo tail -20 /var/log/nginx/error.log

# 4. 常见错误修复
# - 缺少分号: location / {     <- 检查每行末尾是否有分号
# - 路径错误: root /wrong/path; <- 检查路径是否存在
# - 权限错误: ssl_certificate /root/cert.pem; <- 非 root 用户无法读取
```

### 问题 2: 端口被占用

```bash
# 症状
sudo systemctl start nginx
# Address already in use

# 查看占用端口的进程
sudo lsof -i :80
# 或
sudo netstat -tlnp | grep :80

# 停止占用的进程
sudo kill -9 <PID>
# 或
sudo systemctl stop nginx  # 如果是旧的 nginx 进程

# 然后重新启动
sudo systemctl start nginx
```

### 问题 3: 无法访问

```bash
# 症状
# curl http://localhost/ 超时或拒绝连接

# 检查项
# 1. Nginx 是否启动
sudo systemctl status nginx

# 2. 是否监听了正确的端口
sudo netstat -tlnp | grep nginx

# 3. 防火墙规则
sudo ufw status
# 如果启用了防火墙，需要开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. 安全组规则 (腾讯云)
# 控制台 → 安全组 → 入站规则 → 开放 80 和 443

# 5. SELinux (CentOS)
# 如果启用了 SELinux，需要配置权限
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/html(/.*)?"
sudo restorecon -Rv /var/www/html
```

### 问题 4: 404 错误

```bash
# 症状
# 访问 / 返回 404

# 检查项
# 1. 文件是否存在
ls -la /var/www/html/index.html

# 2. 文件权限
sudo ls -la /var/www/html/

# 应为 644 或 755 权限
sudo chmod 644 /var/www/html/index.html
sudo chmod 755 /var/www/html/

# 3. 用户权限
# nginx 进程运行用户是否能读取文件
ps aux | grep nginx
# 应显示 www-data 用户

# 确保 www-data 能读取
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### 问题 5: SPA 路由 404

```bash
# 症状
# 访问 / 正常，但访问 /about 返回 404

# 原因
# SPA 路由处理配置有问题

# 解决
# 检查配置中是否有以下行：
location / {
    try_files $uri $uri/ /index.html;
}

# 重新加载配置
sudo systemctl reload nginx

# 测试
curl http://localhost/about
```

### 问题 6: SSL 证书错误

```bash
# 症状
# curl: (60) SSL certificate problem

# 查看证书信息
openssl s_client -connect localhost:443

# 检查证书是否过期
openssl x509 -in /etc/ssl/certs/cert.pem -text -noout

# 检查证书路径是否正确
sudo ls -la /etc/ssl/certs/cert.pem
sudo ls -la /etc/ssl/private/key.pem

# 检查权限
# 私钥应该只有所有者能读
sudo chmod 600 /etc/ssl/private/key.pem
```

---

## 完整部署到启动流程

### 一步步部署

```bash
# 1. 本地构建
cd /Users/peak/work/pikecode/storycraft
npm run build

# 2. 上传到服务器
scp -r dist/* ubuntu@server_ip:/tmp/

# 3. SSH 连接
ssh -i key.pem ubuntu@server_ip

# 4. 移动文件
sudo mv /tmp/dist/* /var/www/html/

# 5. 设置权限
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 6. 创建 Nginx 配置
sudo tee /etc/nginx/sites-available/storycraft > /dev/null << 'EOF'
server {
    listen 80;
    server_name storycraft.yourdomain.com;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 7. 启用配置
sudo ln -s /etc/nginx/sites-available/storycraft /etc/nginx/sites-enabled/

# 8. 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 9. 测试配置
sudo nginx -t

# 10. 启动 Nginx
sudo systemctl start nginx

# 11. 设置开机自启
sudo systemctl enable nginx

# 12. 验证
curl http://server_ip/
```

### 一键部署脚本

```bash
# 创建脚本
cat > deploy-with-nginx.sh << 'EOF'
#!/bin/bash

SERVER_IP=$1
SSH_KEY=$2
DOMAIN=${3:-storycraft.yourdomain.com}

if [ -z "$SERVER_IP" ] || [ -z "$SSH_KEY" ]; then
    echo "用法: $0 <server_ip> <ssh_key> [domain]"
    echo "示例: $0 1.2.3.4 ~/.ssh/id_rsa storycraft.yourdomain.com"
    exit 1
fi

echo "=== 部署前端应用到 Nginx ==="
echo "服务器: $SERVER_IP"
echo "域名: $DOMAIN"
echo ""

# 1. 本地构建
echo "1. 构建前端应用..."
npm run build
if [ $? -ne 0 ]; then
    echo "✗ 构建失败"
    exit 1
fi
echo "✓ 构建成功"

# 2. 上传文件
echo ""
echo "2. 上传文件到服务器..."
scp -i $SSH_KEY -r dist/* ubuntu@$SERVER_IP:/tmp/
echo "✓ 文件上传成功"

# 3. 远程部署
echo ""
echo "3. 配置服务器..."
ssh -i $SSH_KEY ubuntu@$SERVER_IP << 'REMOTE'
    # 移动文件
    sudo mv /tmp/dist/* /var/www/html/

    # 设置权限
    sudo chown -R www-data:www-data /var/www/html
    sudo chmod -R 755 /var/www/html

    # 创建 Nginx 配置
    sudo tee /etc/nginx/sites-available/storycraft > /dev/null << 'NGINX'
server {
    listen 80;
    server_name storycraft.yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

    # 启用配置
    sudo ln -s /etc/nginx/sites-available/storycraft /etc/nginx/sites-enabled/ 2>/dev/null
    sudo rm /etc/nginx/sites-enabled/default 2>/dev/null

    # 测试配置
    sudo nginx -t

    # 启动 Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx

    echo "✓ 服务器配置完成"
REMOTE

# 4. 验证
echo ""
echo "4. 验证部署..."
sleep 2
curl -I http://$SERVER_IP/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 部署成功！"
    echo ""
    echo "访问地址:"
    echo "  http://$SERVER_IP/"
    echo "  http://$DOMAIN/ (需要 DNS 配置)"
else
    echo "✗ 验证失败，请检查服务器"
fi
EOF

chmod +x deploy-with-nginx.sh

# 使用脚本
./deploy-with-nginx.sh 1.2.3.4 ~/.ssh/id_rsa storycraft.yourdomain.com
```

---

## 快速参考卡

### 最常用的 10 个命令

```bash
# 1. 启动 Nginx
sudo systemctl start nginx

# 2. 停止 Nginx
sudo systemctl stop nginx

# 3. 重启 Nginx
sudo systemctl restart nginx

# 4. 重新加载配置（不中断服务）
sudo systemctl reload nginx

# 5. 查看状态
sudo systemctl status nginx

# 6. 检查配置
sudo nginx -t

# 7. 查看日志
sudo tail -f /var/log/nginx/error.log

# 8. 查看访问日志
sudo tail -f /var/log/nginx/storycraft_access.log

# 9. 查看监听的端口
sudo netstat -tlnp | grep nginx

# 10. 设置开机自启
sudo systemctl enable nginx
```

### 配置文件快速参考

```nginx
# 基本结构
server {
    # 监听端口和地址
    listen 80;
    listen 443 ssl http2;

    # 域名
    server_name storycraft.yourdomain.com;

    # 网站根目录
    root /var/www/html;

    # 默认文件
    index index.html;

    # SSL 证书 (如果使用 HTTPS)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 日志
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # 路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存配置
    location ~* \.(js|css)$ {
        expires 30d;
    }
}
```

---

## 总结

### Nginx 的工作流程

```
客户端请求
    ↓
Nginx 接收请求
    ↓
根据配置规则匹配位置
    ↓
如果是静态文件 → 直接返回文件
如果是 SPA 路由 → 返回 index.html
    ↓
返回响应给客户端
```

### 为什么选择 Nginx？

✅ **轻量级** - 占用资源少
✅ **高性能** - 支持高并发
✅ **配置简单** - 几行配置即可运行
✅ **免费开源** - 无许可证费用
✅ **功能强大** - 支持反向代理、负载均衡等

### Nginx vs 其他方案

```
Nginx:
  ✓ 专业生产级服务器
  ✓ 最常用的方案
  ✓ 易于扩展

Python SimpleHTTPServer:
  ✗ 不适合生产
  ✗ 性能低

Node.js HTTP Server:
  ✓ 可以，但不如 Nginx
  ✗ 消耗资源更多

Node.js + Express:
  ✓ 适合需要后端的情况
  ✗ 更复杂
```

---

**最后更新**: 2024年10月
**推荐指数**: ⭐⭐⭐⭐⭐
