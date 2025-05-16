# 剧本创作工具 | Script Writing Tool

基于React + TypeScript + Vite构建的剧本创作工具前端应用，用于辅助编剧创作剧本，管理角色和剧情。

*A script writing tool frontend application built with React + TypeScript + Vite, designed to assist screenwriters in creating scripts, managing characters, and developing plots.*

## 项目进度 | Project Progress

### 已完成页面 | Completed Pages
- 剧本编辑器页面（ScriptEditor）：主要剧本编辑功能，整合了Editor.js实现富文本编辑
- 分幕列表页面（SceneList）：展示分幕列表，包含时间线、原型、剧情等信息
- 分幕编辑器页面（SceneEditor）：编辑单个分幕内容
- 导航组件（Navigation）：页面顶部导航栏
- 侧边栏组件（Sidebar）：作品集和知识库管理
- 中间操作台（MiddleSection）：提供AI辅助写作功能，支持多种交互模式

*- Script Editor (ScriptEditor): Main script editing functionality with Editor.js for rich text editing*
*- Scene List (SceneList): Displays scenes with timeline, archetypes, plot points*
*- Scene Editor (SceneEditor): Edit individual scene content*
*- Navigation (Navigation): Top navigation bar*
*- Sidebar (Sidebar): Portfolio and knowledge base management*
*- Middle Section (MiddleSection): AI-assisted writing with multiple interaction modes*

### 正在迭代中的页面 | Pages Under Iteration
- 剧本编辑器页面（ScriptEditor）：优化布局，添加批注和模板功能
- 中间操作台（MiddleSection）：增强消息编辑、历史记录管理和模式切换功能
- 文本编辑区域（EditorComponent）：基于Editor.js实现更强大的富文本编辑功能

*- Script Editor (ScriptEditor): Layout optimization, annotation and template features*
*- Middle Section (MiddleSection): Enhanced message editing, history management, and mode switching*
*- Text Editor Area (EditorComponent): Advanced rich text editing based on Editor.js*

### 开发中的页面 | Pages Under Development
- 大纲页面（OutlinePage）：剧本大纲管理（基础UI已完成，功能开发中）
- 角色页面（CharactersPage）：角色管理（基础UI已完成，功能开发中）
- 关系页面（RelationsPage）：角色关系管理（基础UI已完成，功能开发中）
- 章节页面（ChaptersPage）：章节管理（基础UI已完成，功能开发中）

*- Outline Page (OutlinePage): Script outline management (basic UI completed, functionality in development)*
*- Characters Page (CharactersPage): Character management (basic UI completed, functionality in development)*
*- Relations Page (RelationsPage): Character relationship management (basic UI completed, functionality in development)*
*- Chapters Page (ChaptersPage): Chapter management (basic UI completed, functionality in development)*

### 计划功能 | Planned Features
- 知识库管理：支持创建和管理写作参考资料
- 角色剧本生成：基于角色设定自动生成相关剧情
- 主持人手册生成：自动生成TRPG主持人手册
- 物料管理：管理剧本相关素材和资源
- 剧本导出：多种格式导出功能
- 多用户协作：支持多人同时编辑

*- Knowledge Base Management: Create and manage writing references*
*- Character Script Generation: Automatically generate plot based on character settings*
*- Game Master Handbook Generation: Automatically generate TRPG GM handbooks*
*- Asset Management: Manage script-related materials and resources*
*- Script Export: Multiple format export functionality*
*- Multi-user Collaboration: Support for simultaneous editing by multiple users*

## 技术栈 | Tech Stack

- React 18 
- TypeScript
- Vite
- React Router（路由管理 | Routing management）
- TailwindCSS（样式 | Styling）
- Framer Motion（动画 | Animations）
- TanStack Table（表格组件 | Table components）
- Iconify（图标库 | Icon library）
- Editor.js（富文本编辑 | Rich text editing）

## 开发指南 | Development Guide

```bash
# 安装依赖 | Install dependencies
npm install

# 启动开发服务器 | Start development server
npm run dev

# 构建生产版本 | Build for production
npm run build
```
