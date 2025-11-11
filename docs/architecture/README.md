# 架构文档

项目设计、架构和系统组件文档。

## 📚 文档列表

### 1. README_AUTH_ROUTING.md
**身份验证和路由系统架构** ⭐⭐⭐⭐⭐

核心认证系统的完整架构设计，包括：
- 用户认证流程
- 路由保护机制
- Session 管理
- Token 处理

**适合场景**:
- 理解认证系统
- 实现自定义认证
- 解决认证问题

---

### 2. README_SHORTPLAY_ARCHITECTURE.md
**一键创作功能的完整架构** ⭐⭐⭐⭐⭐

一键创作（短视频创作）功能的整体设计，包括：
- 功能模块划分
- 数据流向
- 组件关系
- API 调用流程

**适合场景**:
- 理解一键创作整体结构
- 添加新功能
- 重构现有功能

---

### 3. AUTH_ROUTING_ANALYSIS.md
**身份验证流程的详细分析** ⭐⭐⭐⭐

深入分析认证路由，包括：
- 登录流程分析
- 路由保护详解
- 问题诊断
- 常见错误

**适合场景**:
- 调试认证问题
- 深入理解认证系统
- 性能优化

---

### 4. COMPONENT_DEPENDENCY_MAP.md
**组件依赖关系图** ⭐⭐⭐⭐

项目中组件间的依赖关系，包括：
- 组件层级结构
- 依赖关系
- 数据流向
- 状态管理

**适合场景**:
- 理解组件结构
- 减少不必要的依赖
- 优化性能

---

### 5. SHORTPLAY_STRUCTURE_ANALYSIS.md
**一键创作的结构分析** ⭐⭐⭐⭐

详细分析一键创作的内部结构，包括：
- 模块构成
- 数据结构
- 逻辑流程
- 交互方式

**适合场景**:
- 深入了解一键创作
- 修复复杂问题
- 代码重构

---

## 🎯 快速导航

| 任务 | 推荐文档 |
|-----|---------|
| 理解整个项目架构 | README_SHORTPLAY_ARCHITECTURE.md |
| 理解认证系统 | README_AUTH_ROUTING.md |
| 了解组件结构 | COMPONENT_DEPENDENCY_MAP.md |
| 调试认证问题 | AUTH_ROUTING_ANALYSIS.md |
| 理解一键创作细节 | SHORTPLAY_STRUCTURE_ANALYSIS.md |

---

## 📖 阅读顺序

**新开发者推荐阅读顺序**:

1. `README_SHORTPLAY_ARCHITECTURE.md` - 了解整体架构
2. `README_AUTH_ROUTING.md` - 理解认证系统
3. `COMPONENT_DEPENDENCY_MAP.md` - 了解组件关系
4. `SHORTPLAY_STRUCTURE_ANALYSIS.md` - 深入一键创作细节
5. `AUTH_ROUTING_ANALYSIS.md` - 按需深入认证细节

---

## 🔑 关键概念

### 核心架构模式
- **基于 React Context 的全局状态管理**
- **路由保护 (Protected Routes)**
- **Session-based 认证**
- **API 拦截器模式**

### 主要模块
- **AuthContext** - 认证状态管理
- **ShortplayEntryPage** - 一键创作主页面
- **ProtectedRoute** - 路由保护
- **authService** - 认证服务

### 关键概念
- Session Cookie 管理
- Token 验证
- 用户信息同步
- API 代理

---

## 💡 常见问题

**Q: 如何理解认证流程？**
A: 阅读 `README_AUTH_ROUTING.md` 的流程图部分，然后查看 `AUTH_ROUTING_ANALYSIS.md` 的详细分析。

**Q: 一键创作如何工作？**
A: 先读 `README_SHORTPLAY_ARCHITECTURE.md` 的总体概述，再看 `SHORTPLAY_STRUCTURE_ANALYSIS.md` 的细节。

**Q: 如何添加新组件？**
A: 参考 `COMPONENT_DEPENDENCY_MAP.md` 确定依赖关系，然后在 `README_SHORTPLAY_ARCHITECTURE.md` 中找到合适的位置。

---

## 📊 文档映射

```
架构文档/
├── 认证系统
│   ├── README_AUTH_ROUTING.md
│   └── AUTH_ROUTING_ANALYSIS.md
│
├── 一键创作
│   ├── README_SHORTPLAY_ARCHITECTURE.md
│   └── SHORTPLAY_STRUCTURE_ANALYSIS.md
│
└── 组件关系
    └── COMPONENT_DEPENDENCY_MAP.md
```

---

**最后更新**: 2024-11-03
