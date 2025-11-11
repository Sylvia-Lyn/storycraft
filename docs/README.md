# StoryCraft 项目文档

完整的项目文档整理。所有文档已按类别组织。

## 📁 文档结构

```
docs/
├── README.md                          # 本文件 - 文档导航
├── architecture/                      # 🏗️  架构和设计文档
├── deployment/                        # 🚀 部署和运维文档
├── development/                       # 👨‍💻 开发指南
├── api/                               # 📡 API 和集成文档
├── changelog/                         # 📝 变更日志和修复记录
└── legacy/                            # 📦 归档文档
```

---

## 🏗️ 架构文档 (`/architecture`)

项目设计、架构和系统组件文档。

| 文件 | 说明 |
|-----|------|
| **README_AUTH_ROUTING.md** | 身份验证和路由系统架构 |
| **README_SHORTPLAY_ARCHITECTURE.md** | 一键创作功能的完整架构 |
| **AUTH_ROUTING_ANALYSIS.md** | 身份验证流程的详细分析 |
| **COMPONENT_DEPENDENCY_MAP.md** | 组件依赖关系图 |
| **SHORTPLAY_STRUCTURE_ANALYSIS.md** | 一键创作的结构分析 |

**查看场景**:
- 需要理解项目整体架构 → `README_SHORTPLAY_ARCHITECTURE.md`
- 需要理解认证流程 → `README_AUTH_ROUTING.md` 或 `AUTH_ROUTING_ANALYSIS.md`
- 需要查看组件依赖 → `COMPONENT_DEPENDENCY_MAP.md`

---

## 🚀 部署文档 (`/deployment`)

部署、运维和环境配置相关文档。

| 文件 | 说明 | 部署方式 |
|-----|------|--------|
| **DEPLOYMENT_GUIDE.md** | ⭐ 推荐阅读 - 完整部署指南 | 通用 |
| **FRONTEND_DEPLOYMENT_GUIDE.md** | 前端专项部署指南 | Nginx / Docker |
| **DEPLOYMENT_GUIDE_TENCENTCLOUD.md** | 腾讯云专项部署 | 腾讯云 |
| **NGINX_CONFIGURATION_STARTUP.md** | Nginx 配置和启动 | Nginx |
| **LOCAL_BUILD_MANUAL_DEPLOYMENT.md** | 本地手动部署 | 本地 |
| **SERVICE_STARTUP_GUIDE.md** | 服务启动指南 | Node.js / PM2 |

**快速开始**:
- 生产环境部署 → `DEPLOYMENT_GUIDE.md`
- 使用 Nginx → `NGINX_CONFIGURATION_STARTUP.md`
- 使用 Docker → `FRONTEND_DEPLOYMENT_GUIDE.md`
- 本地开发 → `LOCAL_BUILD_MANUAL_DEPLOYMENT.md`

---

## 👨‍💻 开发指南 (`/development`)

开发工作流、指南和最佳实践。

| 文件 | 说明 |
|-----|------|
| **SEGMENTED_CUSTOMIZATION_GUIDE.md** | 功能定制化开发指南 |
| **SEGMENTED_QUICK_REFERENCE.md** | 快速参考手册 |

**使用场景**:
- 添加新功能 → `SEGMENTED_CUSTOMIZATION_GUIDE.md`
- 快速查找 API 和代码片段 → `SEGMENTED_QUICK_REFERENCE.md`

---

## 📡 API 文档 (`/api`)

API 调用、集成和代码示例。

| 文件 | 说明 |
|-----|------|
| **CODE_SNIPPETS_REFERENCE.md** | 常用代码片段和 API 示例 |

**使用场景**:
- 查找代码示例 → `CODE_SNIPPETS_REFERENCE.md`
- 查看 API 调用方式 → `CODE_SNIPPETS_REFERENCE.md`

---

## 📝 变更日志 (`/changelog`)

项目修改、重构和问题修复的记录。

| 文件 | 说明 | 状态 |
|-----|------|------|
| **SHORTPLAY_REFACTOR_COMPLETE.md** | 一键创作重构完成报告 | ✅ 完成 |
| **SHORTPLAY_REFACTOR.md** | 一键创作重构计划 | 历史 |
| **SHORTPLAY_REFACTOR_PROGRESS.md** | 重构进度跟踪 | 历史 |
| **SHORTPLAY_FIX_NOTES.md** | 一键创作修复笔记 | 历史 |
| **STORYBOARD_DELETE_FIXED.md** | 分镜板删除功能修复 | ✅ 完成 |
| **STORYBOARD_DELETE_FIX.md** | 分镜板删除功能修复计划 | 历史 |
| **DELETE_CONFIRM_COMPLETE.md** | 删除确认完成记录 | ✅ 完成 |
| **EXPLORATION_SUMMARY.txt** | 项目探索总结 | 历史 |

**使用场景**:
- 查看最近的修改 → `SHORTPLAY_REFACTOR_COMPLETE.md`
- 了解已修复的问题 → 对应的 `_FIXED` 文件

---

## 📦 归档文档 (`/legacy`)

已归档或过时的文档，仅供参考。

| 文件 | 说明 |
|-----|------|
| **DOCS_INDEX.md** | 旧的文档索引（已归档） |

---

## 🎯 按用途查看文档

### 我是新开发者，想了解项目

1. 📖 阅读根目录的 `README.md`
2. 🏗️ 查看 `docs/architecture/README_SHORTPLAY_ARCHITECTURE.md`
3. 📚 阅读 `docs/development/SEGMENTED_QUICK_REFERENCE.md`

### 我需要部署项目

1. 📋 阅读 `docs/deployment/DEPLOYMENT_GUIDE.md`
2. 根据部署方式选择：
   - Nginx → `docs/deployment/NGINX_CONFIGURATION_STARTUP.md`
   - Docker → `docs/deployment/FRONTEND_DEPLOYMENT_GUIDE.md`
   - 本地 → `docs/deployment/LOCAL_BUILD_MANUAL_DEPLOYMENT.md`

### 我需要开发新功能

1. 📖 查看 `docs/architecture/` 相关文档
2. 📡 查看 `docs/api/CODE_SNIPPETS_REFERENCE.md`
3. 👨‍💻 参考 `docs/development/SEGMENTED_CUSTOMIZATION_GUIDE.md`

### 我想了解认证流程

1. `docs/architecture/README_AUTH_ROUTING.md` - 总体架构
2. `docs/architecture/AUTH_ROUTING_ANALYSIS.md` - 详细分析

### 我想了解一键创作功能

1. `docs/architecture/README_SHORTPLAY_ARCHITECTURE.md` - 完整架构
2. `docs/architecture/SHORTPLAY_STRUCTURE_ANALYSIS.md` - 结构分析
3. `docs/changelog/SHORTPLAY_REFACTOR_COMPLETE.md` - 最新修改

---

## 📊 文档统计

```
总文档数: 24 个
├── 架构文档: 5 个 ⭐⭐⭐⭐⭐
├── 部署文档: 6 个 ⭐⭐⭐⭐⭐
├── 开发指南: 2 个 ⭐⭐⭐
├── API 文档: 1 个 ⭐⭐⭐
├── 变更日志: 8 个 ⭐⭐
└── 归档文档: 1 个 📦
```

---

## 🔍 快速搜索

### 按关键词查找文档

| 关键词 | 文档 |
|-------|------|
| 部署 | 🚀 `/deployment/*` |
| 认证 | 🏗️ `/architecture/AUTH_*.md` |
| API | 📡 `/api/*.md` |
| 组件 | 🏗️ `/architecture/COMPONENT_*.md` |
| 修复 | 📝 `/changelog/*_FIXED.md` |
| 架构 | 🏗️ `/architecture/*.md` |

---

## 📝 文档维护信息

- **最后更新**: 2024-11-03
- **文档类型**: AI 生成 + 手工整理
- **维护者**: 开发团队
- **语言**: 中文

---

## 📌 文档说明

### 三星级文档 ⭐⭐⭐

推荐阅读，包含关键信息。

### 四星级文档 ⭐⭐⭐⭐

必读文档，包含完整指南。

### 五星级文档 ⭐⭐⭐⭐⭐

关键文档，涵盖核心内容。

---

## 💡 建议

1. **首次访问** → 按"我是新开发者"路径阅读
2. **遇到问题** → 用关键词搜索对应文档
3. **需要参考** → 查看 API 文档和代码片段
4. **了解变更** → 查看 changelog 文件夹

---

**祝开发愉快！🚀**
