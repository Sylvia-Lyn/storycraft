# API 文档

API 调用、集成和代码示例。

## 📚 文档列表

### CODE_SNIPPETS_REFERENCE.md ⭐⭐⭐
**常用代码片段和 API 示例**

包含：
- 常用 API 调用示例
- 组件开发示例
- 工具函数示例
- 集成示例

**适合场景**:
- 快速查找代码示例
- 学习如何使用特定功能
- 集成第三方服务

---

## 🎯 主要 API

### 认证服务 (authService)

```typescript
// 登录
AuthService.login(username: string, password: string)

// 注册
AuthService.register(username: string, password: string, confirmPassword: string)

// 获取用户信息
AuthService.getUserInfo(token: string)

// 验证会话
AuthService.validateSession(userId?: string | number)
```

---

### 一键创作服务 (shortplayService)

```typescript
// 创建剧本
createSeries(userInput: string)

// 获取剧本详情
getSeriesDetail(seriesId?: string)

// 场景相关
getSceneContent(sceneId: number)
updateScene(sceneId: number, sceneTitle: string)
createSceneContent(data: SceneContentData)
updateSceneContent(data: SceneContentUpdateData)
deleteSceneContent(id: number)

// 音色相关
getVoiceList(status: number)
updateVoice(data: VoiceUpdateData)
batchBindVoice(bindings: VoiceBinding[])
designVoice(prompt: string)

// BGM 相关
getBgmList()
generateBgm(userInput: string, style: string)

// 图片相关
generateImage(sceneId: number, userInput: string)

// 分镜板相关
getStoryboardList(sceneId: number)
createStoryboard(data: StoryboardData)
updateStoryboard(data: StoryboardUpdateData)
deleteStoryboard(id: string)

// 视频相关
generateVideo(data: VideoGenerateData)
getVideoProgress(fileId: number)

// 文件上传
uploadFile(file: File)

// 聊天历史
queryChatHistory(data: ChatHistoryQuery)
```

---

## 📡 后端 API 地址

**基础地址**: `/episode-api/storyai`

### 认证相关

```
POST   /user/login              # 用户登录
POST   /user/register           # 用户注册
GET    /user/info               # 获取用户信息
POST   /user/heartbeat          # 验证会话
```

### 剧本相关

```
POST   /series/create           # 创建剧本
GET    /series/detail           # 获取剧本详情
```

### 场景相关

```
GET    /scene/content           # 获取场景内容
PUT    /scene                   # 更新场景
POST   /scene/content           # 创建场景内容
PUT    /scene/content           # 更新场景内容
DELETE /scene/content/{id}      # 删除场景内容
```

### 音色相关

```
POST   /voice/list              # 获取音色列表
POST   /voice/update            # 更新音色
POST   /ai/voice/batch-bind     # 批量绑定音色
POST   /ai/voice/design         # AI 音色设计
```

### BGM 相关

```
POST   /bgm/list                # 获取 BGM 列表
POST   /ai/bgm/generate         # AI 生成 BGM
```

### 图片相关

```
POST   /ai/image/generate       # 文生图
POST   /ai/image2image          # 图生图
POST   /chat-history/query      # 查询聊天历史
```

### 分镜板相关

```
GET    /storyboard/list         # 获取分镜板列表
POST   /storyboard/create       # 创建分镜板
PUT    /storyboard/update       # 更新分镜板
DELETE /storyboard/{id}         # 删除分镜板
```

### 视频相关

```
POST   /ai/video/generate       # AI 生成视频
POST   /ai/video/progress       # 查询视频生成进度
```

### 文件相关

```
POST   /file/upload             # 上传文件
```

---

## 🔐 认证方式

所有 API 调用需要以下方式之一的认证：

### 1. Session Cookie (推荐)

```typescript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include'  // 包含 Cookie
})
```

### 2. 授权令牌

```typescript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Prompt-Manager-Token': token
  }
})
```

---

## 📊 请求/响应格式

### 标准响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

### 错误响应

```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

---

## 💾 常见数据结构

### 用户信息

```typescript
interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_plan: 'free' | 'chinese' | 'multilingual';
  user_point: string;
  subscription_expires_at?: string | null;
  subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
  userId: string | number;
}
```

### 场景数据

```typescript
interface Scene {
  sceneId: number;
  sceneName: string;
  sceneTitle: string;
  // ... 其他字段
}
```

### 文件信息

```typescript
interface FileInfo {
  fileId: string;
  fileName: string;
  downloadUrl: string;
  fileType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  createTime: number;
}
```

---

## 📝 使用示例

### 查看完整代码示例

参考: `CODE_SNIPPETS_REFERENCE.md`

该文件包含：
- 登录流程示例
- 图片生成示例
- 视频生成示例
- 音色设计示例
- 文件上传示例
- 等等...

---

## 🔍 错误处理

### API 错误响应处理

```typescript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (data.code === 401) {
    // 未登录，重定向到登录页
    window.location.href = '/#/app/login';
  } else if (data.code !== 0) {
    // 其他错误
    throw new Error(data.message);
  }

  return data.data;
} catch (error) {
  console.error('API 调用失败:', error);
  // 显示错误提示
}
```

---

## 🧪 API 测试

### 使用 cURL 测试

```bash
# 登录
curl -X POST http://localhost:3000/episode-api/storyai/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# 获取用户信息
curl -X GET http://localhost:3000/episode-api/storyai/user/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 使用 Postman 测试

1. 导入 API 接口
2. 设置环境变量
3. 按顺序执行请求
4. 查看响应结果

---

## 🔗 相关文档

- 架构设计: `docs/architecture/`
- 部署指南: `docs/deployment/`
- 开发指南: `docs/development/`

---

## 💡 最佳实践

### 1. 始终处理错误

```typescript
try {
  const result = await api.call();
  // 处理结果
} catch (error) {
  // 显示错误提示给用户
}
```

### 2. 使用加载状态

```typescript
const [loading, setLoading] = useState(false);

// 调用 API 时
setLoading(true);
try {
  // ...
} finally {
  setLoading(false);
}
```

### 3. 使用 TypeScript 类型

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

### 4. 集中管理 API 调用

在 `src/services/` 中定义所有 API 调用，而不是在组件中直接调用 `fetch`。

---

**最后更新**: 2024-11-03
