# 开发指南

开发工作流、指南和最佳实践。

## 📚 文档列表

### 1. SEGMENTED_CUSTOMIZATION_GUIDE.md ⭐⭐⭐
**功能定制化开发指南**

详细的功能定制和开发指南，包括：
- 功能模块定制
- 工作流自定义
- 扩展点说明
- 实现示例

**适合场景**:
- 添加新功能
- 定制现有功能
- 扩展系统能力

---

### 2. SEGMENTED_QUICK_REFERENCE.md ⭐⭐⭐
**快速参考手册**

常用开发参考手册，包括：
- 快速查询
- 常用 API
- 代码片段
- 常见问题

**适合场景**:
- 快速查找信息
- 代码参考
- 问题排查

---

## 🎯 快速导航

| 任务 | 推荐文档 |
|-----|---------|
| 添加新功能 | SEGMENTED_CUSTOMIZATION_GUIDE.md |
| 快速查找 API | SEGMENTED_QUICK_REFERENCE.md |
| 定制业务流程 | SEGMENTED_CUSTOMIZATION_GUIDE.md |
| 代码示例 | SEGMENTED_QUICK_REFERENCE.md |

---

## 💻 开发流程

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/pikecode/storycraft.git
cd storycraft

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
open http://localhost:3000
```

### 2. 开发新功能

参考: `SEGMENTED_CUSTOMIZATION_GUIDE.md`

```bash
# 创建功能分支
git checkout -b feature/your-feature

# 进行开发
# ... 编辑文件 ...

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送分支
git push origin feature/your-feature

# 创建 Pull Request
```

### 3. 代码审查

- 确保通过所有测试
- 检查代码风格
- 验证功能完整性

### 4. 合并和部署

```bash
# 合并到主分支
git checkout main
git pull origin main
git merge feature/your-feature

# 构建和部署
npm run build
# 参考 docs/deployment/
```

---

## 🛠️ 开发工具和命令

### 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器（含热更新）
npm run dev:full        # 完整开发模式

# 构建
npm run build           # 生产编译
npm run preview         # 预览生产构建

# 代码质量
npm run lint            # ESLint 检查
npm run lint -- --fix   # 自动修复

# 测试
npm run test            # 运行测试
```

### 项目结构

```
storycraft/
├── src/
│   ├── components/      # React 组件
│   ├── contexts/        # React Context
│   ├── services/        # API 服务
│   ├── pages/           # 页面组件
│   ├── hooks/           # React Hooks
│   ├── types/           # TypeScript 定义
│   └── utils/           # 工具函数
├── public/              # 静态资源
├── docs/                # 文档（本文件夹）
└── build/               # 构建输出
```

---

## 📖 开发最佳实践

### 代码风格

1. **使用 TypeScript**
   - 所有新代码使用 TypeScript
   - 避免 `any` 类型

2. **遵循 ESLint 规则**
   ```bash
   npm run lint -- --fix
   ```

3. **注释清晰**
   ```typescript
   // 说明代码意图
   // 特别是复杂逻辑
   ```

### 组件开发

1. **函数式组件优先**
   ```typescript
   const MyComponent: React.FC<Props> = ({ prop1 }) => {
     return <div>{prop1}</div>;
   };
   ```

2. **使用 Hooks**
   ```typescript
   const [state, setState] = useState(initialValue);
   const [effect, setEffect] = useState(null);

   useEffect(() => {
     // 副作用逻辑
   }, [dependencies]);
   ```

3. **合理使用 Context**
   - 全局状态用 Context
   - 局部状态用 useState

### API 调用

1. **使用统一的服务**
   ```typescript
   // 在 src/services/ 中定义
   // 在组件中调用
   ```

2. **错误处理**
   ```typescript
   try {
     const result = await api.call();
   } catch (error) {
     console.error('Error:', error);
     // 用户提示
   }
   ```

3. **加载状态**
   ```typescript
   const [loading, setLoading] = useState(false);
   // 显示 loading 指示器
   ```

---

## 🔍 常见开发任务

### 添加新页面

1. 在 `src/pages/` 创建组件
2. 在路由配置中添加路由
3. 创建相应的样式文件

参考: `SEGMENTED_CUSTOMIZATION_GUIDE.md`

### 添加新 API 服务

1. 在 `src/services/` 创建服务文件
2. 定义 API 接口
3. 添加错误处理
4. 在组件中使用

### 修改样式

项目使用 **Tailwind CSS** 和 **Ant Design**:

```typescript
// Tailwind CSS
className="w-full h-auto bg-blue-500 hover:bg-blue-600"

// Ant Design
<Button type="primary">Click me</Button>
```

### 调试

**浏览器开发者工具**:
- F12 打开开发者工具
- 查看 Console 日志
- 查看 Network 请求
- 设置断点调试

**VS Code 调试**:
```json
// launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

---

## 📝 开发规范

### Git 提交规范

```
feat:  新功能
fix:   修复 bug
docs:  文档更新
style: 代码风格（不影响功能）
refactor: 代码重构
perf:  性能优化
test:  添加/修改测试
chore: 构建、依赖等其他变更
```

例子:
```
git commit -m "feat: 添加图片生成功能"
git commit -m "fix: 修复登录刷新问题"
```

### 分支规范

```
main              # 生产版本
develop           # 开发主分支
feature/*         # 功能分支
bugfix/*          # 修复分支
```

### PR (Pull Request) 规范

1. 从 `main` 或 `develop` 创建分支
2. 进行开发和测试
3. 提交 PR 到 `main`/`develop`
4. 至少一人审核后才能合并

---

## 🧪 测试

### 运行测试

```bash
npm run test
```

### 编写测试

```typescript
// component.test.tsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## 📚 相关文档

- 架构设计: `docs/architecture/`
- API 参考: `docs/api/`
- 部署指南: `docs/deployment/`

---

## 💡 获取帮助

### 遇到问题时

1. 查看 `SEGMENTED_QUICK_REFERENCE.md` 中的常见问题
2. 查看 Git 历史找类似的修改
3. 查看相关的架构文档
4. 查看浏览器控制台错误

### 需要代码示例

- 参考 `docs/api/CODE_SNIPPETS_REFERENCE.md`
- 参考现有的类似实现
- 参考相关的架构文档

---

## 🚀 提交代码前检查清单

- [ ] 代码通过 ESLint 检查
- [ ] 测试通过
- [ ] TypeScript 类型检查无误
- [ ] 功能测试通过
- [ ] 文档已更新
- [ ] 提交信息符合规范

---

**最后更新**: 2024-11-03
