# 本地打包 + 手动部署指南

## 📋 目录

- [本地打包](#本地打包)
- [打包产物说明](#打包产物说明)
- [手动部署到 COS](#手动部署到-cos)
- [手动部署到服务器](#手动部署到服务器)
- [验证部署](#验证部署)
- [常见问题](#常见问题)

---

## 本地打包

### 环境检查

```bash
# 检查 Node.js 版本
node --version     # 需要 16.x 或更高，推荐 18.x

# 检查 npm 版本
npm --version      # 需要 8.x 或更高

# 查看本地已安装的项目
npm list react react-dom typescript
```

### 清理环境

```bash
# 删除旧的构建产物
rm -rf dist/
rm -rf build/

# 清理 npm 缓存 (可选)
npm cache clean --force

# 删除 node_modules 并重新安装 (如果有问题)
rm -rf node_modules/
npm install
```

### 安装依赖

```bash
# 进入项目目录
cd /Users/peak/work/pikecode/storycraft

# 安装所有依赖
npm install

# 验证安装成功
npm ls | head -20
```

### 构建项目

```bash
# 执行构建命令
npm run build

# 构建过程会输出：
# > storycraft@0.1.0 build
# > tsc -b && vite build
#
# vite v6.3.5 building for production...
# transforming...
# ✓ 4788 modules transformed.
# rendering chunks...
# computing gzip size...
# build/index.html                     0.44 kB │ gzip:   0.29 kB
# build/assets/index-*.css             74.84 kB │ gzip:  13.02 kB
# build/assets/index-*.js            3,140.60 kB │ gzip: 898.65 kB
# ✓ built in 4.73s
```

### 等待构建完成 ✓

构建完成时会看到 ✓ 符号和完成时间。

---

## 打包产物说明

### 目录结构

```bash
# 查看构建产物
ls -la dist/

# 输出应为：
# drwxr-xr-x  4 user  staff   128  Oct 25 10:30 dist/
# -rw-r--r--  1 user  staff   450  Oct 25 10:30 index.html
# drwxr-xr-x  2 user  staff  4096  Oct 25 10:30 assets/

# 查看 assets 内容
ls -lh dist/assets/

# 输出应包含：
# -rw-r--r--  1 user  staff  3.0M Oct 25 10:30 index-Djlt02iD.js
# -rw-r--r--  1 user  staff   72K Oct 25 10:30 index-Du-M3A_0.css
```

### 文件说明

| 文件 | 大小 | 说明 |
|------|------|------|
| **index.html** | ~450 bytes | 入口 HTML，引入 JS 和 CSS |
| **assets/index-*.js** | ~3.0 MB (gzip: 899 KB) | 应用主程序 JS |
| **assets/index-*.css** | ~72 KB (gzip: 13 KB) | 样式文件 |
| **assets/vendor-*.js** | ~500 KB (如果有) | 第三方库 |

### 构建产物大小检查

```bash
# 计算整个 dist 目录的大小
du -sh dist/

# 输出示例：
# 3.1M dist/

# 查看每个文件的大小
du -sh dist/*
du -sh dist/assets/*

# 统计文件个数
find dist -type f | wc -l

# 输出示例：
# 5
```

### ✓ 检查清单

构建完成后验证：

```bash
# 1. 检查 index.html 是否存在
test -f dist/index.html && echo "✓ index.html 存在" || echo "✗ 缺少 index.html"

# 2. 检查 assets 目录是否存在
test -d dist/assets && echo "✓ assets 目录存在" || echo "✗ 缺少 assets 目录"

# 3. 检查 JS 文件是否存在
test -f dist/assets/*.js && echo "✓ JS 文件存在" || echo "✗ 缺少 JS 文件"

# 4. 检查 CSS 文件是否存在
test -f dist/assets/*.css && echo "✓ CSS 文件存在" || echo "✗ 缺少 CSS 文件"

# 5. 快速验证脚本
cat > verify-build.sh << 'EOF'
#!/bin/bash
echo "=== 构建产物验证 ==="
echo "总大小: $(du -sh dist/ | awk '{print $1}')"
echo "文件数: $(find dist -type f | wc -l)"
echo ""
echo "核心文件："
ls -lh dist/index.html
ls -lh dist/assets/index-*.js 2>/dev/null | head -1
ls -lh dist/assets/index-*.css 2>/dev/null | head -1
echo ""
echo "✓ 验证完成"
EOF

chmod +x verify-build.sh
./verify-build.sh
```

---

## 手动部署到 COS

### 方法 1: 网页控制台上传（最简单）

#### 步骤 1: 打开腾讯云 COS 控制台

1. 访问 https://console.cloud.tencent.com/cos
2. 选择你的存储桶
3. 点击"上传文件"按钮

#### 步骤 2: 上传前的准备

```bash
# 清理旧文件（使用命令行工具）
# 或在网页控制台中手动删除所有文件

# 如果使用命令行，先配置 coscmd
npm install -g coscmd
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r ap-guangzhou
coscmd delete -r /  # 删除所有文件
```

#### 步骤 3: 上传文件

**在网页控制台上传：**

1. 点击"上传文件"
2. 进入 `dist/` 目录
3. 全选所有内容：
   ```bash
   # 在 dist 目录中：
   - index.html (选中)
   - assets/ (文件夹，选中)
   ```
4. 拖拽到上传区域或点击选择
5. 等待上传完成（显示绿色✓）

#### 步骤 4: 验证上传

1. 刷新列表
2. 应能看到：
   ```
   index.html
   assets/
     - index-Djlt02iD.js
     - index-Du-M3A_0.css
   ```
3. 点击 `index.html` → "详情" → "对象地址"
4. 复制地址在浏览器中打开，验证是否能访问

### 方法 2: 命令行上传（推荐）

#### 安装 coscmd

```bash
# 方法 A: 使用 npm
npm install -g coscmd

# 方法 B: 使用 pip
pip3 install coscmd

# 验证安装
coscmd --version
```

#### 获取 API 密钥

1. 访问 https://console.cloud.tencent.com/cam/capi
2. 点击"创建密钥"
3. 获得 `SecretId` 和 `SecretKey`
4. **妥善保存**（不要提交到 Git）

#### 配置 coscmd

```bash
# 获取存储桶信息
# 从 COS 控制台 → 存储桶 → 基础配置
# 找到：
# - 存储桶名称: storycraft-frontend-1234567890
# - 所属地域: ap-guangzhou

# 配置 coscmd
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>

# 完整示例：
coscmd config -a AKIDXXXXXXXXXXXXXX -s xxxxxxxxxxxxxx -b storycraft-frontend-1234567890 -r ap-guangzhou

# 验证配置
coscmd info
```

#### 上传文件

```bash
# 进入构建目录
cd dist/

# 方法 A: 上传整个目录
coscmd upload -r . /

# 方法 B: 只上传必要的文件
coscmd upload index.html /index.html
coscmd upload -r assets/ /assets/

# 方法 C: 使用跳过本地目录分隔符
coscmd upload -r . / --skip '\.git'

# 查看上传进度
# coscmd 会显示进度条和上传的文件列表
```

#### 验证上传结果

```bash
# 列出 COS 中的文件
coscmd list

# 输出应为：
# index.html
# assets/index-Djlt02iD.js
# assets/index-Du-M3A_0.css

# 详细信息
coscmd list -a

# 查看文件大小
coscmd list -r /
```

#### 快速上传脚本

```bash
# 创建上传脚本
cat > upload-to-cos.sh << 'EOF'
#!/bin/bash

# 配置
COS_BUCKET="storycraft-frontend-1234567890"
COS_REGION="ap-guangzhou"
COS_SECRET_ID="your-secret-id"
COS_SECRET_KEY="your-secret-key"

# 清空远程文件
echo "清空 COS 中的旧文件..."
coscmd config -a $COS_SECRET_ID -s $COS_SECRET_KEY -b $COS_BUCKET -r $COS_REGION
coscmd delete -r /

# 上传新文件
echo "上传新文件..."
cd dist/
coscmd upload -r . /

# 验证
echo ""
echo "上传完成！上传的文件列表："
coscmd list -a

echo ""
echo "访问地址："
echo "https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/index.html"
EOF

chmod +x upload-to-cos.sh
./upload-to-cos.sh
```

#### 更安全的配置方法

```bash
# 不要在脚本中硬编码密钥，使用环境变量
export COS_SECRET_ID="your-secret-id"
export COS_SECRET_KEY="your-secret-key"

# 配置 coscmd
coscmd config -a $COS_SECRET_ID -s $COS_SECRET_KEY -b your-bucket -r ap-guangzhou

# 验证
coscmd info

# 上传
cd dist/
coscmd upload -r . /
```

### 方法 3: 使用 WinSCP 或 FTP (如果有服务器)

```bash
# 如果你有 FTP 或 SCP 服务器，可以使用图形工具
# 1. 打开 WinSCP 或 FileZilla
# 2. 连接到服务器
# 3. 定位到 dist/ 目录
# 4. 拖拽上传所有文件到服务器的 /var/www/html/
```

---

## 手动部署到服务器

### 准备工作

```bash
# 1. 获取服务器信息
# - 服务器 IP: 你的服务器公网 IP
# - 用户名: ubuntu / root / 其他
# - SSH 密钥: your_key.pem

# 2. 设置 SSH 密钥权限
chmod 600 your_key.pem

# 3. 测试 SSH 连接
ssh -i your_key.pem ubuntu@your_server_ip
# 如果能连接，输入 exit 退出
```

### 方法 1: 使用 SCP 上传

```bash
# 在本地执行，上传整个 dist 目录
scp -i your_key.pem -r dist/ ubuntu@your_server_ip:/tmp/storycraft_dist/

# 或上传到指定位置
scp -i your_key.pem -r dist/* ubuntu@your_server_ip:/var/www/html/

# 验证上传
ssh -i your_key.pem ubuntu@your_server_ip "ls -la /tmp/storycraft_dist/"
```

### 方法 2: 通过 SSH 部署脚本

```bash
# 创建部署脚本
cat > deploy-to-server.sh << 'EOF'
#!/bin/bash

# 配置
SSH_KEY="your_key.pem"
SSH_USER="ubuntu"
SSH_HOST="your_server_ip"
REMOTE_PATH="/var/www/html"

echo "上传文件到服务器..."
# 上传文件
scp -i $SSH_KEY -r dist/* $SSH_USER@$SSH_HOST:$REMOTE_PATH/

echo "验证部署..."
# 验证部署
ssh -i $SSH_KEY $SSH_USER@$SSH_HOST << 'REMOTE'
  echo "服务器上的文件列表："
  ls -la /var/www/html/ | head -10
  echo ""
  echo "✓ 部署完成"
REMOTE

echo ""
echo "访问地址: http://your_server_ip"
echo "确保 Nginx 已配置并指向 $REMOTE_PATH"
EOF

chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

### 方法 3: 使用 SFTP 或图形工具

```bash
# 打开 FileZilla 或 WinSCP
# 1. 协议: SFTP
# 2. 主机: your_server_ip
# 3. 用户名: ubuntu
# 4. 密码: 使用密钥文件选项
# 5. 密钥文件: 选择 your_key.pem
# 6. 连接后，定位到 /var/www/html
# 7. 拖拽 dist/ 中的所有文件上传
```

### 服务器端配置 (部署后)

```bash
# SSH 连接到服务器
ssh -i your_key.pem ubuntu@your_server_ip

# 进入网站目录
cd /var/www/html

# 检查文件
ls -la

# 应能看到：
# -rw-r--r-- 1 ubuntu ubuntu   450 Oct 25 index.html
# drwxr-xr-x 2 ubuntu ubuntu  4096 Oct 25 assets/

# 如果需要，设置正确的权限
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx
```

---

## 验证部署

### 验证 COS 部署

```bash
# 1. 获取 COS 访问地址
# 在 COS 控制台 → 存储桶 → 概览
# 找到"访问域名"，格式如：
# https://storycraft-frontend-1234567890.cos.ap-guangzhou.myqcloud.com

# 2. 在浏览器中访问
# https://storycraft-frontend-1234567890.cos.ap-guangzhou.myqcloud.com/index.html

# 3. 使用 curl 验证
curl -I https://storycraft-frontend-1234567890.cos.ap-guangzhou.myqcloud.com/index.html

# 应返回：
# HTTP/2 200
# Content-Type: text/html; charset=utf-8
# Content-Length: 450
```

### 验证服务器部署

```bash
# 1. 使用 curl 验证
curl -I http://your_server_ip/index.html

# 应返回：
# HTTP/1.1 200 OK
# Content-Type: text/html; charset=utf-8

# 2. 检查页面内容
curl http://your_server_ip/ | head -20

# 应包含：
# <!DOCTYPE html>
# <html lang="zh">

# 3. 查看完整响应
curl -v http://your_server_ip/
```

### 浏览器验证清单

访问部署的地址，检查：

- [ ] **页面加载** - 页面完整显示，无白屏
- [ ] **样式加载** - 页面有样式，不是纯文本
- [ ] **脚本加载** - 页面功能正常（可点击、输入等）
- [ ] **控制台错误** - F12 打开开发者工具，Console 标签无红色错误
- [ ] **Network 标签** - 所有资源状态码都是 200
- [ ] **路由导航** - 点击菜单能正常跳转路由

### 检查网络加载

```bash
# 打开浏览器开发者工具 (F12)
# 1. 点击 Network 标签
# 2. 刷新页面
# 3. 查看以下内容：

# 应有请求：
#   index.html - 200 - text/html
#   index-*.js - 200 - application/javascript
#   index-*.css - 200 - text/css

# 不应有：
#   红色请求 (4xx, 5xx)
#   CORS 错误
#   404 错误
```

---

## 常见问题

### Q1: 构建报错怎么办？

**A**: 按顺序尝试：

```bash
# 1. 检查 Node 版本
node --version  # 需要 16+ 或 18+

# 2. 清理缓存
npm cache clean --force

# 3. 删除 node_modules 重装
rm -rf node_modules/
rm package-lock.json
npm install

# 4. 再次构建
npm run build

# 如果还是报错，查看完整错误信息
npm run build 2>&1 | tee build.log
# 查看 build.log 文件找出具体错误
```

### Q2: 上传后页面是 404？

**A**:

```bash
# COS 方案：
# 1. 检查索引文档设置
#    存储桶 → 基础配置 → 静态网站 → 索引文档: index.html
# 2. 检查错误文档设置
#    错误文档: index.html (重要！SPA 需要)
# 3. 刷新浏览器缓存
#    按 Ctrl+Shift+Del，清除浏览历史

# 服务器方案：
# 1. 检查文件是否真的上传了
ssh -i key.pem ubuntu@ip "ls -la /var/www/html/"
# 2. 检查 Nginx 配置中的 root 路径
sudo cat /etc/nginx/sites-enabled/default | grep root
# 3. 检查文件权限
sudo ls -l /var/www/html/index.html
# 应为 644 或 755 权限
```

### Q3: 样式/脚本加载不出来？

**A**:

```bash
# 1. 检查浏览器控制台
#    F12 → Network 标签 → 查看 assets 下的文件
#    如果是红色（4xx）则表示文件不存在

# 2. 检查文件名是否正确上传
coscmd list /assets/
# 或
ls -la /var/www/html/assets/

# 3. 清除浏览器缓存和 CDN 缓存
#    浏览器: Ctrl+Shift+Del
#    CDN: 控制台 → 缓存管理 → 清除

# 4. 使用 curl 直接访问
curl -I https://your-domain/assets/index-Djlt02iD.js
# 应返回 200，不是 404
```

### Q4: 访问其他路由显示 404？

**A**:

```bash
# 这是 SPA 路由问题，需要配置

# COS 方案：
# 确保"错误文档"设置为 index.html
# 这样所有 404 都会返回 index.html，由前端路由处理

# 服务器 + Nginx 方案：
# 修改 Nginx 配置
sudo nano /etc/nginx/sites-available/default

# 添加以下行到 location / 块：
location / {
    try_files $uri $uri/ /index.html;
}

# 保存后重启
sudo systemctl restart nginx
```

### Q5: 部署后文件太大，加载慢？

**A**:

```bash
# 1. 检查文件大小
du -sh dist/

# 2. 启用 Gzip 压缩 (服务器方案)
# 编辑 /etc/nginx/nginx.conf
gzip on;
gzip_types text/plain text/css application/javascript;

# 3. 使用 CDN 加速
# 见前端部署指南中的 CDN 配置

# 4. 分析包大小
npm install -g webpack-bundle-analyzer
# 在构建中使用以查找大文件
```

### Q6: 更新后如何重新部署？

**A**:

```bash
# 1. 本地修改代码并测试
npm run dev  # 本地测试

# 2. 重新构建
rm -rf dist/
npm run build

# 3. 重新上传 COS
cd dist/
coscmd delete -r /  # 删除旧文件
coscmd upload -r . /

# 或上传到服务器
scp -i key.pem -r dist/* ubuntu@ip:/var/www/html/

# 4. 清除 CDN 缓存 (如果有)
# 控制台 → CDN → 缓存管理 → 清除

# 5. 清除浏览器缓存并硬刷新
# 浏览器: Ctrl+Shift+Del
# 或按 Ctrl+Shift+R 硬刷新

# 为了避免缓存问题，可以在 HTML 添加版本号
# <script src="/assets/index-v1.0.0.js"></script>
```

### Q7: SSH 连接失败？

**A**:

```bash
# 1. 检查密钥文件权限
chmod 600 your_key.pem

# 2. 检查密钥是否正确
ssh-keygen -l -f your_key.pem

# 3. 尝试连接并查看详细错误
ssh -v -i your_key.pem ubuntu@your_ip

# 4. 检查防火墙
#    腾讯云安全组需要开放 22 端口

# 5. 使用密码登录 (如果配置了)
ssh ubuntu@your_ip
# 输入密码

# 6. 测试 SCP
scp -i your_key.pem -v dist/index.html ubuntu@your_ip:/tmp/
```

### Q8: 权限拒绝错误？

**A**:

```bash
# SCP 上传时权限错误：
# Error: Permission denied

# 解决方法：
# 1. 上传到 /tmp/ 再移动
scp -i key.pem -r dist/* ubuntu@ip:/tmp/
ssh -i key.pem ubuntu@ip "sudo mv /tmp/dist/* /var/www/html/"

# 2. 或给当前用户写权限
ssh -i key.pem ubuntu@ip "sudo chown ubuntu /var/www/html"
# 然后再上传

# 3. 查看目录权限
ssh -i key.pem ubuntu@ip "ls -ld /var/www/html"
# 应为 755 或 775
```

---

## 完整部署流程总结

### 快速检查清单

部署前：
- [ ] npm install 完成
- [ ] npm run build 成功
- [ ] dist/ 目录存在且包含文件

部署到 COS：
- [ ] COS 存储桶已创建
- [ ] 启用了"静态网站"功能
- [ ] 设置了"索引文档" = index.html
- [ ] 设置了"错误文档" = index.html
- [ ] 所有文件已上传
- [ ] coscmd list 能看到文件

部署到服务器：
- [ ] SSH 能连接
- [ ] /var/www/html 目录存在
- [ ] 文件已上传到服务器
- [ ] Nginx 已重启
- [ ] 防火墙开放了 80 和 443 端口

验证：
- [ ] 能在浏览器中访问页面
- [ ] 页面显示正常（有样式）
- [ ] 控制台无红色错误
- [ ] Network 标签所有文件都是 200

---

## 最小化部署命令

如果你已配置好工具，最快的部署流程：

```bash
# 1. 构建
npm run build

# 2. 上传到 COS (一行命令)
cd dist/ && coscmd delete -r / && coscmd upload -r . / && cd ..

# 或上传到服务器 (一行命令)
scp -i key.pem -r dist/* ubuntu@ip:/var/www/html/

# 3. 访问验证
echo "访问: https://你的域名"
```

---

## 部署脚本模板

保存为 `deploy.sh`，以后一键部署：

```bash
#!/bin/bash

# 配置
DEPLOY_TARGET=${1:-cos}  # cos 或 server
COS_BUCKET="your-bucket"
COS_REGION="ap-guangzhou"
SERVER_IP="your_server_ip"
SSH_KEY="your_key.pem"

echo "开始部署..."
echo "目标: $DEPLOY_TARGET"

# 1. 构建
echo "正在构建..."
npm run build
if [ $? -ne 0 ]; then
    echo "✗ 构建失败"
    exit 1
fi
echo "✓ 构建成功"

# 2. 部署
if [ "$DEPLOY_TARGET" = "cos" ]; then
    echo "正在上传到 COS..."
    cd dist/
    coscmd delete -r /
    coscmd upload -r . /
    cd ..
    echo "✓ COS 部署完成"
    echo "访问: https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com"

elif [ "$DEPLOY_TARGET" = "server" ]; then
    echo "正在上传到服务器..."
    scp -i $SSH_KEY -r dist/* ubuntu@$SERVER_IP:/var/www/html/
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "sudo systemctl restart nginx"
    echo "✓ 服务器部署完成"
    echo "访问: http://$SERVER_IP"
fi

echo ""
echo "✓ 部署完成！"
```

使用方法：

```bash
chmod +x deploy.sh

# 部署到 COS
./deploy.sh cos

# 部署到服务器
./deploy.sh server
```

---

**最后更新**: 2024年10月
**难度等级**: ⭐⭐ (基础) ~ ⭐⭐⭐ (脚本自动化)
