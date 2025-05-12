# 剧本创作工具

基于React + TypeScript + Vite构建的剧本创作工具前端应用，用于辅助编剧创作剧本，管理角色和剧情。

## 项目进度

### 已完成页面
- 剧本编辑器页面（ScriptEditor）：主要剧本编辑功能
- 分幕列表页面（SceneList）：展示分幕列表，包含时间线、原型、剧情等信息
- 分幕编辑器页面（SceneEditor）：编辑单个分幕内容
- 导航组件（Navigation）：页面顶部导航栏
- 侧边栏组件（Sidebar）：作品集和知识库管理

### 正在开发中的页面
- 大纲页面（OutlinePage）：剧本大纲管理（基础UI已完成，功能开发中）
- 角色页面（CharactersPage）：角色管理（基础UI已完成，功能开发中）
- 关系页面（RelationsPage）：角色关系管理（基础UI已完成，功能开发中）
- 章节页面（ChaptersPage）：章节管理（基础UI已完成，功能开发中）

### 计划功能
- 知识库管理
- 角色剧本生成
- 主持人手册生成
- 物料管理
- 剧本导出
- 多用户协作

## 技术栈

- React 18
- TypeScript
- Vite
- React Router（路由管理）
- TailwindCSS（样式）
- Framer Motion（动画）
- TanStack Table（表格组件）
- Iconify（图标库）

## 开发指南

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 原Vite模板信息

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
