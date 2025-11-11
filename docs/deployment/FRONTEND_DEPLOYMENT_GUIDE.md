# Storycraft 前端部署指南 (腾讯云)

## 📋 快速导航

- [前置准备](#前置准备)
- [方案对比](#方案对比)
- [方案 1: 静态托管 (推荐)](#方案-1-静态托管推荐)
- [方案 2: 使用云函数](#方案-2-使用云函数)
- [方案 3: 使用 CVM](#方案-3-使用-cvm)
- [域名和 HTTPS 配置](#域名和-https-配置)
- [常见问题](#常见问题)

---

## 前置准备

### 本地环境

```bash
# 检查 Node.js 版本 (需要 16.x 或更高)
node --version    # v18.x 或更高
npm --version     # 8.x 或更高

# 验证项目构建
npm install
npm run build

# 检查构建产物
ls -la dist/
# 应包含：
# - index.html
# - assets/
#   - index-*.js
#   - index-*.css
```

### 腾讯云账户准备

1. **创建腾讯云账户**
   - 访问 https://cloud.tencent.com/
   - 完成实名认证
   - 绑定支付方式

2. **获取 API 密钥**
   - 打开 [API 密钥管理](https://console.cloud.tencent.com/cam/capi)
   - 创建新的 SecretId 和 SecretKey
   - **保存到安全的地方**，不要提交到 Git

3. **开通服务**
   - 对象存储 (COS)
   - 内容分发网络 (CDN) (可选)

---

## 方案对比

| 方案 | 成本 | 配置难度 | 访问速度 | 适用场景 |
|------|------|--------|--------|--------|
| **COS 静态托管** | ¥10-50/月 | 简单 ⭐⭐ | 快 (国内) | 推荐首选 |
| **COS + CDN** | ¥50-200/月 | 中等 ⭐⭐⭐ | 很快 (全球) | 用户分布广 |
| **云函数** | ¥0-20/月 | 简单 ⭐⭐ | 中等 | 流量小 |
| **CVM** | ¥200-300/月 | 复杂 ⭐⭐⭐⭐ | 快 | 需要 SSR |

**推荐**: 使用 **COS 静态托管** + **CDN 加速**

---

## 方案 1: 静态托管（推荐）

### 步骤 1: 创建 COS 存储桶

1. **访问 COS 控制台**
   - 打开 https://console.cloud.tencent.com/cos
   - 点击"创建存储桶"

2. **配置存储桶**
   ```
   存储桶名称：storycraft-frontend-{region}-{appid}
              (系统会自动在后面添加 APPID)

   所属地域：根据用户分布选择
            - 北京: ap-beijing
            - 上海: ap-shanghai
            - 广州: ap-guangzhou
            - 深圳: ap-shenzhen

   存储类型：标准存储
   访问权限：私有读写
   ```

3. **点击创建**

### 步骤 2: 配置 COS 静态网站

1. **进入存储桶 → 基础配置**

2. **找到"静态网站"部分，启用**
   ```
   索引文档：index.html
   错误文档：index.html (重要！SPA 应用必需)
   ```

3. **保存配置**

### 步骤 3: 本地构建

```bash
cd /Users/peak/work/pikecode/storycraft

# 清理旧的构建
rm -rf dist/

# 构建项目
npm run build

# 验证输出
ls -la dist/
```

### 步骤 4: 上传文件到 COS

#### 方法 A: 使用腾讯云控制台 (最简单)

1. **在 COS 控制台打开存储桶**

2. **点击"上传文件"**

3. **选择 dist/ 文件夹下的所有文件**
   ```bash
   # 先进入 dist 目录
   cd dist/

   # 全选所有文件
   index.html
   assets/ (目录)
   ```

4. **上传设置**
   ```
   ✓ 使用相同的 ACL 和权限
   ✓ 显示上传进度
   ```

5. **等待上传完成** ✓

#### 方法 B: 使用 coscmd 命令行 (推荐)

```bash
# 全局安装 coscmd
npm install -g coscmd

# 或使用 pip
pip3 install coscmd

# 配置腾讯云凭证
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>

# 示例：
coscmd config -a AKIDxxxxxx -s xxxxxx -b storycraft-frontend-1234567890 -r ap-guangzhou

# 上传 dist 目录下的所有文件
cd dist/
coscmd upload -r . /

# 查看上传结果
coscmd list -a
```

### 步骤 5: 验证访问

1. **获取 COS 访问地址**
   - 在 COS 控制台 → 概览页面
   - 找到"访问域名"
   - 格式：`https://bucket-name-1234567890.cos.region.myqcloud.com`

2. **在浏览器中访问**
   ```
   https://your-bucket-name.cos.ap-guangzhou.myqcloud.com
   ```

3. **检查页面是否正常显示**
   - 页面应正常加载
   - 样式和脚本应加载成功
   - 控制台不应有错误

### 步骤 6: (可选) 配置自定义域名

1. **在 COS 控制台 → 存储桶 → 域名管理**

2. **添加自定义域名**
   ```
   域名：frontend.yourdomain.com
   源站：选择 COS 源
   ```

3. **配置 DNS (以阿里云为例)**
   - 登录域名控制台
   - 添加 CNAME 记录
   ```
   主机记录：frontend
   记录类型：CNAME
   记录值：bucket-name.cos.ap-guangzhou.myqcloud.com
   ```

4. **等待 DNS 生效 (5-30 分钟)**

---

## 方案 1 进阶: 添加 CDN 加速

### 步骤 1: 创建 CDN 分发

1. **访问 CDN 控制台**
   - https://console.cloud.tencent.com/cdn

2. **点击"创建分发"**

3. **配置分发源**
   ```
   加速域名：storycraft.yourdomain.com

   源站信息：
   - 源站类型：COS 源
   - 选择你的存储桶

   加速协议：HTTPS
   ```

4. **业务类型**
   ```
   选择：网页及小文件
   ```

5. **点击创建**

### 步骤 2: 配置缓存规则

1. **进入 CDN 分发配置**

2. **缓存配置**
   ```
   路径                 缓存时间    优先级
   /index.html         1小时       1
   /assets/*           30天        2
   /api/*              不缓存       3
   /                   1小时       4
   ```

3. **HTTP 响应头**
   ```
   设置：
   Cache-Control: public, max-age=86400
   X-Content-Type-Options: nosniff
   X-Frame-Options: SAMEORIGIN
   ```

### 步骤 3: 配置域名 DNS

```bash
# 在域名注册商添加 CNAME
主机记录：storycraft
记录类型：CNAME
记录值：storycraft.yourdomain.com.cdn.dnsv1.com

# 验证 DNS 解析
dig storycraft.yourdomain.com
nslookup storycraft.yourdomain.com
```

### 步骤 4: 申请 SSL 证书

1. **在腾讯云 SSL 证书服务**
   - https://console.cloud.tencent.com/ssl

2. **申请免费证书** (推荐)
   - 证书类型：域名型 (DV)
   - 验证方式：DNS 验证

3. **获得证书后，在 CDN 中配置**
   - CDN 控制台 → 域名 → HTTPS 配置
   - 上传证书和私钥
   - 启用 HTTPS
   - 设置"强制 HTTPS 跳转"

### 步骤 5: 验证 CDN 加速

```bash
# 检查是否从 CDN 加速节点获取
curl -I https://storycraft.yourdomain.com

# 返回头中应包含：
# Server: NginxEdge
# X-Cache-Status: HIT (已缓存)
```

---

## 方案 2: 使用云函数

### 适用场景
- 流量很小
- 成本优先
- 不需要 CDN

### 步骤

```bash
# 1. 创建云函数
# 访问：https://console.cloud.tencent.com/scf

# 2. 新建函数
# 函数名：storycraft-frontend
# 运行环境：Nodejs18.x
# 执行角色：创建新角色

# 3. 上传代码
# 创建 index.js
cat > index.js << 'EOF'
const fs = require('fs');
const path = require('path');

exports.main_handler = async (event, context) => {
  const distPath = path.join(__dirname, 'dist');

  let pathname = event.path || '/';
  if (pathname === '/') pathname = '/index.html';

  let filePath = path.join(distPath, pathname);

  // 如果文件不存在，返回 index.html (SPA 路由)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distPath, 'index.html');
  }

  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath);

  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': contentTypes[ext] || 'text/plain',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    },
    body: content.toString('base64'),
    isBase64Encoded: true
  };
};
EOF

# 4. 打包上传
mkdir -p scf-pkg
cp -r dist/ scf-pkg/
cp index.js scf-pkg/
zip -r function.zip scf-pkg/

# 5. 在控制台上传 function.zip

# 6. 配置触发器
# - 触发器类型：API 网关
# - 请求方法：ANY
# - 路径：/
```

---

## 方案 3: 使用 CVM

### 适用场景
- 已有 CVM 实例
- 需要服务器端渲染
- 需要后端支持

### 快速部署

```bash
# 1. SSH 连接到 CVM
ssh -i your_key.pem ubuntu@your_server_ip

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 Nginx
sudo apt install -y nginx

# 4. 上传构建文件
scp -r dist/ ubuntu@your_server_ip:/tmp/

# 5. 配置 Nginx
sudo tee /etc/nginx/sites-available/storycraft << 'EOF'
server {
    listen 80;
    server_name storycraft.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name storycraft.yourdomain.com;

    # SSL 证书
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 静态文件
    root /var/www/storycraft;
    index index.html;

    # SPA 路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存配置
    location ~* \.(js|css|png|jpg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 日志
    access_log /var/log/nginx/storycraft_access.log;
    error_log /var/log/nginx/storycraft_error.log;
}
EOF

# 6. 启用站点
sudo ln -s /etc/nginx/sites-available/storycraft /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 7. 部署文件
sudo mv /tmp/dist /var/www/storycraft
sudo chown -R www-data:www-data /var/www/storycraft

# 8. 重启 Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 域名和 HTTPS 配置

### 配置自定义域名

#### 步骤 1: 在域名注册商配置 DNS

以阿里云为例：

```
主机记录：storycraft (或 @)
记录类型：CNAME (如果使用 CDN) 或 A (如果使用 CVM)
记录值：
  - CDN: storycraft.yourdomain.com.cdn.dnsv1.com
  - CVM: 你的服务器公网 IP
```

#### 步骤 2: 申请 SSL 证书

**选项 A: 使用腾讯云免费 SSL 证书** (推荐)

```bash
# 1. 访问 SSL 证书服务
# https://console.cloud.tencent.com/ssl

# 2. 申请免费证书
# - 证书品牌：TrustAsia
# - 证书类型：域名型 (DV)
# - 域名：storycraft.yourdomain.com
# - 验证方式：DNS 验证

# 3. 验证域名
# 添加 DNS 记录后等待验证

# 4. 获得证书
# 下载证书文件

# 5. 如果使用 CDN，在 CDN 控制台上传证书
# 如果使用 CVM，在 Nginx 配置中指向证书文件
```

**选项 B: 使用 Let's Encrypt (自动续期)**

```bash
# 如果使用 CVM，可以用 Certbot 自动化
sudo apt install -y certbot python3-certbot-nginx

# 生成证书
sudo certbot certonly -d storycraft.yourdomain.com

# 自动续期
sudo systemctl enable certbot.timer
```

#### 步骤 3: 验证 HTTPS

```bash
# 检查证书是否正确配置
curl -I https://storycraft.yourdomain.com

# 应返回 200 状态码
# 检查浏览器地址栏是否显示 🔒
```

---

## 更新和维护

### 更新前端代码

```bash
# 1. 本地修改代码
# ... 修改文件 ...

# 2. 测试
npm run dev

# 3. 构建
npm run build

# 4. 清空旧内容 (COS)
coscmd delete -r /

# 5. 上传新文件
cd dist/
coscmd upload -r . /

# 6. 清除 CDN 缓存 (如果使用 CDN)
# 在 CDN 控制台 → 缓存清除 → 输入需要清除的路径
# /index.html
# /assets/
```

### 版本管理最佳实践

```bash
# 1. 使用 git 标签管理版本
git tag -a v1.0.0 -m "First production release"
git push origin v1.0.0

# 2. 保持多个版本备份
# 在 COS 中创建版本文件夹
# /v1.0.0/
# /v1.0.1/
# /latest/

# 3. 快速回滚
coscmd download -r /v1.0.0 dist/
coscmd upload -r dist/ /
```

---

## 性能优化

### 1. 启用 Gzip 压缩

**COS + CDN 方案**：CDN 自动启用

**CVM 方案**：在 Nginx 中启用

```nginx
# /etc/nginx/nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript;
gzip_disable "msie6";
```

### 2. 配置缓存头

```nginx
# 静态资源: 30 天缓存
location ~* \.(js|css|png|jpg|gif|ico|svg|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# HTML: 不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 3. 启用 HTTP/2

```nginx
listen 443 ssl http2;
```

### 4. 移除无用的 CSS/JS

```bash
# 在构建前检查包大小
npm install --save-dev webpack-bundle-analyzer

# 在 vite.config.js 中配置
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer()
  ]
}

# 构建后查看 dist/stats.html
```

---

## 监控和日志

### 监控上传成功

```bash
# 检查 COS 中的文件
coscmd list -r

# 检查文件大小
coscmd getattr /assets/
```

### 监控访问日志

**COS 方案**：
```bash
# 在 COS 控制台启用日志
# 存储桶 → 日志管理 → 启用日志
# 查看访问日志了解用户访问情况
```

**CDN 方案**：
```bash
# CDN 控制台 → 日志管理
# 下载日志分析用户访问
# 可使用 grep 命令分析
grep "404" cdnlog.log | wc -l  # 统计 404 错误
```

**CVM 方案**：
```bash
# 查看 Nginx 日志
sudo tail -f /var/log/nginx/storycraft_access.log

# 分析日志
sudo cat /var/log/nginx/storycraft_access.log | awk '{print $9}' | sort | uniq -c | sort -rn
```

---

## 常见问题

### Q1: 上传后页面显示 404？
**A**:
1. 检查是否启用了"静态网站"功能
2. 检查"错误文档"是否设置为 `index.html`
3. 清除浏览器缓存
4. 检查文件路径是否正确上传

### Q2: 样式/脚本加载不出来？
**A**:
1. 检查浏览器控制台网络标签
2. 确认 assets/ 文件夹已上传
3. 检查 CORS 配置 (如果跨域)
4. 清除 CDN 缓存
5. 尝试硬刷新 (Ctrl+Shift+R)

### Q3: 访问其他路由报 404？
**A**:
1. 检查是否启用了"错误文档"功能
2. 设置"错误文档"为 `index.html`
3. CVM 中检查 `try_files` 规则

### Q4: CDN 缓存导致更新不生效？
**A**:
1. 清除 CDN 缓存
2. 更新文件名（带版本号）
   ```javascript
   // vite.config.js
   build: {
     rollupOptions: {
       output: {
         entryFileNames: 'js/[name]-[hash].js',
         chunkFileNames: 'js/[name]-[hash].js',
         assetFileNames: 'assets/[name]-[hash].[ext]'
       }
     }
   }
   ```
3. 浏览器硬刷新

### Q5: 上传费用怎么计算？
**A**:
- **存储**: ¥0.012/GB/月
- **请求数**: ¥0.002/万次 PUT，¥0.002/万次 GET
- **CDN 流量**: ¥0.24/GB (国内，可选)
- 月费用约 ¥10-50

### Q6: 如何自动化部署？
**A**: 使用 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install
      - run: npm run build

      - name: Upload to COS
        env:
          COS_SECRET_ID: ${{ secrets.COS_SECRET_ID }}
          COS_SECRET_KEY: ${{ secrets.COS_SECRET_KEY }}
        run: |
          npm install -g coscmd
          coscmd config -a $COS_SECRET_ID -s $COS_SECRET_KEY -b your-bucket -r ap-guangzhou
          coscmd delete -r /
          cd dist && coscmd upload -r . / && cd ..
```

---

## 成本对比 (月均)

| 方案 | 存储 | 请求 | CDN | 总费用 | 访问速度 |
|------|------|------|-----|--------|--------|
| COS 仅 | ¥1 | ¥3 | - | ¥4-10 | 中等 |
| COS+CDN | ¥1 | ¥3 | ¥50-200 | ¥54-203 | 很快 ⭐ |
| 云函数 | - | ¥0-10 | - | ¥0-20 | 中等 |
| CVM 独立 | - | - | - | ¥200+ | 快 |

**建议**: 先用 **COS 仅方案** (¥4-10/月)，用户量大后升级 **COS+CDN** (¥54-203/月)

---

## 快速检查清单

部署前检查：
- [ ] npm run build 构建成功
- [ ] dist/ 目录存在且包含 index.html
- [ ] 有腾讯云账户和 API 密钥

部署后检查：
- [ ] COS 存储桶已创建
- [ ] 静态网站已启用
- [ ] 文件已上传到 COS
- [ ] 可通过 COS 地址访问
- [ ] (可选) CDN 已配置
- [ ] (可选) 自定义域名已绑定
- [ ] (可选) HTTPS 已配置
- [ ] 页面正常显示，无 404 错误

---

## 技术支持

- **腾讯云工单**: https://console.cloud.tencent.com/workorder
- **COS 文档**: https://cloud.tencent.com/document/product/436
- **CDN 文档**: https://cloud.tencent.com/document/product/228
- **最常用**: 清除 CDN 缓存、检查存储桶权限、验证静态网站配置

---

**最后更新**: 2024年10月
**难度等级**: ⭐⭐ (COS) ~ ⭐⭐⭐⭐ (自动化 CI/CD)
