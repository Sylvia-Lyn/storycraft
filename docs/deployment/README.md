# 部署文档

部署、运维和环境配置相关文档。

## 📚 文档列表

### 1. DEPLOYMENT_GUIDE.md ⭐⭐⭐⭐⭐
**完整部署指南（推荐首先阅读）**

涵盖所有部署方式：
- 打包构建步骤
- 三种部署选项（Nginx、Node.js、Docker）
- 环境配置说明
- 常见问题解决
- 性能优化建议

**部署选项**:
- ✅ Nginx 静态部署（生产推荐）
- ✅ Node.js + PM2 部署
- ✅ Docker 容器部署

**适合场景**: 任何部署环境的首选参考

---

### 2. NGINX_CONFIGURATION_STARTUP.md ⭐⭐⭐⭐
**Nginx 配置和启动详解**

专门针对 Nginx 的部署指南：
- 完整的 Nginx 配置文件
- API 代理配置
- SSL/HTTPS 设置
- 性能优化
- 故障排查

**适合场景**: 使用 Nginx 作为 Web 服务器

---

### 3. FRONTEND_DEPLOYMENT_GUIDE.md ⭐⭐⭐⭐
**前端专项部署指南**

前端应用的部署专项文档：
- 构建和优化
- 多种部署环境
- Docker 化部署
- CDN 配置
- 缓存策略

**适合场景**: 前端应用部署、Docker 部署

---

### 4. LOCAL_BUILD_MANUAL_DEPLOYMENT.md ⭐⭐⭐
**本地手动部署指南**

在本地开发环境中进行部署：
- 本地环境设置
- 手动编译和打包
- 本地测试运行
- 常见错误排查

**适合场景**:
- 本地开发测试
- 不使用容器的环境

---

### 5. SERVICE_STARTUP_GUIDE.md ⭐⭐⭐
**服务启动指南**

使用 Node.js 直接启动服务：
- 快速启动命令
- PM2 进程管理
- 集群配置
- 日志管理
- 自动重启

**适合场景**:
- 开发环境快速启动
- 小规模部署

---

### 6. DEPLOYMENT_GUIDE_TENCENTCLOUD.md ⭐⭐⭐⭐
**腾讯云专项部署**

在腾讯云上部署的完整指南：
- 腾讯云环境配置
- COS 对象存储
- CDN 加速
- 服务器部署
- 域名配置

**适合场景**: 在腾讯云上部署

---

## 🎯 快速导航

### 我要选择部署方式

```
├─ 使用 Nginx（推荐生产）
│  └─ 阅读: DEPLOYMENT_GUIDE.md (选项 A)
│     或 NGINX_CONFIGURATION_STARTUP.md
│
├─ 使用 Node.js + PM2
│  └─ 阅读: DEPLOYMENT_GUIDE.md (选项 B)
│     或 SERVICE_STARTUP_GUIDE.md
│
├─ 使用 Docker
│  └─ 阅读: DEPLOYMENT_GUIDE.md (选项 C)
│     或 FRONTEND_DEPLOYMENT_GUIDE.md
│
├─ 在腾讯云上部署
│  └─ 阅读: DEPLOYMENT_GUIDE_TENCENTCLOUD.md
│
└─ 本地开发部署
   └─ 阅读: LOCAL_BUILD_MANUAL_DEPLOYMENT.md
```

---

## 📋 部署检查清单

### 构建阶段
- [ ] Node.js 18+ 已安装
- [ ] npm/pnpm 依赖已安装
- [ ] `npm run build` 成功
- [ ] `build/` 目录已生成

### 环境配置
- [ ] 后端 API 地址正确
- [ ] Nginx/服务器配置完成
- [ ] 环境变量已设置
- [ ] 日志目录已创建

### 服务启动
- [ ] 服务正常启动
- [ ] 访问主页正常
- [ ] API 代理正常
- [ ] 日志输出正常

### 验证和测试
- [ ] 页面加载速度正常
- [ ] 登录流程正常
- [ ] API 调用正常
- [ ] 文件上传正常

### 生产上线
- [ ] SSL/HTTPS 已配置
- [ ] 备份已做好
- [ ] 监控已启动
- [ ] 告警已设置

---

## 🚀 快速开始（5 分钟）

### 最快的部署方式（Node.js）

```bash
# 1. 构建
npm install
npm run build

# 2. 启动
npm run preview

# 3. 访问
# http://localhost:3000
```

**参考文档**: SERVICE_STARTUP_GUIDE.md

### 生产级部署（Nginx）

```bash
# 1. 构建
npm run build

# 2. 复制文件
sudo cp -r build/* /var/www/storycraft/

# 3. 配置 Nginx（参考文档中的配置）

# 4. 重启 Nginx
sudo systemctl restart nginx
```

**参考文档**: NGINX_CONFIGURATION_STARTUP.md

---

## 📊 部署方式对比

| 特性 | Nginx | Node.js | Docker |
|-----|-------|---------|--------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 易用性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 可靠性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 学习成本 | 中等 | 低 | 中等 |
| 生产推荐 | ✅ 强烈推荐 | ⚠️ 可用 | ✅ 推荐 |

---

## 🔧 常见任务

| 任务 | 参考文档 |
|-----|---------|
| 快速测试部署 | SERVICE_STARTUP_GUIDE.md |
| 生产级部署 | DEPLOYMENT_GUIDE.md + NGINX_CONFIGURATION_STARTUP.md |
| Docker 部署 | DEPLOYMENT_GUIDE.md (选项 C) |
| 腾讯云部署 | DEPLOYMENT_GUIDE_TENCENTCLOUD.md |
| 性能优化 | DEPLOYMENT_GUIDE.md (性能优化部分) |
| 解决部署问题 | DEPLOYMENT_GUIDE.md (常见问题) |

---

## 💾 备份和恢复

### 备份重要文件

```bash
# 备份构建产物
cp -r build backup_$(date +%Y%m%d_%H%M%S)

# 备份配置文件
cp /etc/nginx/conf.d/storycraft.conf backup/

# 备份数据库（如有）
# mysqldump -u user -p database > backup.sql
```

### 恢复

```bash
# 恢复备份
cp -r backup_YYYYMMDD_HHMMSS/* /var/www/storycraft/

# 重启服务
sudo systemctl restart nginx
```

---

## 📞 故障排查

### 常见问题

**页面 404 错误**
- 检查 Nginx 配置的 SPA 路由（`try_files`）
- 查看 `docs/deployment/DEPLOYMENT_GUIDE.md` 常见问题

**API 502 错误**
- 检查后端 API 服务是否运行
- 检查 Nginx 代理配置
- 查看代理日志: `/var/log/nginx/error.log`

**登录失败**
- 检查 Session Cookie 设置
- 验证认证接口返回数据结构
- 查看浏览器控制台错误
- 参考 `docs/architecture/AUTH_ROUTING_ANALYSIS.md`

更多问题参考: `DEPLOYMENT_GUIDE.md` 中的"常见问题"部分

---

## 🔐 安全建议

1. **启用 HTTPS**
   - 使用 Let's Encrypt 获取免费证书
   - 配置 SSL 强制 HTTPS

2. **防火墙配置**
   - 仅开放 80 和 443 端口
   - 限制内部访问

3. **定期更新**
   - 更新依赖包
   - 修补安全漏洞

4. **备份策略**
   - 定期备份
   - 异地备份

---

## 📈 监控和维护

### 日志监控

```bash
# 实时查看 Nginx 日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看 PM2 日志
pm2 logs storycraft
```

### 性能监控

```bash
# 检查服务器资源
top
htop

# 检查磁盘使用
df -h

# 检查内存使用
free -h
```

---

## 📚 推荐阅读顺序

1. **首次部署**: `DEPLOYMENT_GUIDE.md`
2. **选择方式后**: 对应的专项文档
3. **遇到问题**: 查看常见问题部分
4. **优化性能**: 参考性能优化建议

---

**最后更新**: 2024-11-03
