# StoryCraft 认证和路由系统 - 完整文档索引

本目录包含关于 StoryCraft 项目认证和路由系统的完整探索文档。

## 文档列表

### 1. EXPLORATION_SUMMARY.txt (快速参考)
**最快查找答案的地方**

- 关键发现总结
- 文件位置速查表
- 认证流程概览
- 常见操作代码片段
- 潜在问题和改进建议
- 技术栈概览

**适合**：快速查询、获得概览、找到具体文件位置

### 2. AUTH_ROUTING_ANALYSIS.md (详细技术文档)
**最全面的技术参考**

分为 13 个部分：
1. 项目结构概览
2. 路由系统详解 (完整路由树)
3. 认证状态管理 (AuthContext 详解)
4. 认证令牌存储机制
5. 路由保护机制 (ProtectedRoute)
6. 页面刷新时的状态恢复
7. Token 过期处理完整流程
8. 完整认证流程（登录到 API 请求）
9. 访问权限控制总结
10. 关键技术点总结
11. 文件位置快速参考
12. 发现的潜在问题
13. 完整认证流程图

**适合**：深入理解系统设计、了解完整流程、学习最佳实践

### 3. CODE_SNIPPETS_REFERENCE.md (可复用代码)
**实战开发参考**

包含 9 个部分，提供可直接复用的代码：
1. 核心代码片段 (检查登录、获取token、API请求等)
2. 路由保护代码
3. Token过期处理代码
4. localStorage 操作
5. API拦截器使用
6. CloudBase 操作
7. ShortplayEntryPage 使用示例
8. 常见错误和调试
9. 最佳实践

**适合**：开发新功能、解决具体问题、复制粘贴代码

## 快速导航

### 我需要...

**了解项目认证系统的整体架构**
→ 阅读 `AUTH_ROUTING_ANALYSIS.md` 第 1-3 部分

**找到某个功能文件的位置**
→ 查看 `EXPLORATION_SUMMARY.txt` 第 2 部分 或 `AUTH_ROUTING_ANALYSIS.md` 第 11 部分

**理解登录流程**
→ 查看 `EXPLORATION_SUMMARY.txt` 第 3 部分 或 `AUTH_ROUTING_ANALYSIS.md` 第 8 部分

**在新组件中使用认证**
→ 查看 `CODE_SNIPPETS_REFERENCE.md` 第 1 部分

**保护新路由**
→ 查看 `CODE_SNIPPETS_REFERENCE.md` 第 2 部分

**处理 Token 过期**
→ 查看 `CODE_SNIPPETS_REFERENCE.md` 第 3 部分

**理解 Token 存储和传输**
→ 查看 `AUTH_ROUTING_ANALYSIS.md` 第 4 部分

**调试认证问题**
→ 查看 `CODE_SNIPPETS_REFERENCE.md` 第 8 部分

**学习最佳实践**
→ 查看 `CODE_SNIPPETS_REFERENCE.md` 第 9 部分

## 核心概念

### 一键创作页面 (/app/shortplay-entry)
- 路由定义：`/src/router.tsx` 第 54-55 行
- 组件文件：`/src/components/ShortplayEntryPage.tsx`
- 保护方式：`<ProtectedRoute>` 包装
- 访问流程：登录 → /app/home → 自动重定向到 /app/shortplay-entry

### 认证检查
```typescript
// 方法 1: 使用 hook
const { isAuthenticated, user, token } = useAuth();

// 方法 2: 路由保护
<ProtectedRoute><MyComponent /></ProtectedRoute>
```

### Token 获取和使用
```typescript
// 获取 token
const authHeader = getAuthHeader();  // "Bearer ${token}"
const token = getAccessToken();       // 纯 token

// 在请求中使用
headers: { 'Authorization': authHeader || '' }
```

### Token 过期处理
- 自动检测：HTTP 401 + 错误信息匹配
- 自动处理：触发 logout() 并重定向到登录页
- 实现位置：`apiInterceptor` 和 `TokenExpiryHandler`

## 发现的主要问题

| 问题 | 现状 | 原因 | 改进建议 |
|------|------|------|---------|
| 页面刷新丢失认证状态 | 刷新后重新登录 | AuthContext不恢复localStorage | 初始化时读取localStorage |
| Token存储不一致 | 内存和localStorage可能不同步 | 登录时不保存token | 登录时保存到localStorage |
| Token刷新未实现 | refreshToken()返回false | CloudBase不支持 | 如果支持，实现刷新逻辑 |
| 一键创作间接访问 | 必须经过/app/home | 设计选择 | 考虑直接访问优化 |

## 文件结构参考

```
/src
├── router.tsx                    ← 路由定义（注意第54-55行）
├── main.tsx                      ← 应用入口（AuthProvider）
├── App.tsx                       ← 主应用布局（TokenExpiryHandler）
├── cloudbase.ts                  ← Token管理和CloudBase配置
├── contexts/
│   └── AuthContext.tsx          ← 认证状态管理
├── services/
│   ├── authService.ts           ← 登录/注册API
│   ├── apiInterceptor.ts        ← API拦截器（Token过期处理）
│   ├── paymentService.ts        ← 支付服务（使用认证）
│   └── ...其他服务
└── components/
    ├── LoginPage.tsx            ← 登录页面
    ├── RegisterPage.tsx         ← 注册页面
    ├── HomePage.tsx             ← 首页（重定向到shortplay-entry）
    ├── ProtectedRoute.tsx       ← 路由保护组件
    ├── TokenExpiryHandler.tsx  ← Token过期处理组件
    ├── ShortplayEntryPage.tsx  ← 一键创作页面 ✓
    └── ...其他页面
```

## 使用这些文档的建议

1. **第一次阅读**：先读 `EXPLORATION_SUMMARY.txt`（5-10分钟）
2. **深入学习**：读 `AUTH_ROUTING_ANALYSIS.md` 的相关部分（30-60分钟）
3. **实际开发**：参考 `CODE_SNIPPETS_REFERENCE.md` 中的代码片段

## 提示

- 所有文件中的**文件路径都是绝对路径**
- 所有代码片段都可以直接复用或作为参考
- 流程图清晰地展示了认证流程的各个阶段
- 关键概念和最佳实践部分特别值得学习

## 关于本文档

- 生成时间：2025-11-03
- 覆盖范围：认证、路由、Token 管理、权限控制
- 代码版本：基于当前 dev-peak-02 分支
- 验证状态：所有代码路径和概念都已在源代码中验证

---

**快速链接：**
- [详细技术分析](./AUTH_ROUTING_ANALYSIS.md)
- [代码片段参考](./CODE_SNIPPETS_REFERENCE.md)
- [快速参考](./EXPLORATION_SUMMARY.txt)
