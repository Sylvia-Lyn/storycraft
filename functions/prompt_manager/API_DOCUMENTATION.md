# Prompt Manager API 接口文档

## 概述

Prompt Manager 是一个基于腾讯云 CloudBase 的云函数服务，提供 Prompt 的完整管理功能，包括增删改查、状态管理等操作。

**基础信息：**
- 服务类型：HTTP API
- 认证方式：Bearer Token
- 响应格式：JSON
- 字符编码：UTF-8

## 认证

所有 API 请求都需要在请求头中包含有效的认证信息：

```http
Authorization: Bearer <your_token>
```

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "request_id": "prompt_1703123456789_abc123def"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "request_id": "prompt_1703123456789_abc123def"
}
```

### HTTP 状态码
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 认证失败/Token 过期
- `404` - 资源不存在
- `500` - 服务器内部错误
- `503` - 服务不可用

## API 接口

### 1. 健康检查

检查服务状态和可用性。

**请求：**
```http
GET /health
```

**响应：**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2023-12-21T10:30:00.000Z",
  "cloudbase_available": true,
  "environment": {
    "node_version": "v18.17.0",
    "platform": "linux"
  }
}
```

### 2. 获取 Prompt 列表

获取 Prompt 列表，支持分页、搜索和筛选。

**请求：**
```http
POST /
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "list",
  "category": "story_generation",
  "isActive": true,
  "search": "关键词",
  "page": 1,
  "limit": 20,
  "location": "homepage",
  "option": "quick_start"
}
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值 "list" |
| category | string | 否 | 分类筛选 |
| isActive | boolean | 否 | 是否启用 |
| search | string | 否 | 搜索关键词 |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |
| location | string | 否 | 位置筛选 |
| option | string | 否 | 选项筛选 |

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "prompt_123",
      "name": "故事生成器",
      "description": "用于生成创意故事的 Prompt",
      "category": "story_generation",
      "content": "你是一个专业的故事创作助手...",
      "variables": ["genre", "character", "setting"],
      "model": "deepseek-r1",
      "language": "zh-CN",
      "isActive": true,
      "isDefault": false,
      "createdBy": "system",
      "tags": ["creative", "story"],
      "location": "homepage",
      "option": "quick_start",
      "usageCount": 156,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-20T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  },
  "request_id": "prompt_1703123456789_abc123def"
}
```

### 3. 获取单个 Prompt

根据 ID 获取特定的 Prompt 详情。

**请求：**
```http
POST /
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "get",
  "id": "prompt_123"
}
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值 "get" |
| id | string | 是 | Prompt ID |

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "prompt_123",
    "name": "故事生成器",
    "description": "用于生成创意故事的 Prompt",
    "category": "story_generation",
    "content": "你是一个专业的故事创作助手...",
    "variables": ["genre", "character", "setting"],
    "model": "deepseek-r1",
    "language": "zh-CN",
    "isActive": true,
    "isDefault": false,
    "createdBy": "system",
    "tags": ["creative", "story"],
    "location": "homepage",
    "option": "quick_start",
    "usageCount": 156,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-20T15:30:00.000Z"
  },
  "request_id": "prompt_1703123456789_abc123def"
}
```

### 4. 创建 Prompt

创建新的 Prompt。

**请求：**
```http
POST /
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "create",
  "name": "新故事生成器",
  "description": "用于生成创意故事的 Prompt",
  "category": "story_generation",
  "content": "你是一个专业的故事创作助手...",
  "variables": ["genre", "character", "setting"],
  "model": "deepseek-r1",
  "language": "zh-CN",
  "isActive": true,
  "isDefault": false,
  "createdBy": "system",
  "tags": ["creative", "story"],
  "location": "homepage",
  "option": "quick_start"
}
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值 "create" |
| name | string | 是 | Prompt 名称 |
| description | string | 是 | Prompt 描述 |
| category | string | 是 | 分类 |
| content | string | 是 | Prompt 内容 |
| variables | array | 否 | 变量列表，默认 [] |
| model | string | 否 | 模型名称，默认 "deepseek-r1" |
| language | string | 否 | 语言，默认 "zh-CN" |
| isActive | boolean | 否 | 是否启用，默认 true |
| isDefault | boolean | 否 | 是否默认，默认 false |
| createdBy | string | 否 | 创建者，默认 "system" |
| tags | array | 否 | 标签列表，默认 [] |
| location | string | 否 | 位置 |
| option | string | 否 | 选项 |

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "prompt_456",
    "name": "新故事生成器",
    "description": "用于生成创意故事的 Prompt",
    "category": "story_generation",
    "content": "你是一个专业的故事创作助手...",
    "variables": ["genre", "character", "setting"],
    "model": "deepseek-r1",
    "language": "zh-CN",
    "isActive": true,
    "isDefault": false,
    "createdBy": "system",
    "tags": ["creative", "story"],
    "location": "homepage",
    "option": "quick_start",
    "usageCount": 0,
    "createdAt": "2023-12-21T10:30:00.000Z",
    "updatedAt": "2023-12-21T10:30:00.000Z"
  },
  "request_id": "prompt_1703123456789_abc123def"
}
```

### 5. 更新 Prompt

更新现有的 Prompt。

**请求：**
```http
POST /
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "update",
  "id": "prompt_123",
  "name": "更新后的故事生成器",
  "description": "更新后的描述",
  "content": "更新后的 Prompt 内容...",
  "isActive": true
}
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值 "update" |
| id | string | 是 | Prompt ID |
| name | string | 否 | Prompt 名称 |
| description | string | 否 | Prompt 描述 |
| category | string | 否 | 分类 |
| content | string | 否 | Prompt 内容 |
| variables | array | 否 | 变量列表 |
| model | string | 否 | 模型名称 |
| language | string | 否 | 语言 |
| isActive | boolean | 否 | 是否启用 |
| isDefault | boolean | 否 | 是否默认 |
| tags | array | 否 | 标签列表 |
| location | string | 否 | 位置 |
| option | string | 否 | 选项 |

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "prompt_123",
    "name": "更新后的故事生成器",
    "description": "更新后的描述",
    "category": "story_generation",
    "content": "更新后的 Prompt 内容...",
    "variables": ["genre", "character", "setting"],
    "model": "deepseek-r1",
    "language": "zh-CN",
    "isActive": true,
    "isDefault": false,
    "createdBy": "system",
    "tags": ["creative", "story"],
    "location": "homepage",
    "option": "quick_start",
    "usageCount": 156,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-21T10:30:00.000Z"
  },
  "request_id": "prompt_1703123456789_abc123def"
}
```

### 6. 删除 Prompt

删除指定的 Prompt。

**请求：**
```http
POST /
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "delete",
  "id": "prompt_123"
}
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值 "delete" |
| id | string | 是 | Prompt ID |

**响应：**
```json
{
  "success": true,
  "message": "Prompt删除成功",
  "request_id": "prompt_1703123456789_abc123def"
}
```

### 7. 切换 Prompt 状态

启用或禁用指定的 Prompt。

**请求：**
```http
POST /
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "toggle_active",
  "id": "prompt_123"
}
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 固定值 "toggle_active" |
| id | string | 是 | Prompt ID |

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "prompt_123",
    "isActive": false
  },
  "message": "Prompt已禁用",
  "request_id": "prompt_1703123456789_abc123def"
}
```

## 错误代码

| 错误代码 | 说明 |
|----------|------|
| `INVALID_ACTION` | 无效的操作 |
| `MISSING_ID` | 缺少 Prompt ID |
| `MISSING_REQUIRED_FIELDS` | 缺少必填字段 |
| `PROMPT_NOT_FOUND` | Prompt 不存在 |
| `TOKEN_EXPIRED` | Token 过期 |
| `DATABASE_UNAVAILABLE` | 数据库不可用 |
| `LIST_ERROR` | 获取列表失败 |
| `GET_ERROR` | 获取 Prompt 失败 |
| `CREATE_ERROR` | 创建 Prompt 失败 |
| `UPDATE_ERROR` | 更新 Prompt 失败 |
| `DELETE_ERROR` | 删除 Prompt 失败 |
| `TOGGLE_ERROR` | 切换状态失败 |
| `REQUEST_ERROR` | 请求处理失败 |
| `SERIALIZATION_ERROR` | 响应序列化失败 |

## 使用示例

### JavaScript/TypeScript

下面用 `your-cloudbase-url` 来表示项目环境的域名。目前是 stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com
```javascript
// 获取 Prompt 列表
const response = await fetch('https://your-cloudbase-url/prompt_manager', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_token_here'
  },
  body: JSON.stringify({
    action: 'list',
    category: 'story_generation',
    page: 1,
    limit: 10
  })
});

const data = await response.json();
console.log(data);
```

### cURL

```bash
# 获取 Prompt 列表
curl -X POST "https://your-cloudbase-url/prompt_manager" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "action": "list",
    "category": "story_generation",
    "page": 1,
    "limit": 10
  }'

# 创建 Prompt
curl -X POST "https://your-cloudbase-url/prompt_manager" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "action": "create",
    "name": "新 Prompt",
    "description": "描述",
    "category": "story_generation",
    "content": "Prompt 内容"
  }'
```

## 注意事项

1. **认证要求**：所有 API 请求都需要有效的认证 Token
2. **请求频率**：建议控制请求频率，避免过于频繁的调用
3. **数据验证**：创建和更新操作会验证必填字段
4. **默认 Prompt**：设置 `isDefault: true` 时会自动取消同分类下的其他默认 Prompt
5. **分页限制**：建议单次查询限制在 100 条以内
6. **错误处理**：请根据返回的错误代码进行相应的错误处理

