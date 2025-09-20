# Prompt管理云函数

## 功能概述

这个云函数提供了完整的prompt管理功能，包括增删改查操作。主要用于管理AI模型调用时的prompt模板。

## 数据结构

### Prompt字段说明

```typescript
interface Prompt {
  id: string;                    // 唯一标识
  name: string;                  // prompt名称
  description: string;           // prompt描述
  category: string;              // 分类（如：角色生成、剧本生成、大纲生成等）
  content: string;               // prompt内容
  variables: string[];           // 可替换的变量列表
  model: string;                 // 适用的模型
  language: string;              // 语言
  isActive: boolean;             // 是否启用
  isDefault: boolean;            // 是否为默认prompt
  createdBy: string;             // 创建者
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  usageCount: number;            // 使用次数
  tags: string[];                // 标签
}
```

## API接口

### 1. 获取prompt列表

```javascript
POST /prompt_manager
{
  "action": "list",
  "category": "角色生成",        // 可选，按分类筛选
  "isActive": true,             // 可选，按启用状态筛选
  "search": "角色",             // 可选，搜索关键词
  "page": 1,                    // 可选，页码
  "limit": 20                   // 可选，每页数量
}
```

### 2. 获取单个prompt

```javascript
POST /prompt_manager
{
  "action": "get",
  "id": "prompt_id"
}
```

### 3. 创建prompt

```javascript
POST /prompt_manager
{
  "action": "create",
  "name": "角色生成模板",
  "description": "用于生成小说角色的prompt模板",
  "category": "角色生成",
  "content": "请根据以下信息生成一个角色：\n姓名：{name}\n年龄：{age}",
  "variables": ["name", "age"],
  "model": "deepseek-r1",
  "language": "zh-CN",
  "isActive": true,
  "isDefault": false,
  "createdBy": "admin",
  "tags": ["角色", "生成"]
}
```

### 4. 更新prompt

```javascript
POST /prompt_manager
{
  "action": "update",
  "id": "prompt_id",
  "name": "更新后的名称",
  "isActive": false
  // ... 其他需要更新的字段
}
```

### 5. 删除prompt

```javascript
POST /prompt_manager
{
  "action": "delete",
  "id": "prompt_id"
}
```

### 6. 切换启用状态

```javascript
POST /prompt_manager
{
  "action": "toggle_active",
  "id": "prompt_id"
}
```

## 前端页面

访问 `/app/prompt` 路径即可使用prompt管理页面。

### 页面功能

1. **列表展示**：显示所有prompt，支持搜索、分类筛选、状态筛选
2. **创建prompt**：通过模态框创建新的prompt
3. **编辑prompt**：修改现有prompt的信息
4. **查看详情**：查看prompt的完整信息
5. **删除prompt**：删除不需要的prompt
6. **状态切换**：快速启用/禁用prompt
7. **变量管理**：管理prompt中的可替换变量
8. **标签管理**：为prompt添加标签便于分类

### 使用说明

1. **创建prompt**：点击"新建Prompt"按钮，填写必要信息
2. **变量定义**：在prompt内容中使用 `{变量名}` 格式定义变量
3. **分类管理**：选择合适的分类便于后续筛选
4. **默认设置**：每个分类只能有一个默认prompt
5. **状态控制**：可以随时启用/禁用prompt

## 部署说明

1. 确保已安装CloudBase CLI
2. 在functions/prompt_manager目录下运行：
   ```bash
   npm install
   ```
3. 部署云函数：
   ```bash
   cloudbase functions:deploy prompt_manager
   ```

## 测试

运行测试脚本：
```bash
node test.js
```

## 注意事项

1. 确保数据库连接正常
2. 每个分类只能有一个默认prompt
3. 删除prompt操作不可逆，请谨慎操作
4. 变量名建议使用英文，避免特殊字符
5. prompt内容支持多行文本，建议合理格式化
