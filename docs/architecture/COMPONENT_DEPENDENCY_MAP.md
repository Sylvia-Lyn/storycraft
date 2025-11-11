# 一键创作页面 - 组件依赖关系图

## 1. 文件引入关系图

```
ShortplayEntryPage.tsx (主文件)
  │
  ├─ 导入 子组件
  │  ├─ Audio/SortableAudioItem.tsx
  │  ├─ Audio/AudioResourcePanel.tsx
  │  ├─ Audio/AudioBottomPanel.tsx
  │  ├─ Script/SortableScriptCard.tsx
  │  ├─ Script/SortableScriptItem.tsx
  │  ├─ Common/BottomInputArea.tsx
  │  ├─ Common/TimeRangeInput.tsx
  │  ├─ Common/SectionHeader.tsx
  │  ├─ Image/SortableImageItem.tsx
  │  ├─ Image/ImageItemComponent.tsx
  │  ├─ Video/SortableVideoItem.tsx
  │  ├─ Video/VideoItemComponent.tsx
  │  ├─ Storyboard/SortableStoryboardItem.tsx
  │  └─ Storyboard/StoryboardList.tsx
  │
  ├─ 导入 Types
  │  └─ ShortplayEntryPage/types/index.ts
  │     ├─ AudioItem, SortableAudioItemProps
  │     ├─ ScriptCardProps, SortableScriptCardProps
  │     ├─ ImageItem, SortableImageItemProps
  │     ├─ VideoItem, SortableVideoItemProps
  │     ├─ StoryboardItem, SortableStoryboardItemProps
  │     ├─ BottomInputAreaProps
  │     ├─ SectionHeaderProps
  │     └─ TimeRangeInput相关类型
  │
  ├─ 导入 Utils
  │  └─ ShortplayEntryPage/utils/formatTime.ts
  │
  ├─ 导入 DnD Kit库
  │  ├─ @dnd-kit/core
  │  ├─ @dnd-kit/sortable
  │  └─ @dnd-kit/utilities
  │
  ├─ 导入 第三方库
  │  ├─ react
  │  ├─ react-router-dom (useLocation)
  │  ├─ react-hot-toast (toast)
  │  ├─ antd (Button, Select, Segmented, Modal)
  │  ├─ @iconify/react
  │  └─ react-i18n (useI18n)
  │
  └─ 导入 Context
     └─ I18nContext (useI18n)

```

## 2. 组件树详细结构

```
ShortplayEntryPage (主组件)
│
├── 顶部导航栏
│   ├── Logo SVG
│   ├── 标题文本 "一键创作"
│   └── Segmented Tab Control
│       ├── Label: "脚本"
│       ├── Label: "音频"
│       ├── Label: "图片"
│       └── Label: "视频"
│
├── 左侧面板 (flex-1)
│   │
│   ├── AudioResourcePanel (仅audio tab显示)
│   │   ├── 音频类型切换 (voice/sound)
│   │   ├── 已配置音色列表
│   │   │   └── 每个音色项
│   │   │       ├── 名称（可编辑）
│   │   │       ├── 来源标识
│   │   │       ├── 播放按钮
│   │   │       ├── 编辑按钮
│   │   │       └── 删除按钮
│   │   └── 展开/收起按钮
│   │
│   └── Content Area (flex-grow, 根据activeTab切换)
│       │
│       ├── Script Tab内容
│       │   └── 生成的剧本文本显示
│       │
│       ├── Audio Tab内容
│       │   └── 可用音色/音效列表
│       │       └── 每个音色/音效项
│       │           ├── 图标
│       │           ├── 名称
│       │           ├── 头像/标签
│       │           ├── 播放按钮
│       │           └── 应用按钮
│       │
│       ├── Image Tab内容
│       │   └── [DnD Context]
│       │       └── SortableContext
│       │           └── ImageItemComponent[]
│       │               ├── 图片缩略图
│       │               ├── 时间范围显示
│       │               ├── 拖拽句柄
│       │               ├── 预览按钮
│       │               └── 删除按钮
│       │
│       └── Video Tab内容
│           └── [DnD Context]
│               └── SortableContext
│                   └── VideoItemComponent[]
│                       ├── 视频缩略图
│                       ├── 时间范围显示
│                       ├── 拖拽句柄
│                       ├── 预览按钮
│                       └── 删除按钮
│
├── 中间区域 (flex-2)
│   │
│   ├── SectionHeader
│   │   ├── 标题: "当前场景"
│   │   ├── 场景下拉选择器
│   │   │   └── 场景名称列表项[] (可编辑)
│   │   └── 应用按钮
│   │
│   └── Content List (flex-grow)
│       │
│       └── [DnD Context]
│           └── SortableContext
│               │
│               ├── SortableScriptItem[] (activeTab === 'script')
│               │   ├── 类型徽章 (画面/对话)
│               │   ├── 内容显示/编辑
│               │   ├── 角色名显示/编辑
│               │   ├── 时间范围显示/编辑
│               │   │   └── TimeRangeInput (编辑模式)
│               │   │       ├── 开始时间
│               │   │       │   ├── 分钟输入框
│               │   │       │   └── 秒数输入框
│               │   │       ├── 结束时间
│               │   │       │   ├── 分钟输入框
│               │   │       │   └── 秒数输入框
│               │   │       ├── 保存按钮
│               │   │       └── 取消按钮
│               │   ├── 拖拽句柄
│               │   └── 删除按钮
│               │
│               ├── SortableAudioItem[] (activeTab === 'audio')
│               │   ├── 音色选择下拉框
│               │   ├── 内容显示/编辑
│               │   ├── 角色名显示/编辑
│               │   ├── 时间范围显示/编辑
│               │   │   └── TimeRangeInput (编辑模式)
│               │   ├── 播放按钮
│               │   ├── 拖拽句柄
│               │   └── 删除按钮
│               │
│               ├── SortableImageItem[] (activeTab === 'image')
│               │   ├── 图片缩略图
│               │   ├── 时间范围显示/编辑
│               │   │   └── TimeRangeInput (编辑模式)
│               │   ├── 预览按钮
│               │   ├── 拖拽句柄
│               │   └── 删除按钮
│               │
│               ├── SortableVideoItem[] (activeTab === 'video')
│               │   ├── 视频缩略图
│               │   ├── 时间范围显示/编辑
│               │   │   └── TimeRangeInput (编辑模式)
│               │   ├── 预览按钮
│               │   ├── 拖拽句柄
│               │   └── 删除按钮
│               │
│               └── StoryboardList (全tab共享，始终显示)
│                   │
│                   └── [DnD Context]
│                       └── SortableContext
│                           └── SortableStoryboardItem[]
│                               ├── 文件名
│                               ├── 描述文本
│                               ├── 时间范围显示/编辑
│                               │   └── TimeRangeInput (编辑模式)
│                               ├── 高亮指示器 (应用状态)
│                               ├── 预览按钮
│                               ├── 拖拽句柄
│                               └── 删除按钮
│
├── 右侧面板 (flex-2)
│   │
│   ├── 视频预览容器
│   │   ├── <video> 元素 (HTML5)
│   │   │   └── src={videoSrc}
│   │   │
│   │   ├── 最后一帧截图 (条件: !hasVideo && lastFrameImage)
│   │   │   └── <img> 元素
│   │   │
│   │   ├── 视频进度条
│   │   │   ├── 进度条背景
│   │   │   ├── 可拖拽的进度指示器
│   │   │   └── 时间显示: "00:00 / 00:00"
│   │   │
│   │   ├── 视频控制栏
│   │   │   ├── 播放/暂停按钮
│   │   │   ├── 音量滑块 + 音量标签
│   │   │   ├── 全屏按钮
│   │   │   └── 加载动画 (条件: isLoadingPreviewVideo)
│   │   │
│   │   └── 预览按钮
│   │
│   └── 编辑模式面板 (条件: isEditorMode)
│       │
│       ├── 背景遮挡 (黑色半透明)
│       │
│       └── 编辑框
│           ├── 标题编辑区
│           │   ├── 输入框 (条件: isEditingTitle)
│           │   └── 显示文本 (条件: !isEditingTitle)
│           │
│           ├── 选项列表区
│           │   └── 选项项[] (可编辑, 可删除)
│           │       ├── 输入框 (条件: editingOptionIndex === index)
│           │       ├── 显示文本 (条件: 非编辑)
│           │       │   └── "A. 选项文本"
│           │       └── 删除按钮
│           │
│           ├── 操作按钮行
│           │   ├── 新增选项按钮 (蓝色加号)
│           │   ├── 保存按钮 (蓝色)
│           │   └── 取消按钮 (灰色)
│           │
│           └── 底部操作栏
│               ├── 应用名称显示
│               └── 用户名称显示
│
└── 底部输入区域
    │
    └── BottomInputArea
        │
        ├── 模型选择器 (Select组件，根据activeTab动态选项)
        │   └── 选项列表 (如：deepseek, doubao-seedream-4.0等)
        │
        ├── Tab特定的参数区
        │   │
        │   ├── 脚本Tab: (无额外参数)
        │   │
        │   ├── 音频Tab:
        │   │   └── 音色性别选择器 (男生/女生)
        │   │
        │   ├── 图片Tab:
        │   │   ├── 背景类型选择器
        │   │   ├── 风格选择器
        │   │   └── 关联度选择器
        │   │
        │   └── 视频Tab:
        │       ├── 视频长度选择器
        │       ├── 分辨率选择器
        │       ├── 单句生成时长选择器
        │       ├── 图片上传区
        │       │   ├── 拖拽上传框
        │       │   ├── 已上传图片列表
        │       │   │   ├── 图片缩略图
        │       │   │   └── 删除按钮
        │       │   └── 上传进度显示
        │       └── 视频模型选择器
        │
        ├── 输入文本框 (textarea)
        │   └── placeholder (Tab相关)
        │
        ├── 生成状态显示
        │   └── 状态文本
        │
        └── 生成按钮
            └── 加载动画 (条件: isGenerating)

```

## 3. 数据流向模式

### A. 单向数据流 (主要用途)

```
State (ShortplayEntryPage)
  ↓
Props (传递到子组件)
  ↓
Child Component
  ↓
Event Callback (props中的回调)
  ↓
State Update (主组件setState)
  ↓ (重新渲染)
State
```

### B. 拖拽重排序流程

```
handleDragEnd (DnD事件)
  ↓
识别oldIndex和newIndex
  ↓
arrayMove(oldItems, oldIndex, newIndex)
  ↓
更新本地state (setAudioContent或setSceneContent)
  ↓
API调用: /scene/content/reorder
  ↓
后端更新排序
  ↓
success: 显示toast + 可选重新加载
  ↓
error: 显示error toast + 可选回滚本地state
```

### C. 编辑时间范围流程

```
用户点击编辑时间 (onStartEditTime)
  ↓
setEditingTimeId(itemId)
parseTimeRange(timeRange) 解析时间字符串
setEditingStartMinutes/Seconds/EndMinutes/Seconds
  ↓
TimeRangeInput 组件显示并允许编辑
  ↓
用户修改并点击保存 (onSaveTimeEdit)
  ↓
validateTimeLogic() 验证时间逻辑
  ↓
API调用: 更新对应资源 (storyboard/update, scene/content等)
  ↓
setEditingTimeId(null) 退出编辑模式
  ↓
可选: 重新加载列表数据
```

## 4. 关键Props依赖关系

```
主组件 Props 输出关系
│
├─ 传给 SectionHeader
│  ├─ title: string ("当前场景")
│  ├─ subtitle: selectedScene
│  ├─ subtitleOptions: sceneOptions[]
│  ├─ onSubtitleChange: setSelectedScene
│  ├─ onSubtitleEdit: handleSceneEdit
│  └─ onOptionsChange: setSceneOptions
│
├─ 传给 BottomInputArea
│  ├─ activeTab
│  ├─ selectedModel/audioModel/imageModel/videoModel
│  ├─ userInput
│  ├─ onInputChange
│  ├─ isGenerating
│  ├─ onGenerate (根据tab调用不同的generate函数)
│  ├─ 各tab特定的props...
│  ├─ onFileUpload
│  ├─ onMultipleFileUpload
│  ├─ uploadedImages
│  └─ onRemoveImage
│
├─ 传给 AudioResourcePanel
│  ├─ audioType
│  ├─ configuredVoices
│  ├─ isConfiguredVoicesExpanded
│  ├─ editingVoiceId
│  ├─ editingVoiceName
│  ├─ 各种回调函数...
│  └─ onDeleteVoice
│
├─ 传给 SortableAudioItem (多个)
│  ├─ item
│  ├─ audioType
│  ├─ configuredVoices
│  ├─ 编辑相关props
│  ├─ 时间编辑相关props
│  └─ 回调函数props
│
├─ 传给 SortableScriptItem (多个)
│  ├─ item
│  ├─ 编辑相关props
│  ├─ 时间编辑相关props
│  └─ 回调函数props
│
├─ 传给 TimeRangeInput (多个)
│  ├─ 当前编辑的时间值
│  ├─ onChange handlers
│  ├─ onSave handler
│  └─ onCancel handler
│
└─ 传给 StoryboardList
   ├─ storyboardItems
   ├─ isLoadingStoryboard
   ├─ 时间编辑相关props
   ├─ sensors (DnD)
   ├─ 各种回调函数...
   └─ highlightedItemId
```

## 5. State依赖关系图

```
UI控制状态
├─ activeTab ─→ 控制内容显示
├─ isPlaying ─→ 视频播放状态
├─ isGenerating ─→ 显示加载状态
├─ isEditorMode ─→ 显示编辑面板
└─ isHoveringVideo ─→ 视频hover效果

数据状态
├─ seriesId ─→ 用于API调用
├─ selectedScene ─→ 联动加载sceneContent
├─ currentSceneId ─→ 多选场景支持
├─ sceneOptions ─→ 下拉菜单选项
├─ scenesData ─→ 完整场景列表
└─ sceneContent ─→ 中间列表显示数据

编辑状态 (联动)
├─ editingSceneItemId ──┐
├─ editingSceneContent ─┼─→ 条件渲染编辑UI
├─ editingSceneType ────┤
├─ editingSceneRoleName ┤
└─ 时间编辑相关状态 ───┘

音频相关状态
├─ audioType ─→ 音色/音效切换
├─ configuredVoices ─→ 已配置列表
├─ availableVoices ─→ 可用列表
├─ audioContent ─→ 中间列表显示
├─ bgmList ─→ 音效库显示
└─ audioGender ─→ API参数

图片相关状态
├─ imageChatHistory ─→ 历史记录
├─ storyboardItems ─→ 分镜板列表
└─ uploadedImages ─→ 上传的图片列表

视频相关状态
├─ videoSrc ─→ 视频源
├─ hasVideo ─→ 显示/隐藏视频
├─ lastFrameImage ─→ 最后一帧截图
├─ videoChatHistory ─→ 历史记录
└─ videoCacheMap ─→ 缓存

缓存状态
├─ videoCacheMap ─→ localStorage持久化
└─ uploadedImages ─→ 临时缓存
```

## 6. API调用关系图

```
ShortplayEntryPage 中的 API 调用

生成相关
├─ createSeries (脚本生成)
│  ├─ 触发条件: 点击脚本tab的生成按钮
│  ├─ 输入: userInput
│  ├─ 返回: { seriesId, scenes: [...] }
│  └─ 触发: loadSceneContent, setSceneOptions等
│
├─ generateImage (图片生成)
│  ├─ 触发条件: 点击图片tab的生成按钮
│  ├─ 输入: sceneId, userInput
│  └─ 返回: { imageData }
│
├─ generateVideo (视频生成)
│  ├─ 触发条件: 点击视频tab的生成按钮
│  ├─ 输入: sceneId, llmName, userMessage, uploadedImages等
│  ├─ 返回: { fileId }
│  └─ 触发: pollVideoProgress (开始轮询)
│
└─ generateBgm (BGM生成)
   ├─ 触发条件: 点击音频tab的生成按钮
   ├─ 输入: style, userInput
   └─ 返回: { bgmData }

加载相关
├─ loadSceneContent (加载场景内容)
│  ├─ 触发条件: 选择场景或脚本生成完成
│  ├─ 输入: sceneId
│  ├─ 返回: { sceneContent: [...] }
│  └─ 更新: setSceneContent
│
├─ loadImageChatHistory (加载图片历史)
│  ├─ 触发条件: 切换到image tab或选择新场景
│  ├─ 输入: sceneId
│  ├─ 返回: { records: [...] }
│  └─ 更新: setImageChatHistory
│
├─ loadStoryboardList (加载分镜板列表)
│  ├─ 触发条件: 切换场景或应用图片后
│  ├─ 输入: sceneId
│  ├─ 返回: { storyboardItems: [...] }
│  └─ 更新: setStoryboardItems
│
└─ loadVideoChatHistory (加载视频历史)
   ├─ 触发条件: 视频生成完成
   ├─ 输入: sceneId
   ├─ 返回: { records: [...] }
   └─ 更新: setVideoChatHistory

编辑更新相关
├─ updateSceneContent (更新场景内容)
│  ├─ 触发条件: 编辑场景项并保存
│  ├─ 输入: { id, content, startTime, endTime等 }
│  └─ 返回: { success }
│
├─ reorderSceneContent (重排序)
│  ├─ 触发条件: 拖拽排序完成
│  ├─ 输入: { ids: [...] }
│  └─ 返回: { success }
│
├─ updateStoryboard (更新分镜板)
│  ├─ 触发条件: 编辑分镜板时间
│  ├─ 输入: { id, startTime, endTime }
│  └─ 返回: { success }
│
└─ updateVoice (更新音色)
   ├─ 触发条件: 编辑音色名称
   ├─ 输入: { voiceId, voiceName }
   └─ 返回: { success }

删除相关
├─ deleteSceneContent (删除场景项)
│  ├─ 触发条件: 删除确认对话框
│  ├─ 输入: { id }
│  └─ 返回: { success }
│
└─ deleteStoryboard (删除分镜板)
   ├─ 触发条件: 删除分镜板项
   ├─ 输入: { id }
   └─ 返回: { success }

文件操作相关
├─ uploadFile (上传文件)
│  ├─ 触发条件: 选择图片文件
│  ├─ 输入: { file }
│  ├─ 返回: { fileId, fileUrl, fileName }
│  └─ 更新: setUploadedImages
│
├─ createStoryboard (应用图片)
│  ├─ 触发条件: 选择图片应用到分镜板
│  ├─ 输入: { sceneId, storyboardOrder, fileId }
│  ├─ 返回: { success }
│  └─ 触发: silentLoadStoryboardList
│
└─ handleVideoPreview (视频预览)
   ├─ 触发条件: 点击预览按钮
   ├─ 输入: { sceneId }
   ├─ 返回: { downloadUrl }
   └─ 更新: setVideoSrc

轮询相关
└─ pollVideoProgress (轮询视频进度)
   ├─ 触发条件: 视频生成API返回fileId
   ├─ 间隔: 5秒
   ├─ 最大轮询次数: 60次 (5分钟)
   ├─ 返回: { status: 'COMPLETED'|'FAILED'|'PROCESSING' }
   └─ 成功时触发: loadVideoChatHistory
```

## 7. 状态优化建议

### 可以考虑分离的状态组

```
1. 编辑状态组 → 可用Custom Hook (useEditingState)
   ├─ editingSceneItemId
   ├─ editingSceneContent
   ├─ editingSceneType
   ├─ editingSceneRoleName
   ├─ editingSceneStartMinutes
   ├─ editingSceneStartSeconds
   ├─ editingSceneEndMinutes
   └─ editingSceneEndSeconds

2. 时间编辑状态组 → 可用Custom Hook (useTimeRangeEditing)
   ├─ editingTimeId
   ├─ editingStartMinutes
   ├─ editingStartSeconds
   ├─ editingEndMinutes
   └─ editingEndSeconds

3. 音频状态组 → 可用Custom Hook (useAudioState)
   ├─ audioType
   ├─ configuredVoices
   ├─ availableVoices
   ├─ audioContent
   ├─ bgmList
   └─ 相关loading状态

4. 加载状态组 → 可用Custom Hook (useLoadingStates)
   ├─ isGenerating
   ├─ isLoadingVoices
   ├─ isLoadingBgm
   ├─ isLoadingAudioContent
   ├─ isLoadingImageHistory
   └─ isLoadingStoryboard

5. UI状态组 → 可用Custom Hook (useUIStates)
   ├─ activeTab
   ├─ isPlaying
   ├─ isEditorMode
   ├─ isHoveringVideo
   └─ previewModalVisible
```

### 优化后的代码结构示例

```typescript
// 分离后的主组件会简洁得多
function ShortplayEntryPage() {
  // 核心业务状态
  const [seriesId, setSeriesId] = useState('');
  const [selectedScene, setSelectedScene] = useState('');
  const [sceneContent, setSceneContent] = useState([]);
  
  // 分离的Hook
  const editingState = useEditingState();
  const audioState = useAudioState();
  const loadingStates = useLoadingStates();
  const timeRangeEditing = useTimeRangeEditing();
  const uiStates = useUIStates();
  
  // 业务逻辑...
  
  return (
    // 简洁的JSX...
  );
}
```

这样做的优点：
1. 主组件代码更简洁，易于理解
2. 状态管理更模块化
3. 易于测试各个Hook
4. 易于在其他组件中复用这些Hook
```

