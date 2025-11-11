# 部署后启动服务指南

## 📋 根据部署方式选择启动方式

---

## 方案 1: COS 静态托管 (无需启动服务)

### ✓ 特点
- **无需启动任何服务**
- 文件上传后即可直接访问
- COS 自动提供托管服务

### 访问方式

```bash
# 直接在浏览器访问
https://bucket-name.cos.region.myqcloud.com/index.html

# 如果绑定了自定义域名
https://storycraft.yourdomain.com/

# 如果配置了 CDN
https://storycraft.yourdomain.com/ (自动走 CDN 加速)
```

### 服务状态检查

```bash
# 检查是否能访问
curl -I https://bucket-name.cos.region.myqcloud.com/index.html

# 应返回 200
# HTTP/2 200
# Content-Type: text/html
```

### 刷新缓存（如果需要）

```bash
# COS 自动缓存，如果更新文件后要清除缓存
# 方法：删除 COS 中的文件，重新上传

coscmd delete -r /
cd dist/
coscmd upload -r . /

# 或在腾讯云控制台中清除
```

---

## 方案 2: Nginx 服务器启动

### 前置条件

```bash
# 1. 已部署文件到 /var/www/html
# 2. 已安装 Nginx
# 3. 已配置 Nginx 配置文件
```

### 启动 Nginx

```bash
# SSH 连接到服务器
ssh -i your_key.pem ubuntu@your_server_ip

# 检查 Nginx 是否已安装
nginx -v

# 如果未安装，安装 Nginx
sudo apt update
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx

# 验证启动成功
sudo systemctl status nginx

# 输出应包含：
# ● nginx.service - A high performance web server and a reverse proxy server
#    Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
#    Active: active (running) since ...
```

### Nginx 常用命令

```bash
# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重新加载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 设置开机自启
sudo systemctl enable nginx

# 取消开机自启
sudo systemctl disable nginx

# 检查配置文件是否有语法错误
sudo nginx -t

# 查看 Nginx 进程
ps aux | grep nginx

# 查看监听的端口
sudo netstat -tlnp | grep nginx
# 或
sudo ss -tlnp | grep nginx
```

### 验证 Nginx 正在运行

```bash
# 本地验证
curl -I http://your_server_ip/

# 或在浏览器中访问
http://your_server_ip/

# 应返回 200 和你的网站首页
```

### Nginx 配置示例

```bash
# 查看当前配置
sudo cat /etc/nginx/sites-enabled/storycraft

# 输出应包含：
# server {
#     listen 80;
#     server_name storycraft.yourdomain.com;
#     root /var/www/html;
#     index index.html;
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
# }
```

### 如果 Nginx 启动失败

```bash
# 1. 检查配置文件
sudo nginx -t

# 2. 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 3. 常见错误和解决：

# 错误: "bind() to 0.0.0.0:80 failed"
# 原因：80 端口被占用
# 解决：
sudo lsof -i :80  # 查看占用 80 的进程
sudo systemctl stop <process>  # 停止占用的进程

# 错误: "Permission denied"
# 原因：权限不足
# 解决：
sudo systemctl restart nginx

# 错误: "cannot open socket"
# 原因：配置文件路径错误
# 解决：
sudo nginx -t  # 检查配置
sudo nano /etc/nginx/sites-enabled/storycraft  # 编辑配置
```

### Nginx 日志查看

```bash
# 访问日志
sudo tail -f /var/log/nginx/storycraft_access.log

# 错误日志
sudo tail -f /var/log/nginx/storycraft_error.log

# 统计访问数
sudo wc -l /var/log/nginx/storycraft_access.log

# 查看最常访问的页面
sudo cut -d' ' -f7 /var/log/nginx/storycraft_access.log | sort | uniq -c | sort -rn | head -10

# 查看不同状态码的请求数
sudo awk '{print $9}' /var/log/nginx/storycraft_access.log | sort | uniq -c
```

---

## 方案 3: Node.js 服务器启动

### 使用 PM2 进程管理器 (推荐)

#### 安装 PM2

```bash
# SSH 连接到服务器
ssh -i your_key.pem ubuntu@your_server_ip

# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 --version
```

#### 创建应用启动脚本

```bash
# 如果你有 Node.js 后端，创建 server.js
# 或使用现成的 Express 服务器

# 示例 server.js (简单的静态文件服务器)
cat > /opt/storycraft/server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

// 提供静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF
```

#### 使用 PM2 启动

```bash
# 启动应用
pm2 start server.js --name "storycraft-frontend"

# 查看运行状态
pm2 list

# 查看日志
pm2 logs storycraft-frontend

# 监控应用
pm2 monit

# 重启应用
pm2 restart storycraft-frontend

# 停止应用
pm2 stop storycraft-frontend

# 删除应用
pm2 delete storycraft-frontend

# 开机自启
pm2 startup
pm2 save
```

#### PM2 配置文件方式 (高级)

```bash
# 创建 ecosystem.config.js
cat > /opt/storycraft/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'storycraft-frontend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 日志
      error_file: '/var/log/storycraft/error.log',
      out_file: '/var/log/storycraft/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 重启策略
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      // 开机自启
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# 使用配置文件启动
pm2 start ecosystem.config.js

# 查看状态
pm2 list
```

---

## 方案 4: 云函数启动

### ✓ 特点
- **无需手动启动**
- 云函数自动运行
- 按调用次数计费

### 访问方式

```bash
# 通过 API 网关访问
https://cloud-function-url/index.html

# 云函数自动处理请求并返回文件内容
```

### 验证云函数运行

```bash
# 在腾讯云控制台
# 云函数 → 函数列表 → 选择函数 → "测试"

# 或使用 curl
curl -I https://your-api-gateway-url/index.html

# 应返回 200
```

---

## 快速启动速查表

| 部署方式 | 启动命令 | 验证方式 | 是否需要启动 |
|--------|--------|--------|-----------|
| **COS** | 无 | `curl https://bucket.cos.region.myqcloud.com/index.html` | ❌ 否 |
| **Nginx** | `sudo systemctl start nginx` | `curl http://server-ip/` | ✅ 是 |
| **PM2** | `pm2 start server.js` | `pm2 list` | ✅ 是 |
| **云函数** | 无 | 控制台测试 | ❌ 否 |

---

## 完整部署到启动流程

### COS 方案 (最简单)

```bash
# 1. 本地构建
npm run build

# 2. 上传到 COS
cd dist/
coscmd upload -r . /

# 3. 访问
# https://bucket.cos.region.myqcloud.com
# ✓ 完成！无需启动任何服务
```

### Nginx 方案 (推荐)

```bash
# 1. 本地构建
npm run build

# 2. 上传到服务器
scp -r dist/* ubuntu@server_ip:/var/www/html/

# 3. SSH 连接服务器
ssh -i key.pem ubuntu@server_ip

# 4. 启动 Nginx
sudo systemctl start nginx

# 5. 验证
curl http://server_ip/
# ✓ 完成！

# 6. 开机自启
sudo systemctl enable nginx
```

### PM2 方案 (支持后端)

```bash
# 1. 本地构建
npm run build

# 2. 上传代码和配置文件
scp -r . ubuntu@server_ip:/opt/storycraft/

# 3. SSH 连接服务器
ssh -i key.pem ubuntu@server_ip

# 4. 进入项目目录
cd /opt/storycraft

# 5. 安装依赖
npm install --production

# 6. 使用 PM2 启动
pm2 start ecosystem.config.js

# 7. 开机自启
pm2 startup
pm2 save

# 8. 验证
pm2 list
# ✓ 完成！
```

---

## 常见启动问题

### Q1: COS 部署后无法访问？

**A**:
```bash
# 1. 检查是否真的已上传
coscmd list

# 2. 检查是否启用了静态网站
# COS 控制台 → 基础配置 → 静态网站 → 启用

# 3. 尝试访问 COS 地址
curl -I https://bucket.cos.region.myqcloud.com/index.html
# 应返回 200，如果返回 403/404 则检查上面两项

# 4. 清除浏览器缓存
# Ctrl+Shift+Del
```

### Q2: Nginx 启动失败？

**A**:
```bash
# 1. 检查配置文件
sudo nginx -t
# 应输出 "syntax is ok"

# 2. 查看错误信息
sudo systemctl status nginx
# 查看 "error" 信息

# 3. 查看详细日志
sudo tail -20 /var/log/nginx/error.log

# 4. 常见原因：
# - 80 端口被占用: sudo lsof -i :80
# - 配置文件路径错误: sudo nano /etc/nginx/sites-enabled/storycraft
# - 权限不足: 使用 sudo 运行
```

### Q3: PM2 启动失败？

**A**:
```bash
# 1. 检查 Node.js 是否安装
node --version

# 2. 检查 server.js 是否存在
ls -la server.js

# 3. 查看 PM2 日志
pm2 logs storycraft-frontend

# 4. 尝试直接运行
node server.js

# 5. 如果报模块错误，安装依赖
npm install

# 6. 再次启动
pm2 start server.js
```

### Q4: 启动后仍然无法访问？

**A**:
```bash
# 1. 检查服务是否真的启动了
# COS: 无需检查
# Nginx: sudo systemctl status nginx
# PM2: pm2 list

# 2. 检查防火墙
# 腾讯云安全组是否开放了 80/443 端口

# 3. 检查 DNS 解析
nslookup storycraft.yourdomain.com

# 4. 使用 curl 测试连接
curl -v http://server_ip/

# 5. 查看服务日志
# Nginx: sudo tail -f /var/log/nginx/error.log
# PM2: pm2 logs

# 6. 如果是 404，检查文件是否存在
ls -la /var/www/html/index.html
```

### Q5: 如何停止服务？

**A**:
```bash
# COS: 无需停止（直接在控制台删除文件即可下线）

# Nginx:
sudo systemctl stop nginx

# PM2:
pm2 stop storycraft-frontend
# 或完全删除
pm2 delete storycraft-frontend
```

### Q6: 如何重启服务？

**A**:
```bash
# Nginx:
sudo systemctl restart nginx
# 或不中断现有连接的重启：
sudo systemctl reload nginx

# PM2:
pm2 restart storycraft-frontend

# 查看重启后的状态
sudo systemctl status nginx
pm2 list
```

---

## 启动后的日常管理

### 定期检查服务状态

```bash
# Nginx
sudo systemctl status nginx

# PM2
pm2 list
pm2 monit

# 查看进程
ps aux | grep -E "nginx|node|pm2" | grep -v grep
```

### 查看实时日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/storycraft_access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/storycraft_error.log

# PM2 应用日志
pm2 logs storycraft-frontend --lines 100
```

### 重新部署（更新代码后）

```bash
# 1. 本地重新构建
npm run build

# 2. 重新上传
scp -r dist/* ubuntu@server_ip:/var/www/html/
# 或如果使用 PM2：
scp -r dist/* ubuntu@server_ip:/opt/storycraft/dist/

# 3. 重新加载/重启服务
# Nginx (通常无需重启，自动获取新文件)
sudo systemctl reload nginx

# PM2
pm2 reload storycraft-frontend

# 4. 清除浏览器缓存
# Ctrl+Shift+Del

# 5. 验证
curl http://server_ip/
```

---

## 快速决策树

```
问：我的前端部署在哪里？

├─ COS 静态托管
│  └─ 回答：无需启动任何服务
│     直接访问 COS 地址即可
│
├─ 服务器 (CVM) with Nginx
│  └─ 回答：运行 sudo systemctl start nginx
│     然后访问 http://server_ip/
│
├─ 服务器 (CVM) with Node.js
│  └─ 回答：运行 pm2 start server.js
│     然后访问 http://server_ip/
│
└─ 云函数
   └─ 回答：无需启动
      云函数自动运行
      通过 API Gateway 访问
```

---

## 一键启动脚本

```bash
# 保存为 start-service.sh
cat > start-service.sh << 'EOF'
#!/bin/bash

SERVICE=${1:-nginx}  # 默认 nginx

case $SERVICE in
  nginx)
    echo "启动 Nginx..."
    sudo systemctl start nginx
    sudo systemctl status nginx
    echo "访问: http://your_server_ip"
    ;;
  pm2)
    echo "启动 PM2 应用..."
    pm2 start ecosystem.config.js
    pm2 list
    echo "访问: http://your_server_ip:3000"
    ;;
  stop-nginx)
    echo "停止 Nginx..."
    sudo systemctl stop nginx
    ;;
  stop-pm2)
    echo "停止 PM2 应用..."
    pm2 stop storycraft-frontend
    ;;
  restart-nginx)
    echo "重启 Nginx..."
    sudo systemctl restart nginx
    ;;
  restart-pm2)
    echo "重启 PM2 应用..."
    pm2 restart storycraft-frontend
    ;;
  *)
    echo "用法: $0 {nginx|pm2|stop-nginx|stop-pm2|restart-nginx|restart-pm2}"
    ;;
esac
EOF

chmod +x start-service.sh

# 使用
./start-service.sh nginx      # 启动 Nginx
./start-service.sh pm2        # 启动 PM2
./start-service.sh restart-nginx  # 重启 Nginx
```

---

## 总结

| 部署方式 | 启动命令 | 成本 | 易用度 |
|--------|--------|------|-------|
| **COS** | 无 | ¥4-10/月 | ⭐⭐⭐⭐⭐ |
| **Nginx** | 1 条命令 | ¥200+/月 | ⭐⭐⭐⭐ |
| **PM2** | 1 条命令 | ¥200+/月 | ⭐⭐⭐⭐ |
| **云函数** | 无 | ¥0-20/月 | ⭐⭐⭐⭐⭐ |

**推荐**: COS (最便宜，无需启动) 或 Nginx (成本合理，性能好)

---

**最后更新**: 2024年10月
