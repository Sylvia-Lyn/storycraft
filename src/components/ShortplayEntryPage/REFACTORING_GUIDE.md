# ShortplayEntryPage 重构指南

## 概述

本次重构将 ShortplayEntryPage.tsx 的业务逻辑拆分为多个自定义 hooks，使代码更加模块化、可维护和可测试。

## 目录结构

```
ShortplayEntryPage/
├── hooks/
│   ├── index.ts                    # Hooks 统一导出
│   ├── useSceneManagement.ts       # 场次管理 Hook
│   ├── useAudioManagement.ts       # 音频管理 Hook
│   ├── useImageManagement.ts       # 图片管理 Hook
│   ├── useVideoManagement.ts       # 视频管理 Hook
│   └── useScriptGeneration.ts      # 脚本生成 Hook
├── Audio/                          # 音频相关组件
├── Image/                          # 图片相关组件
├── Video/                          # 视频相关组件
├── Script/                         # 脚本相关组件
├── Common/                         # 公共组件
├── types/                          # 类型定义
└── utils/                          # 工具函数
```

## Hooks 说明

### 1. useSceneManagement - 场次管理

**职责：**
- 管理场次选择和切换
- 加载场次列表和内容
- 加载用户数据

**状态：**
```typescript
{
  selectedScene: string;           // 当前选中场次
  sceneOptions: string[];          // 场次选项列表
  scenesData: any[];              // 完整场次数据
  sceneContent: any[];            // 当前场次内容
  showTypeSelector: boolean;      // 显示类型选择器
  popoverPosition: {...};         // 弹窗位置
  isLoadingUserData: boolean;     // 加载状态
}
```

**主要方法：**
```typescript
loadSceneContent(sceneId)           // 加载场次内容
loadUserData()                      // 加载用户数据
handleSceneChange(sceneName)        // 场次切换
getCurrentSceneId()                 // 获取当前场次ID
```

### 2. useAudioManagement - 音频管理

**职责：**
- 管理音色和音效
- 音频播放和绑定
- 音色编辑和应用

**状态：**
```typescript
{
  configuredVoices: any[];        // 已配置音色
  availableVoices: any[];         // 可用音色
  audioType: 'voice' | 'sound';   // 音频类型
  audioContent: any[];            // 音频内容列表
  bgmList: any[];                 // 音效列表
  editingVoiceId: string | null;  // 编辑中的音色
}
```

**主要方法：**
```typescript
loadAllVoices()                     // 加载所有音色
loadAudioContent(sceneId)           // 加载音频内容
loadBgmList()                       // 加载音效列表
handleApplyVoice(voiceId)           // 应用音色
handleVoiceSelect(itemId, voiceId)  // 选择音色
handlePlayAudio(itemId)             // 播放音频
handleApplyBgm(bgm, sceneId)        // 应用音效
```

### 3. useImageManagement - 图片管理

**职责：**
- 管理图片聊天记录
- 分镜板创建和管理
- 图片上传和拖拽

**状态：**
```typescript
{
  imageChatHistory: any[];        // 图片聊天记录
  storyboardItems: any[];         // 分镜板列表
  imageItems: any[];              // 图片列表
  isUploading: boolean;           // 上传状态
  uploadProgress: {...};          // 上传进度
}
```

**主要方法：**
```typescript
loadImageChatHistory(sceneId)       // 加载图片聊天记录
loadStoryboardList(sceneId)         // 加载分镜板列表
handleCreateStoryboard(...)         // 创建分镜板
handleDeleteStoryboard(...)         // 删除分镜板
handleFileUpload(file, sceneId)     // 文件上传
handleStoryboardDragEnd(event)      // 分镜板拖拽
```

### 4. useVideoManagement - 视频管理

**职责：**
- 视频生成和预览
- 视频聊天记录
- 视频播放控制

**状态：**
```typescript
{
  videoItems: any[];              // 视频列表
  videoChatHistory: any[];        // 视频聊天记录
  isVideoGenerating: boolean;     // 视频生成状态
  uploadedImages: any[];          // 已上传图片（用于视频生成）
  isPlaying: boolean;             // 播放状态
  progress: number;               // 播放进度
}
```

**主要方法：**
```typescript
loadVideoChatHistory(sceneId)       // 加载视频聊天记录
handleVideoPreview(sceneId)         // 视频预览
handleVideoGenerate(...)            // 视频生成
handleMultipleFileUpload(files)     // 多文件上传
handleRemoveUploadedImage(fileId)   // 移除上传图片
```

### 5. useScriptGeneration - 脚本生成

**职责：**
- 剧本生成和轮询
- 图片、音频、音效生成
- 场次内容编辑

**状态：**
```typescript
{
  isGenerating: boolean;          // 生成状态
  generatedContent: string;       // 生成内容
  generationStatus: string;       // 生成状态文本
  scriptCards: any[];             // 剧本卡片
  editingSceneItemId: number;     // 编辑中的场次项
}
```

**主要方法：**
```typescript
handleGenerate(...)                 // 剧本生成
handleImageGenerate(...)            // 图片生成
handleAudioGenerate(...)            // 音频生成
handleBgmGenerate(...)              // 音效生成
handleEditSceneItem(item)           // 编辑场次项
handleSaveSceneItem()               // 保存场次项
handleDeleteScriptCard(id)          // 删除剧本卡片
```

## 如何在主文件中使用 Hooks

### 步骤 1：导入所有 hooks

```typescript
import {
  useSceneManagement,
  useAudioManagement,
  useImageManagement,
  useVideoManagement,
  useScriptGeneration
} from './ShortplayEntryPage/hooks';
```

### 步骤 2：在组件中使用 hooks

```typescript
function ShortplayEntryPage() {
  const { t } = useI18n();

  // 场次管理
  const sceneManagement = useSceneManagement();
  const {
    selectedScene,
    sceneOptions,
    scenesData,
    sceneContent,
    loadSceneContent,
    loadUserData,
    handleSceneChange,
    getCurrentSceneId
  } = sceneManagement;

  // 音频管理
  const audioManagement = useAudioManagement();
  const {
    configuredVoices,
    availableVoices,
    audioType,
    audioContent,
    bgmList,
    loadAllVoices,
    loadAudioContent,
    handleApplyVoice,
    handlePlayAudio
  } = audioManagement;

  // 图片管理
  const imageManagement = useImageManagement();
  const {
    imageChatHistory,
    storyboardItems,
    loadImageChatHistory,
    loadStoryboardList,
    handleCreateStoryboard,
    handleFileUpload
  } = imageManagement;

  // 视频管理
  const videoManagement = useVideoManagement();
  const {
    videoChatHistory,
    isVideoGenerating,
    loadVideoChatHistory,
    handleVideoPreview,
    handleVideoGenerate
  } = videoManagement;

  // 脚本生成
  const scriptGeneration = useScriptGeneration();
  const {
    isGenerating,
    generatedContent,
    generationStatus,
    handleGenerate,
    handleImageGenerate,
    handleAudioGenerate
  } = scriptGeneration;

  // ... 其他代码
}
```

### 步骤 3：组件初始化

```typescript
// 组件加载时获取用户数据
React.useEffect(() => {
  loadUserData();
}, []);

// Tab切换时加载数据
React.useEffect(() => {
  const currentSceneId = getCurrentSceneId();

  if (activeTab === 'script') {
    if (currentSceneId) {
      loadSceneContent(currentSceneId);
    }
  } else if (activeTab === 'audio') {
    if (currentSceneId) {
      loadAudioContent(currentSceneId);
    }
    if (audioType === 'voice') {
      loadAllVoices();
    } else {
      audioManagement.loadBgmList();
    }
  } else if (activeTab === 'image') {
    loadImageChatHistory(currentSceneId);
    loadStoryboardList(currentSceneId);
  } else if (activeTab === 'video') {
    loadVideoChatHistory(currentSceneId);
    loadStoryboardList(currentSceneId);
  }
}, [activeTab, selectedScene]);
```

### 步骤 4：使用 hook 方法

```typescript
// 场次切换
const onSceneChange = (sceneName: string) => {
  const sceneId = handleSceneChange(sceneName);
  if (sceneId) {
    loadSceneContent(sceneId);
  }
};

// 生成剧本
const onGenerate = async () => {
  if (activeTab === 'script') {
    await handleGenerate(
      userInput,
      t,
      loadSceneContent,
      sceneManagement.setScenesData,
      sceneManagement.setSceneOptions,
      sceneManagement.setSelectedScene
    );
  } else if (activeTab === 'image') {
    await handleImageGenerate(userInput, getCurrentSceneId(), t);
  } else if (activeTab === 'audio') {
    if (audioType === 'voice') {
      await handleAudioGenerate(userInput, t, loadAllVoices);
    } else {
      await scriptGeneration.handleBgmGenerate(userInput, t);
    }
  } else if (activeTab === 'video') {
    await handleVideoGenerate(
      userInput,
      getCurrentSceneId(),
      scriptGeneration.setIsGenerating,
      scriptGeneration.setGenerationStatus
    );
  }
};
```

## 重构优势

### 1. 代码组织更清晰
- 每个 hook 负责特定领域的业务逻辑
- 相关状态和方法集中管理
- 便于理解和维护

### 2. 提高可重用性
- Hooks 可以在其他组件中复用
- 业务逻辑与 UI 解耦
- 更容易进行单元测试

### 3. 简化主文件
- 主文件从 3474 行大幅减少
- JSX 代码更加清晰
- 状态管理更加集中

### 4. 便于协作开发
- 不同开发者可以独立维护不同的 hook
- 减少代码冲突
- 提高开发效率

### 5. 易于测试
- 每个 hook 可以独立测试
- Mock 数据更容易
- 测试覆盖率更高

## 后续优化建议

### 1. 进一步拆分 Tab 内容组件

创建独立的 Tab 内容组件：
```
- ScriptTabContent.tsx    # 剧本 Tab
- AudioTabContent.tsx     # 音频 Tab
- ImageTabContent.tsx     # 图片 Tab
- VideoTabContent.tsx     # 视频 Tab
```

### 2. 抽取公共逻辑

创建更多工具函数和公共 hooks：
```typescript
- useDragAndDrop.ts       # 拖拽逻辑
- useTimeEdit.ts          # 时间编辑逻辑
- useFileUpload.ts        # 文件上传逻辑
```

### 3. 优化类型定义

完善 TypeScript 类型定义：
```typescript
- 为每个 hook 的返回值定义接口
- 为 API 响应定义类型
- 消除 any 类型的使用
```

### 4. 添加错误处理

统一错误处理机制：
```typescript
- 创建 useErrorHandler hook
- 统一的错误提示
- 错误日志记录
```

### 5. 性能优化

```typescript
- 使用 useMemo 缓存计算结果
- 使用 useCallback 优化回调函数
- 减少不必要的重新渲染
```

## 迁移检查清单

- [x] 创建 useSceneManagement hook
- [x] 创建 useAudioManagement hook
- [x] 创建 useImageManagement hook
- [x] 创建 useVideoManagement hook
- [x] 创建 useScriptGeneration hook
- [x] 创建 hooks/index.ts 导出文件
- [ ] 更新主文件使用 hooks
- [ ] 测试所有功能
- [ ] 验证 API 调用正常
- [ ] 检查错误处理
- [ ] 性能测试
- [ ] 代码审查

## 注意事项

1. **保持向后兼容**：确保重构后的功能与原有功能完全一致
2. **逐步迁移**：建议先在副本上测试，确认无误后再替换主文件
3. **完整测试**：每个 Tab 的每个功能都需要测试
4. **API 依赖**：确认所有 API 调用的参数和响应格式正确
5. **状态同步**：注意 hooks 之间的状态依赖关系

## 总结

本次重构通过自定义 hooks 将庞大的主文件拆分为多个职责清晰的模块，大幅提升了代码的可维护性和可扩展性。建议在实际应用中继续优化，逐步完善类型定义和错误处理。
