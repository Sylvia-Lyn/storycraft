# Storycraft 部署方案文档

## 部署概述

本文档描述了 Storycraft 项目到 AWS EC2 服务器的完整部署流程。

## 部署环境信息

| 项目 | 值 |
|------|-----|
| **远程服务器IP** | 18.181.192.140 |
| **远程服务器用户** | ec2-user |
| **SSH密钥文件** | /Users/peak/lch.pem |
| **远程构建路径** | /home/ec2-user/build |
| **Web服务器** | Nginx |
| **项目类型** | React + Vite |

## 部署前置条件

- 本地已安装 Node.js 和 npm
- SSH 密钥文件已正确配置：`/Users/peak/lch.pem`
- 远程服务器 SSH 访问正常
- 远程服务器已安装 Nginx 且处于运行状态

## 部署步骤

### 1. 构建项目

```bash
npm run build
```

**说明：**
- 执行 TypeScript 编译：`tsc -b`
- 执行 Vite 构建：`vite build`
- 输出目录：`./build`
- 生成的文件包括：
  - `index.html` - 主页面
  - `assets/` - 打包后的 JS 和 CSS
  - 静态资源文件

### 2. 上传构建文件到服务器

```bash
scp -i /Users/peak/lch.pem -r ./build/* ec2-user@18.181.192.140:/home/ec2-user/build/
```

**说明：**
- 使用 SCP 协议上传
- 递归上传整个 build 目录下的所有文件
- 目标路径：`/home/ec2-user/build/`

### 3. 重新加载 Nginx 配置

```bash
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo systemctl reload nginx"
```

**说明：**
- 重新加载 Nginx 配置，使新文件生效
- 不需要重启 Nginx，用户连接不会中断

## 完整部署流程（一键部署）

如果需要一次性执行所有步骤，可以运行：

```bash
npm run build && \
scp -i /Users/peak/lch.pem -r ./build/* ec2-user@18.181.192.140:/home/ec2-user/build/ && \
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo systemctl reload nginx"
```

## 部署验证

部署完成后，可以验证：

1. **检查服务器上的文件：**
```bash
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "ls -lah /home/ec2-user/build/"
```

2. **检查 Nginx 状态：**
```bash
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo systemctl status nginx"
```

3. **访问应用：**
在浏览器中访问 `http://18.181.192.140` 查看应用是否正常运行

## 部署问题排查

| 问题 | 排查方法 |
|------|--------|
| **SSH 连接失败** | 检查 SSH 密钥权限：`chmod 600 /Users/peak/lch.pem` |
| **Host key 验证失败** | 运行：`ssh-keyscan -H 18.181.192.140 >> ~/.ssh/known_hosts` |
| **Nginx 无法找到新文件** | 确认文件已上传到 `/home/ec2-user/build/` |
| **页面加载失败** | 检查 Nginx 日志：`ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo tail -f /var/log/nginx/error.log"` |

## Nginx 配置参考

确保 Nginx 配置正确指向构建目录。典型的配置示例：

```nginx
server {
    listen 80;
    server_name _;

    root /home/ec2-user/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 部署后检查项

- [ ] 构建完成，无错误信息
- [ ] 文件成功上传到服务器
- [ ] Nginx 成功重新加载
- [ ] 应用可以通过浏览器正常访问
- [ ] 页面功能正常，无 404 错误

## 自动化部署建议

未来可以考虑的自动化方案：
- 使用 GitHub Actions 自动部署
- 使用 Docker 容器化部署
- 使用 PM2 进程管理（如果后端也需要部署）
- 使用 CI/CD 流水线（如 GitLab CI、Jenkins 等）

## 相关命令速查

```bash
# 部署
npm run build
scp -i /Users/peak/lch.pem -r ./build/* ec2-user@18.181.192.140:/home/ec2-user/build/

# 验证
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "ls -lah /home/ec2-user/build/"

# 重新加载 Nginx
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo systemctl reload nginx"

# 查看日志
ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo tail -f /var/log/nginx/access.log"
```

## 快速部署清单

部署时按照以下步骤执行（推荐使用 Claude Code 自动部署）：

### 使用 Claude Code 自动部署

```bash
# 在 Claude Code 中执行以下操作：
# 1. 创建部署任务清单
# 2. 执行 npm run build
# 3. 上传文件：scp -i /Users/peak/lch.pem -r ./build/* ec2-user@18.181.192.140:/home/ec2-user/build/
# 4. 重新加载 Nginx：ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo systemctl reload nginx"
# 5. 验证部署结果
```

### 部署验证检查清单

部署后必须检查以下项目：

- [ ] **构建日志检查**
  - TypeScript 编译无错误
  - Vite 构建成功，显示 `✓ built in X.XXs`
  - JS 文件大小合理（约 3100+ kB）

- [ ] **文件上传验证**
  - `index.html` 已更新（检查时间戳）
  - `assets/` 目录包含最新的 JS 和 CSS 文件
  - 运行命令：`ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "ls -lah /home/ec2-user/build/"`

- [ ] **Nginx 状态验证**
  - Nginx 服务处于 Active (running) 状态
  - 最后重载时间为最近的部署时间
  - 运行命令：`ssh -i /Users/peak/lch.pem ec2-user@18.181.192.140 "sudo systemctl status nginx"`

- [ ] **应用访问验证**
  - 在浏览器访问 `http://18.181.192.140`
  - 页面加载成功，无 404 错误
  - 功能正常运行（登录、生成等）

## 常见部署场景

### 场景 1：标准功能更新部署
当只修改了功能代码（如修改 UI、API 调用等）：
1. 本地代码修改和测试
2. 执行 `npm run build`
3. 上传文件并重新加载 Nginx
4. 验证页面在浏览器正常加载

### 场景 2：API 参数变更部署
当修改了 API 调用参数（如请求体字段、接口路径等）：
1. 确保修改了所有相关的 API 调用代码
2. 执行 `npm run build`
3. 清除浏览器缓存后访问应用
4. 验证 API 请求和响应正确

### 场景 3：类型定义和接口更新
当修改了 TypeScript 接口和类型定义：
1. 确保所有相关组件都已更新
2. TypeScript 编译必须无错误
3. 执行 `npm run build`
4. 验证页面数据显示和交互正常

## 故障排查指南

### 部署后页面无法访问

**症状：** 访问 `http://18.181.192.140` 返回 502 或 404 错误

**排查步骤：**
1. 检查 Nginx 状态：`sudo systemctl status nginx`
2. 查看 Nginx 错误日志：`sudo tail -50 /var/log/nginx/error.log`
3. 确认文件已上传到 `/home/ec2-user/build/`
4. 检查文件权限：`ls -la /home/ec2-user/build/index.html`

### 样式或 JS 加载失败

**症状：** 页面加载但样式混乱或功能不工作

**排查步骤：**
1. 清除浏览器缓存：Ctrl+Shift+Delete（或 Cmd+Shift+Delete）
2. 检查浏览器开发者工具（F12）中的网络标签
3. 查看是否有 404 错误的资源
4. 确认 `assets/` 目录中的文件完整

### 构建失败

**症状：** `npm run build` 显示错误

**排查步骤：**
1. 检查 TypeScript 错误：`tsc -b`
2. 清理 node_modules：`rm -rf node_modules && npm install`
3. 检查磁盘空间：`df -h`
4. 查看完整的错误信息并修复源代码

## 性能优化建议

### 当前存在的问题

- JS 文件过大（3100+ kB），超过 500 kB 警告阈值
- 可能影响首屏加载速度

### 优化方案

1. **代码分割（Code Splitting）**
   ```bash
   # 在 vite.config.ts 中配置
   manualChunks: {
     vendor: ['react', 'react-dom'],
     // 其他大型库的分割
   }
   ```

2. **动态导入（Dynamic Import）**
   - 将路由组件改为动态导入
   - 将大型组件改为按需加载

3. **删除未使用的依赖**
   - 分析 node_modules 中的大型库
   - 考虑使用轻量级替代方案

4. **启用 Gzip 压缩**
   ```nginx
   # 在 Nginx 配置中添加
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

## 更新历史

| 日期 | 操作 | 说明 |
|------|------|------|
| 2025-11-08 | 部署更新 | 音频tab功能优化部署，更新部署文档 |
| 2025-11-05 | 首次部署 | 创建部署方案和文档 |

### 2025-11-08 部署更新内容
- ✅ 优化场景创建空状态逻辑
- ✅ 修改场景新增接口参数（添加 seriesId，episodeId 可选）
- ✅ 音色重命名接口变更：`/voice/update` → `/voice/rename`
- ✅ 音色重命名参数变更：`voiceName` → `aliasName`
- ✅ 已设置列表使用 `displayName` 显示
- ✅ 可用音色列表去除重命名功能
- ✅ 可用音色列表使用 `voiceName` 显示

---

**文档版本：** 2.0
**最后更新：** 2025-11-08
**维护人员：** Claude Code
