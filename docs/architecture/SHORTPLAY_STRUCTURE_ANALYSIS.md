# 一键创作页面（ShortplayEntryPage）完整架构分析

## 目录

1. [项目概览](#项目概览)
2. [文件结构](#文件结构)
3. [核心组件架构](#核心组件架构)
4. [UI布局结构](#ui布局结构)
5. [子组件详解](#子组件详解)
6. [数据流向](#数据流向)
7. [Hooks系统](#hooks系统)
8. [API服务](#api服务)
9. [状态管理](#状态管理)
10. [组件关系树](#组件关系树)

---

## 项目概览

**ShortplayEntryPage** 是一个功能完整的短剧视频一键创作工具，支持以下核心功能：

- **脚本生成**：基于用户输入生成剧本内容
- **音频管理**：音色选择、音效生成和绑定
- **图片生成**：AI生成图片和分镜板管理
- **视频生成**：基于脚本和其他资源生成视频
- **场次管理**：多场景支持，每个场景可管理对话、画面等内容

**代码量统计：**
- 主文件：4,491 行（ShortplayEntryPage.tsx）
- 子组件：2,588 行（所有子组件总计）
- 总计：约 7,000+ 行核心业务代码

---

## 文件结构

```
src/
├── components/
│   ├── ShortplayEntryPage.tsx                    # 主页面组件（4491行）
│   └── ShortplayEntryPage/                       # 子组件目录
│       ├── Audio/                                # 音频相关组件
│       │   ├── AudioResourcePanel.tsx            # 音色/音效资源面板
│       │   ├── AudioBottomPanel.tsx              # 音频底部输入面板
│       │   └── SortableAudioItem.tsx             # 可拖拽的音频项目
│       ├── Image/                                # 图片相关组件
│       │   ├── ImageItemComponent.tsx            # 图片项目显示
│       │   └── SortableImageItem.tsx             # 可拖拽的图片项目
│       ├── Script/                               # 脚本相关组件
│       │   ├── SortableScriptCard.tsx            # 可拖拽的脚本卡片
│       │   └── SortableScriptItem.tsx            # 可拖拽的脚本项目
│       ├── Storyboard/                           # 分镜板相关组件
│       │   ├── StoryboardList.tsx                # 分镜板列表
│       │   └── SortableStoryboardItem.tsx        # 可拖拽的分镜板项目
│       ├── Video/                                # 视频相关组件
│       │   ├── VideoItemComponent.tsx            # 视频项目显示
│       │   └── SortableVideoItem.tsx             # 可拖拽的视频项目
│       ├── Common/                               # 通用组件
│       │   ├── BottomInputArea.tsx               # 底部输入区域
│       │   ├── TimeRangeInput.tsx                # 时间范围输入
│       │   └── SectionHeader.tsx                 # 区域标题头
│       ├── hooks/                                # 自定义Hooks
│       │   ├── useScriptGeneration.ts            # 脚本生成逻辑
│       │   ├── useSceneManagement.ts             # 场次管理逻辑
│       │   ├── useAudioManagement.ts             # 音频管理逻辑
│       │   ├── useImageManagement.ts             # 图片管理逻辑
│       │   ├── useVideoManagement.ts             # 视频管理逻辑
│       │   └── index.ts                          # Hooks统一导出
│       ├── types/                                # TypeScript类型定义
│       │   └── index.ts                          # 所有类型定义
│       └── utils/                                # 工具函数
│           └── formatTime.ts                     # 时间格式化函数
├── services/
│   └── shortplayService.ts                       # 一键创作API服务
├── types/
│   └── shortplay.ts                              # 全局类型定义
├── utils/
│   └── shortplayUtils.ts                         # 工具函数库
└── hooks/
    ├── useStoryboardManagement.ts                # 分镜板管理Hook
    ├── useVoiceManagement.ts                     # 音色管理Hook
    └── useImageManagement.ts                     # 图片管理Hook (global)
```

---

## 核心组件架构

### 主页面结构

```
ShortplayEntryPage (4491行)
│
├─ 状态管理 (60+ 个useState)
│  ├─ UI状态：activeTab, isPlaying, isGenerating等
│  ├─ 数据状态：seriesId, selectedScene, sceneContent等
│  ├─ 编辑状态：editingSceneItemId, editingContent等
│  ├─ 加载状态：isLoadingVoices, isLoadingStoryboard等
│  └─ 缓存状态：videoCacheMap, uploadedImages等
│
├─ 拖拽系统 (DnD Kit)
│  ├─ useSensors: 配置指针和键盘传感器
│  ├─ handleDragEnd: 处理拖拽完成事件
│  └─ arrayMove: 数组重新排序
│
├─ 渲染结构 (主return)
│  ├─ 左侧面板 (flex-1)
│  │  ├─ 顶部导航栏 (Tab切换)
│  │  ├─ 资源面板 (音色/音效)
│  │  └─ 内容区域 (脚本/音频/图片/视频)
│  │
│  ├─ 中间区域 (flex-2)
│  │  ├─ 头部 (场次选择)
│  │  ├─ 内容列表 (可拖拽)
│  │  └─ 编辑模式 (题目和选项)
│  │
│  └─ 右侧面板 (flex-2)
│     ├─ 视频预览区
│     ├─ 场景编辑器
│     └─ 视频播放控制
│
└─ API函数 (20+ 个async函数)
   ├─ 脚本操作：handleGenerate, 更新场次等
   ├─ 音频操作：加载音色, 绑定音色, 生成BGM等
   ├─ 图片操作：生成图片, 上传图片, 应用图片等
   ├─ 视频操作：生成视频, 预览视频, 轮询进度等
   └─ 文件操作：上传文件, 删除文件等
```

---

## UI布局结构

### 顶层布局（3栏布局）

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo + Tab Segmented Control (Script|Audio|Image|Video)│
└─────────────────────────────────────────────────────────────────┘
┌─────────────────┬──────────────────────┬──────────────────────┐
│                 │                      │                      │
│    LEFT PANEL   │   MIDDLE SECTION     │   RIGHT SECTION      │
│   (Flex: 1)     │    (Flex: 2)         │     (Flex: 2)        │
│                 │                      │                      │
│ ┌─────────────┐ │ ┌────────────────┐  │ ┌──────────────────┐ │
│ │ Generated   │ │ │ Section Header │  │ │  Video Preview   │ │
│ │ Content or  │ │ │ (Scene Select) │  │ │  Container       │ │
│ │ Resource    │ │ │                │  │ │  - Video Element │ │
│ │ List        │ │ ├────────────────┤  │ │  - Progress Bar  │ │
│ │             │ │ │  Content List  │  │ │  - Play Controls │ │
│ │ • Voices    │ │ │  (Draggable)   │  │ ├──────────────────┤ │
│ │ • BGM       │ │ │                │  │ │  Scene Editor    │ │
│ │ • Images    │ │ │ • Script Items │  │ │  - Question Text │ │
│ │ • Generated │ │ │ • Audio Items  │  │ │  - Options List  │ │
│ │   Content   │ │ │ • Image Items  │  │ │  - Save/Cancel   │ │
│ └─────────────┘ │ │ • Video Items  │  │ └──────────────────┘ │
│                 │ │ • Storyboards  │  │                      │
└─────────────────┴──────────────────────┴──────────────────────┘
┌─────────────────┬──────────────────────┬──────────────────────┐
│ Bottom Input Area (Model Select + Input + Generate Button)    │
└─────────────────┴──────────────────────┴──────────────────────┘
```

### 各区域功能详解

#### 1. 左侧面板 (LeftPanel - Flex: 1)

**顶部导航区** (64px高)
- Logo + 标题："一键创作"
- Tab切换控制 (Segmented)
  - 脚本 (Script)
  - 音频 (Audio)
  - 图片 (Image)
  - 视频 (Video)

**音频资源面板** (仅在Audio标签时显示)
- `<AudioResourcePanel />`
- 音频类型切换：音色 vs 音效
- 已配置音色列表（可展开/收起）
- 音色编辑：名称、删除、应用

**内容区域** (flex-grow)
- **脚本Tab内容**：
  - 生成的剧本内容展示区域
  - 白色背景，支持自动换行

- **音频Tab内容**：
  - 可用音色列表（带搜索/加载状态）
  - 每个音色项包含：
    - 音色名称（可编辑）
    - 播放按钮（试听）
    - 应用按钮
    - 音色来源标识

- **图片Tab内容**：
  - 生成的图片列表（可拖拽排序）
  - 图片预览缩略图
  - 时间范围编辑

- **视频Tab内容**：
  - 生成的视频列表（可拖拽排序）
  - 视频预览
  - 时间范围编辑

#### 2. 中间区域 (MiddleSection - Flex: 2)

**区域头部** (SectionHeader组件)
- 标题："当前场景"
- 下拉选择器：选择要编辑的场景
  - 从scenesData中提取场景名称
  - 联动加载对应场景内容

**内容列表区** (Draggable)
- 基于DnD Kit实现拖拽排序
- 显示当前场景的所有内容项
- 支持编辑时间范围、内容、角色等

**场景内容类型**：
```
type ContentItem = {
  id: number,
  type: 0 | 1,      // 0: 画面描述, 1: 对话
  content: string,
  roleName?: string,
  startTime: string,
  endTime: string,
  orderNum?: number
}
```

**可拖拽项目**：
- 对话项：显示角色名 + 对话内容
- 画面项：显示场景描述
- 音频项：显示音色 + 内容 + 时间范围
- 图片项：显示图片预览 + 时间范围
- 视频项：显示视频描述 + 时间范围

#### 3. 右侧面板 (RightSection - Flex: 2)

**视频预览区域**
- `<video ref={videoRef} />`  HTML5视频元素
- 显示生成的视频内容或最后一帧截图
- 视频控制栏：
  - 进度条（支持拖拽跳转）
  - 播放/暂停按钮
  - 音量控制
  - 全屏按钮
  - 当前时间 / 总时长

**场景编辑模式** (isEditorMode)
- 题目编辑：输入框或显示文本（可点击编辑）
- 选项列表：
  - 显示已添加的选项（A、B、C等）
  - 支持编辑和删除选项
  - 新增选项按钮
- 操作按钮：
  - 保存 (蓝色)
  - 取消 (灰色)

---

## 子组件详解

### Audio组件家族

#### 1. AudioResourcePanel
**文件**: `ShortplayEntryPage/Audio/AudioResourcePanel.tsx`

```typescript
props: {
  audioType: 'voice' | 'sound',
  onAudioTypeChange: (type) => void,
  configuredVoices: Voice[],
  isLoadingVoices: boolean,
  isConfiguredVoicesExpanded: boolean,
  onConfiguredVoicesExpandedChange: (expanded) => void,
  editingVoiceId: string | null,
  editingVoiceName: string,
  onEditingVoiceNameChange: (name) => void,
  onStartEditVoiceName: (id, name) => void,
  onSaveVoiceName: () => void,
  onCancelEditVoiceName: () => void,
  onVoiceNameKeyDown: (e) => void,
  onDeleteVoice: (id) => void
}

功能:
- 切换音色/音效模式
- 显示已配置的音色列表（可展开/收起）
- 音色名称编辑
- 删除音色
```

#### 2. AudioBottomPanel
**文件**: `ShortplayEntryPage/Audio/AudioBottomPanel.tsx`

```typescript
props: {
  audioType: 'voice' | 'sound',
  availableVoices: Voice[],
  isLoadingVoices: boolean,
  bgmList: BgmItem[],
  isLoadingBgm: boolean,
  selectedModel: string,
  onModelChange: (model) => void,
  audioGender?: string,
  onAudioGenderChange?: (gender) => void,
  userInput: string,
  onInputChange: (input) => void,
  isGenerating: boolean,
  onGenerate: () => void,
  generationStatus?: string
}

功能:
- 显示可用音色/音效列表
- 模型选择下拉框
- 音色性别选择（男生/女生）
- 输入框 + 生成按钮
- 生成进度显示
```

#### 3. SortableAudioItem
**文件**: `ShortplayEntryPage/Audio/SortableAudioItem.tsx`

```typescript
props: {
  item: AudioItem,
  audioType: 'voice' | 'sound',
  configuredVoices: Voice[],
  onVoiceSelect?: (itemId, voiceId) => void,
  onPlayAudio?: (itemId) => void,
  onShowDeleteConfirm?: (itemId) => void,
  editingItemId?: string | number | null,
  editingContent?: string,
  editingRoleName?: string,
  onEditingContentChange?: (content) => void,
  onEditingRoleNameChange?: (name) => void,
  onStartEditContent?: (itemId, content, roleName) => void,
  onSaveContentEdit?: (itemId) => void,
  onCancelContentEdit?: () => void,
  // 时间编辑props...
  isHighlighted?: boolean
}

功能:
- 拖拽句柄
- 音色/音效选择
- 内容编辑（可拖拽时可编辑）
- 时间范围编辑
- 播放音频
- 删除操作
```

### Script组件家族

#### 1. SortableScriptCard
**文件**: `ShortplayEntryPage/Script/SortableScriptCard.tsx`

```typescript
props: {
  item: ScriptCardProps,
  index?: number
}

数据结构:
{
  id: string,
  description: string,
  dialogues: [
    { character: string, content: string },
    ...
  ],
  descriptionColor?: string,
  characterColor?: string,
  contentColor?: string
}

功能:
- 脚本卡片显示
- 场景描述
- 角色对话列表
- 拖拽排序
```

#### 2. SortableScriptItem
**文件**: `ShortplayEntryPage/Script/SortableScriptItem.tsx`

```typescript
props: {
  item: any,
  index?: number,
  editingSceneItemId: number | null,
  editingSceneType: number,
  editingSceneContent: string,
  editingSceneRoleName: string,
  editingSceneStartMinutes: string,
  editingSceneStartSeconds: string,
  editingSceneEndMinutes: string,
  editingSceneEndSeconds: string,
  onEditingSceneTypeChange: (type) => void,
  onEditingSceneContentChange: (content) => void,
  onEditingSceneRoleNameChange: (name) => void,
  onEditingSceneStartMinutesChange: (minutes) => void,
  onEditingSceneStartSecondsChange: (seconds) => void,
  onEditingSceneEndMinutesChange: (minutes) => void,
  onEditingSceneEndSecondsChange: (seconds) => void,
  onEditSceneItem: (item) => void,
  onSaveSceneItem: () => void,
  onCancelEditSceneItem: () => void,
  onShowDeleteConfirm: (id) => void,
  TimeRangeInput: React.ComponentType<any>,
  isHighlighted?: boolean
}

功能:
- 场景项目显示（画面/对话）
- 内容编辑
- 角色名编辑（仅对话）
- 时间范围编辑
- 删除操作
```

### Image组件家族

#### 1. ImageItemComponent
**文件**: `ShortplayEntryPage/Image/ImageItemComponent.tsx`

#### 2. SortableImageItem
**文件**: `ShortplayEntryPage/Image/SortableImageItem.tsx`

```typescript
功能:
- 显示生成的图片缩略图
- 时间范围编辑和显示
- 拖拽排序
- 删除操作
- 图片预览（点击查看大图）
```

### Video组件家族

#### 1. VideoItemComponent
**文件**: `ShortplayEntryPage/Video/VideoItemComponent.tsx`

#### 2. SortableVideoItem
**文件**: `ShortplayEntryPage/Video/SortableVideoItem.tsx`

```typescript
功能:
- 显示生成的视频预览
- 时间范围编辑和显示
- 拖拽排序
- 删除操作
- 视频预览（点击查看大图）
```

### Storyboard组件家族

#### 1. StoryboardList
**文件**: `ShortplayEntryPage/Storyboard/StoryboardList.tsx`

```typescript
props: {
  storyboardItems: StoryboardItem[],
  isLoadingStoryboard: boolean,
  editingTimeId: string | null,
  editingStartMinutes: string,
  editingStartSeconds: string,
  editingEndMinutes: string,
  editingEndSeconds: string,
  sensors: any,
  onEditingStartMinutesChange: (value) => void,
  onEditingStartSecondsChange: (value) => void,
  onEditingEndMinutesChange: (value) => void,
  onEditingEndSecondsChange: (value) => void,
  onStartEditTime: (itemId, timeRange) => void,
  onSaveTimeEdit: (itemId) => void,
  onCancelTimeEdit: () => void,
  onDragEnd: (event) => void,
  onDeleteItem: (itemId) => void,
  TimeRangeInput: React.ComponentType<any>,
  onPreview?: (fileUrl, fileName) => void,
  onRefreshList?: () => Promise<void>,
  highlightedItemId?: string | number | null
}

功能:
- 分镜板列表容器
- DnD上下文包装
- 通过SortableStoryboardItem渲染每个项目
```

#### 2. SortableStoryboardItem
**文件**: `ShortplayEntryPage/Storyboard/SortableStoryboardItem.tsx`

```typescript
功能:
- 单个分镜板项目显示
- 文件名和描述
- 时间范围编辑
- 拖拽排序
- 预览功能（大图查看）
- 删除操作
- 高亮显示（被应用的项目）
```

### Common组件家族

#### 1. BottomInputArea
**文件**: `ShortplayEntryPage/Common/BottomInputArea.tsx`

```typescript
props: {
  activeTab: string,
  selectedModel: string,
  onModelChange: (model) => void,
  userInput: string,
  onInputChange: (value) => void,
  isGenerating: boolean,
  onGenerate: () => void,
  placeholder?: string,
  generationStatus?: string,
  // 音频特定
  audioType?: 'voice' | 'sound',
  voiceType?: string,
  onVoiceTypeChange?: (voice) => void,
  // 图片特定
  backgroundType?: string,
  onBackgroundTypeChange?: (bg) => void,
  style?: string,
  onStyleChange?: (style) => void,
  relevanceScore?: string,
  onRelevanceScoreChange?: (score) => void,
  // 视频特定
  videoLength?: string,
  onVideoLengthChange?: (length) => void,
  resolution?: string,
  onResolutionChange?: (res) => void,
  singleGenerate?: string,
  onSingleGenerateChange?: (single) => void,
  videoModel?: string,
  onVideoModelChange?: (model) => void,
  uploadedImagesCount?: number,
  onFileUpload?: (file) => Promise<any>,
  onMultipleFileUpload?: (files) => Promise<any>,
  isUploading?: boolean,
  uploadProgress?: { current, total },
  uploadedImages?: UploadedImage[],
  onRemoveImage?: (fileId) => void
}

功能:
- 模型选择下拉框（根据当前tab动态显示）
- 文本输入框
- 生成按钮
- 生成进度显示
- 各tab特定的参数选择器：
  - 脚本tab：仅显示模型选择
  - 音频tab：模型 + 音色性别
  - 图片tab：模型 + 背景类型 + 风格 + 关联度
  - 视频tab：模型 + 视频长度 + 分辨率 + 单句生成时长 + 图片上传
```

#### 2. TimeRangeInput
**文件**: `ShortplayEntryPage/Common/TimeRangeInput.tsx`

```typescript
功能:
- 时间范围编辑组件
- 开始时间：分钟输入 + 秒数输入
- 结束时间：分钟输入 + 秒数输入
- 时间验证（不允许开始时间 >= 结束时间）
- 保存/取消按钮
```

#### 3. SectionHeader
**文件**: `ShortplayEntryPage/Common/SectionHeader.tsx`

```typescript
props: {
  title: string,
  subtitle?: string,
  subtitleOptions?: string[],
  onSubtitleChange?: (value) => void,
  onSubtitleEdit?: (value) => Promise<boolean>,
  onOptionsChange?: (options) => void,
  onAddClick?: () => void,
  onApplyClick?: () => void,
  isLoading?: boolean
}

功能:
- 区域标题显示
- 副标题显示和编辑
- 下拉选择器（场景选择）
- 下拉选项编辑
- 应用按钮
- 加载状态指示
```

---

## 数据流向

### 1. 全局状态管理

**主要状态对象**：

```typescript
// 场景管理状态
seriesId: string                    // 剧集ID
selectedScene: string               // 选中的场景名称
currentSceneId: string | number      // 中间区域显示的场景ID
sceneOptions: string[]              // 场景名称列表
scenesData: SceneData[]             // 完整场景数据
sceneContent: ContentItem[]         // 当前场景的内容项

// Tab和UI状态
activeTab: 'script' | 'audio' | 'image' | 'video'
isGenerating: boolean
generatedContent: string
generationStatus: string
isPlaying: boolean
hasVideo: boolean
videoSrc: string

// 音频状态
audioType: 'voice' | 'sound'
configuredVoices: Voice[]
availableVoices: Voice[]
audioContent: AudioItem[]
bgmList: BgmItem[]
audioGender: string                 // '0' = 女生, '1' = 男生

// 图片和分镜板状态
imageItems: ImageItem[]
imageChatHistory: any[]
storyboardItems: StoryboardItem[]
uploadedImages: UploadedImage[]
videoCacheMap: Record<string, any>

// 视频状态
videoItems: VideoItem[]
videoSrc: string
videoChatHistory: any[]

// 编辑状态（场景内容）
editingSceneItemId: number | null
editingSceneContent: string
editingSceneType: number            // 0: 画面, 1: 对话
editingSceneRoleName: string
editingSceneStartMinutes: string
editingSceneStartSeconds: string
editingSceneEndMinutes: string
editingSceneEndSeconds: string

// 删除确认状态
deleteConfirmId: number | null
deleteStoryboardId: string | null
deleteAudioItemId: number | null

// 模型选择状态
selectedModel: string               // 脚本模型
imageModel: string                  // 图片模型
audioModel: string                  // 音效模型
videoModel: string                  // 视频模型
```

### 2. 数据流向图

```
用户输入
   ↓
主页面状态更新
   ↓
条件渲染 (activeTab, isGenerating等)
   ↓
API调用 (shortplayService或直接fetch)
   ↓
后端处理
   ↓
响应回调
   ↓
状态更新 (setState)
   ↓
子组件通过props接收更新
   ↓
子组件渲染
   ↓
UI更新
```

### 3. Props流向（自上而下）

```
ShortplayEntryPage (主组件)
  │
  ├─ Left Panel
  │  ├─ SectionHeader
  │  │  └─ props: title, subtitle, subtitleOptions等
  │  │
  │  └─ Content Area (根据activeTab)
  │     ├─ Script Tab: 显示generatedContent
  │     │
  │     ├─ Audio Tab: 
  │     │  ├─ AudioResourcePanel
  │     │  │  └─ props: audioType, configuredVoices, ...
  │     │  │
  │     │  └─ Available Voices/BGM列表
  │     │     └─ 手动渲染
  │     │
  │     ├─ Image Tab:
  │     │  └─ ImageItemComponent列表
  │     │     └─ props: item, editingTimeId, ...
  │     │
  │     └─ Video Tab:
  │        └─ VideoItemComponent列表
  │           └─ props: item, editingTimeId, ...
  │
  ├─ Middle Section
  │  ├─ SectionHeader (场景选择)
  │  │  └─ props: title='当前场景', subtitle=selectedScene, ...
  │  │
  │  └─ DnD Context
  │     └─ SortableContext
  │        └─ Sortable Items列表
  │           ├─ SortableScriptItem (脚本tab)
  │           ├─ SortableAudioItem (音频tab)
  │           ├─ SortableImageItem (图片tab)
  │           ├─ SortableVideoItem (视频tab)
  │           └─ StoryboardList (分镜板)
  │              └─ SortableStoryboardItem列表
  │
  ├─ Right Section
  │  ├─ Video Preview
  │  │  └─ <video ref={videoRef} src={videoSrc} />
  │  │
  │  └─ Editor Mode (条件渲染 isEditorMode)
  │     ├─ 题目编辑
  │     └─ 选项列表编辑
  │
  └─ Bottom Section
     ├─ BottomInputArea
     │  └─ props: activeTab, selectedModel, userInput, onGenerate, ...
     │
     └─ 模型特定参数输入

```

### 4. 事件处理流程（示例：生成脚本）

```
用户点击"生成"按钮
   ↓
onGenerate回调 → handleGenerate (主组件)
   ↓
验证输入 (userInput非空)
   ↓
setIsGenerating(true)
setGenerationStatus('正在生成脚本...')
   ↓
调用API: createSeries(userInput)
   ↓
后端返回: { seriesId, scenes: [...] }
   ↓
setSeriesId(seriesId)
setScenesData(scenes)
setSceneOptions(sceneNames)
setSelectedScene(scenes[0].sceneName)
   ↓
调用loadSceneContent(scenes[0].sceneId)
   ↓
获取场景内容: { sceneContent: [...] }
   ↓
setSceneContent(sceneContent)
   ↓
toast.success('脚本生成成功')
setIsGenerating(false)
setGenerationStatus('')
   ↓
UI自动更新：
- 场景选择器显示新场景
- 中间列表显示场景内容
- 右侧视频区更新
```

---

## Hooks系统

### 1. 内部Hooks (ShortplayEntryPage/hooks/)

#### useScriptGeneration.ts
```typescript
export const useScriptGeneration = () => {
  // 生成状态
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generationStatus, setGenerationStatus] = useState<string>('');

  // 脚本卡片数据
  const [scriptCards, setScriptCards] = useState<ScriptCardProps[]>([]);

  // 场次内容编辑状态
  const [editingSceneItemId, setEditingSceneItemId] = useState<number | null>(null);
  const [editingSceneContent, setEditingSceneContent] = useState<string>('');
  const [editingSceneType, setEditingSceneType] = useState<number>(0);
  // ... 更多编辑状态

  // 删除确认状态
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // 方法
  const handleGenerate = async (userInput, t, loadSceneContent, ...) => { ... };
  const updateSceneItem = async (itemId, data) => { ... };
  const deleteSceneItem = async (itemId) => { ... };
  // ... 更多方法

  return {
    // 返回所有状态和方法
  };
};
```

**功能**：
- 管理脚本生成的状态和逻辑
- 处理场景内容编辑、更新、删除

#### useSceneManagement.ts
```typescript
export const useSceneManagement = () => {
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [sceneOptions, setSceneOptions] = useState<string[]>([]);
  const [scenesData, setScenesData] = useState<any[]>([]);
  const [sceneContent, setSceneContent] = useState<any[]>([]);
  // ... 更多状态

  const loadSceneContent = async (sceneId: number) => { ... };
  const loadUserData = async () => { ... };
  const updateSceneTitle = async (sceneId, title) => { ... };
  // ... 更多方法

  return { ... };
};
```

**功能**：
- 管理场景列表和选择
- 加载场景内容
- 编辑场景信息

#### useAudioManagement.ts
```typescript
export const useAudioManagement = () => {
  // 音色状态
  const [configuredVoices, setConfiguredVoices] = useState<any[]>([]);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  // ... 更多音色相关状态

  // 音效状态
  const [bgmList, setBgmList] = useState<any[]>([]);

  const loadVoiceList = async (status: number) => { ... };
  const updateVoice = async (voiceId, data) => { ... };
  const batchBindVoice = async (bindings) => { ... };
  const designVoice = async (prompt) => { ... };
  const getBgmList = async () => { ... };
  const generateBgm = async (userInput, style) => { ... };
  // ... 更多方法

  return { ... };
};
```

**功能**：
- 管理音色列表和配置
- 管理音效列表
- 生成新的BGM
- 音色设计和绑定

#### useImageManagement.ts
```typescript
export const useImageManagement = () => {
  // 图片聊天记录
  const [imageChatHistory, setImageChatHistory] = useState<any[]>([]);

  // 图片分镜板
  const [storyboardItems, setStoryboardItems] = useState<any[]>([]);

  // 时间编辑状态
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  // ... 更多编辑状态

  const loadImageChatHistory = async (sceneId) => { ... };
  const loadStoryboardList = async (sceneId) => { ... };
  const handleCreateStoryboard = async (fileId, fileName) => { ... };
  const updateStoryboardTime = async (id, startTime, endTime) => { ... };
  const deleteStoryboard = async (id) => { ... };
  // ... 更多方法

  return { ... };
};
```

**功能**：
- 管理图片生成历史
- 管理分镜板列表
- 编辑分镜板时间
- 应用图片到分镜板

#### useVideoManagement.ts
```typescript
export const useVideoManagement = () => {
  // 视频聊天记录
  const [videoChatHistory, setVideoChatHistory] = useState<any[]>([]);

  const loadVideoChatHistory = async (sceneId) => { ... };
  const generateVideo = async (sceneId, prompt, ...) => { ... };
  const pollVideoProgress = async (fileId) => { ... };
  // ... 更多方法

  return { ... };
};
```

**功能**：
- 管理视频生成历史
- 生成视频
- 轮询视频生成进度

### 2. 全局Hooks (src/hooks/)

#### useStoryboardManagement.ts
**位置**: `/Users/peakom/work/storycraft/src/hooks/useStoryboardManagement.ts`

```typescript
export const useStoryboardManagement = () => {
  const [storyboardItems, setStoryboardItems] = useState<StoryboardItem[]>([]);
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState(false);

  const loadStoryboardList = useCallback(async (sceneId: number) => { ... }, []);
  const handleCreateStoryboard = useCallback(async (sceneId, fileId, fileName) => { ... }, []);
  const handleDeleteStoryboard = useCallback(async (id) => { ... }, []);
  const handleDragEnd = useCallback(async (event) => { ... }, []);
  // ... 更多方法

  return { ... };
};
```

#### useVoiceManagement.ts
**位置**: `/Users/peakom/work/storycraft/src/hooks/useVoiceManagement.ts`

```typescript
export const useVoiceManagement = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  
  const loadVoices = async () => { ... };
  const bindVoices = async (bindings) => { ... };
  // ... 更多方法

  return { ... };
};
```

#### useImageManagement.ts (全局)
**位置**: `/Users/peakom/work/storycraft/src/hooks/useImageManagement.ts`

```typescript
export const useImageManagement = () => {
  // 图片上传和管理逻辑
};
```

---

## API服务

### 1. shortplayService.ts (src/services/)

```typescript
// ============ 剧本相关 API ============
export const createSeries = async (userInput: string)
export const getSeriesDetail = async (seriesId?: string)

// ============ 场次相关 API ============
export const getSceneContent = async (sceneId: number)
export const updateScene = async (sceneId: number, sceneTitle: string)
export const createSceneContent = async (data: {...})
export const updateSceneContent = async (data: {...})
export const deleteSceneContent = async (id: number)

// ============ 音色相关 API ============
export const getVoiceList = async (status: number)
export const updateVoice = async (data: {...})
export const batchBindVoice = async (bindings: [...])
export const designVoice = async (prompt: string)

// ============ BGM相关 API ============
export const getBgmList = async ()
export const generateBgm = async (userInput: string, style: string)

// ============ 图片相关 API ============
export const generateImage = async (sceneId: number, userInput: string)
export const queryChatHistory = async (data: {...})

// ============ 分镜板相关 API ============
export const getStoryboardList = async (sceneId: number)
export const createStoryboard = async (data: {...})
export const updateStoryboard = async (data: {...})
export const deleteStoryboard = async (id: string)

// ============ 视频相关 API ============
export const generateVideo = async (data: {...})
export const getVideoProgress = async (fileId: number)

// ============ 文件上传 API ============
export const uploadFile = async (file: File)
```

### 2. API调用方式

**基础路径**: `/episode-api/storyai`

**认证**: 使用Header中的 `X-Prompt-Manager-Token`

**请求流程**:
1. 验证token和userId
2. 构建请求体
3. 发送HTTP请求
4. 检查401未授权错误
5. 解析JSON响应
6. 返回结果

### 3. 响应格式

```typescript
{
  code: 0 | 401 | other,      // 0=成功, 401=未授权
  message?: string,            // 错误信息
  data?: any                    // 响应数据
}
```

**错误处理**:
- 401错误：重定向到登陆页面
- 其他错误：显示toast提示
- 网络错误：捕获并显示

---

## 状态管理

### 1. 状态分层结构

**第1层：全局全局状态** (组件内部管理)
```
- UI控制状态 (activeTab, isPlaying等)
- 主数据状态 (seriesId, selectedScene等)
- 加载状态 (isGenerating, isLoadingVoices等)
```

**第2层：子组件状态** (通过props传递)
```
- 编辑状态 (editingSceneItemId, editingContent等)
- 时间编辑状态 (editingTimeId, editingStartMinutes等)
- 删除确认状态 (deleteConfirmId等)
```

**第3层：本地组件状态** (子组件内部)
```
- 下拉菜单展开状态
- 输入框焦点状态
- 模态框显示状态
```

### 2. 状态更新流程

**同步状态更新**：
```typescript
setState(newValue)
// 立即导致re-render
```

**异步状态更新**：
```typescript
async function handler() {
  setState('loading');
  try {
    const result = await apiCall();
    setState(result);
    toast.success('成功');
  } catch (error) {
    setState('error');
    toast.error('失败');
  }
}
```

**批量状态更新**：
```typescript
// 多个setState调用会被自动批处理（React 18+）
setA(value1);
setB(value2);
setC(value3);
// 单次re-render
```

### 3. 状态不变性原则

**数组更新**：
```typescript
// 错误：直接修改
sceneContent[0].content = 'new value';

// 正确：创建新数组
setSceneContent([
  ...sceneContent.slice(0, 0),
  { ...sceneContent[0], content: 'new value' },
  ...sceneContent.slice(1)
]);
```

**对象更新**：
```typescript
// 错误
userData.name = 'new name';

// 正确
setUserData({ ...userData, name: 'new name' });
```

---

## 组件关系树

```
ShortplayEntryPage (Main Component - 4491行)
│
├─────────────────────────────────────────────────────────────────
│ States (60+ useState hooks)
├─────────────────────────────────────────────────────────────────
│
├─ Effects & Refs
│  ├─ useEffect: 监听videoSrc变化
│  ├─ useEffect: 监听bgmVolume变化
│  ├─ useRef: videoRef, audioRefMap, newItemIdCounter
│  └─ useRef: isCurrentSceneIdInitialized, prevAudioTypeRef
│
├─ Handlers (20+ event handlers)
│  ├─ handleGenerate: 生成脚本
│  ├─ handleImageGenerate: 生成图片
│  ├─ handleVideoGenerate: 生成视频
│  ├─ handleBgmGenerate: 生成BGM
│  ├─ loadImageChatHistory: 加载图片历史
│  ├─ loadStoryboardList: 加载分镜板列表
│  ├─ handleCreateStoryboard: 创建分镜板
│  ├─ handleVideoPreview: 视频预览
│  ├─ handleFileUpload: 单文件上传
│  ├─ handleMultipleFileUpload: 批量上传
│  └─ ... 更多handlers
│
├─ Render
│  │
│  ├─ Left Panel (flex-1)
│  │  │
│  │  ├─ Header (64px)
│  │  │  ├─ Logo SVG
│  │  │  ├─ Title "一键创作"
│  │  │  └─ Segmented Tab Control
│  │  │     ├─ 脚本
│  │  │     ├─ 音频
│  │  │     ├─ 图片
│  │  │     └─ 视频
│  │  │
│  │  ├─ AudioResourcePanel (条件: activeTab === 'audio')
│  │  │  ├─ AudioType Toggle (音色/音效)
│  │  │  ├─ ConfiguredVoices List
│  │  │  │  ├─ Voice Item
│  │  │  │  │  ├─ Voice Name (可编辑)
│  │  │  │  │  ├─ Voice Source Badge
│  │  │  │  │  ├─ Play Button
│  │  │  │  │  ├─ Edit Button
│  │  │  │  │  └─ Delete Button
│  │  │  │  └─ ... 更多Voice Items
│  │  │  └─ Toggle Button
│  │  │
│  │  └─ Content Area (flex-grow)
│  │     │
│  │     ├─ Script Tab (条件: activeTab === 'script')
│  │     │  └─ GeneratedContent (text display)
│  │     │
│  │     ├─ Audio Tab (条件: activeTab === 'audio')
│  │     │  ├─ Available Voices/BGM List
│  │     │  │  └─ Voice/BGM Item
│  │     │  │     ├─ Icon
│  │     │  │     ├─ Name
│  │     │  │     ├─ Avatar
│  │     │  │     ├─ Play Button
│  │     │  │     └─ Apply Button
│  │     │  └─ Loading Spinner (条件)
│  │     │
│  │     ├─ Image Tab (条件: activeTab === 'image')
│  │     │  └─ [DnD Context]
│  │     │     └─ SortableContext
│  │     │        └─ ImageItemComponent[]
│  │     │           ├─ Image Preview
│  │     │           ├─ Time Range Display
│  │     │           ├─ Drag Handle
│  │     │           └─ Delete Button
│  │     │
│  │     └─ Video Tab (条件: activeTab === 'video')
│  │        └─ [DnD Context]
│  │           └─ SortableContext
│  │              └─ VideoItemComponent[]
│  │                 ├─ Video Preview
│  │                 ├─ Time Range Display
│  │                 ├─ Drag Handle
│  │                 └─ Delete Button
│  │
│  ├─ Middle Section (flex-2)
│  │  │
│  │  ├─ SectionHeader
│  │  │  ├─ Title "当前场景"
│  │  │  ├─ Scene Select Dropdown
│  │  │  │  ├─ Option Item (可编辑)
│  │  │  │  └─ ... 更多选项
│  │  │  └─ Apply Button
│  │  │
│  │  └─ Content List (flex-grow)
│  │     │
│  │     └─ [DnD Context]
│  │        └─ SortableContext
│  │           │
│  │           ├─ SortableScriptItem[] (条件: activeTab === 'script')
│  │           │  ├─ Type Badge (画面/对话)
│  │           │  ├─ Content Display/Edit
│  │           │  ├─ Role Name Display/Edit
│  │           │  ├─ Time Range Display/Edit
│  │           │  │  └─ TimeRangeInput (条件: isEditing)
│  │           │  ├─ Drag Handle
│  │           │  └─ Delete Button
│  │           │
│  │           ├─ SortableAudioItem[] (条件: activeTab === 'audio')
│  │           │  ├─ Voice Select Dropdown
│  │           │  ├─ Content Display/Edit
│  │           │  ├─ Role Name Display/Edit
│  │           │  ├─ Time Range Display/Edit
│  │           │  │  └─ TimeRangeInput (条件: isEditing)
│  │           │  ├─ Play Button
│  │           │  ├─ Drag Handle
│  │           │  └─ Delete Button
│  │           │
│  │           ├─ SortableImageItem[] (条件: activeTab === 'image')
│  │           │  ├─ Image Thumbnail
│  │           │  ├─ Time Range Display/Edit
│  │           │  │  └─ TimeRangeInput (条件: isEditing)
│  │           │  ├─ Preview Button
│  │           │  ├─ Drag Handle
│  │           │  └─ Delete Button
│  │           │
│  │           ├─ SortableVideoItem[] (条件: activeTab === 'video')
│  │           │  ├─ Video Thumbnail
│  │           │  ├─ Time Range Display/Edit
│  │           │  │  └─ TimeRangeInput (条件: isEditing)
│  │           │  ├─ Preview Button
│  │           │  ├─ Drag Handle
│  │           │  └─ Delete Button
│  │           │
│  │           └─ StoryboardList (全Tab共享)
│  │              └─ [DnD Context]
│  │                 └─ SortableContext
│  │                    └─ SortableStoryboardItem[]
│  │                       ├─ File Name
│  │                       ├─ Description
│  │                       ├─ Time Range Display/Edit
│  │                       │  └─ TimeRangeInput (条件: isEditing)
│  │                       ├─ Highlight Indicator (条件: isHighlighted)
│  │                       ├─ Preview Button
│  │                       ├─ Drag Handle
│  │                       └─ Delete Button
│  │
│  ├─ Right Section (flex-2)
│  │  │
│  │  ├─ Video Preview Container
│  │  │  ├─ <video ref={videoRef} src={videoSrc} />
│  │  │  ├─ Last Frame Image (条件: !hasVideo)
│  │  │  ├─ Progress Bar
│  │  │  │  └─ TimeDisplay (当前时间 / 总时长)
│  │  │  ├─ Video Controls
│  │  │  │  ├─ Play/Pause Button
│  │  │  │  ├─ Volume Control
│  │  │  │  ├─ Fullscreen Button
│  │  │  │  └─ Loading Spinner (条件)
│  │  │  └─ Video Preview Button
│  │  │
│  │  └─ Scene Editor (条件: isEditorMode)
│  │     ├─ Title Section
│  │     │  ├─ Input Box (条件: isEditingTitle)
│  │     │  └─ Display Text (条件: !isEditingTitle)
│  │     ├─ Options Section
│  │     │  ├─ Option Item[] (可编辑, 可删除)
│  │     │  │  ├─ Input Box (条件: isEditing)
│  │     │  │  ├─ Display Text (条件: !isEditing)
│  │     │  │  └─ Delete Button
│  │     │  └─ Add Option Button
│  │     └─ Action Buttons
│  │        ├─ Save Button (蓝色)
│  │        └─ Cancel Button (灰色)
│  │
│  └─ Bottom Input Area
│     │
│     └─ BottomInputArea Component
│        ├─ Model Select Dropdown (动态选项)
│        │  ├─ 脚本Tab: deepseek等脚本模型
│        │  ├─ 音频Tab: minmax等音频模型
│        │  ├─ 图片Tab: doubao-seedream-4.0等
│        │  └─ 视频Tab: doubao-seedance-1.0等
│        │
│        ├─ Tab-Specific Controls
│        │  │
│        │  ├─ 脚本Tab: 无额外控制
│        │  │
│        │  ├─ 音频Tab:
│        │  │  └─ Audio Gender Select (男生/女生)
│        │  │
│        │  ├─ 图片Tab:
│        │  │  ├─ Background Type Select
│        │  │  ├─ Style Select
│        │  │  └─ Relevance Score Select
│        │  │
│        │  └─ 视频Tab:
│        │     ├─ Video Length Select
│        │     ├─ Resolution Select
│        │     ├─ Single Generate Duration Select
│        │     ├─ Image Upload Area
│        │     │  ├─ Upload Input
│        │     │  ├─ Uploaded Images List
│        │     │  │  ├─ Image Thumbnail
│        │     │  │  └─ Remove Button
│        │     │  └─ Upload Progress
│        │     └─ Model Select (动态选项)
│        │
│        ├─ Textarea Input
│        │  └─ Placeholder (Tab-specific)
│        │
│        ├─ Generate Status Display
│        │  └─ Status Text
│        │
│        └─ Generate Button
│           └─ Loading Spinner (条件: isGenerating)
│
└─ Modals & Dialogs
   │
   ├─ Delete Confirm Dialog (条件: deleteConfirmId !== null)
   │  ├─ Icon
   │  ├─ Title
   │  ├─ Message
   │  ├─ Cancel Button
   │  └─ Confirm Delete Button
   │
   ├─ Preview Modal (条件: previewModalVisible)
   │  ├─ Image Preview (条件: previewType === 'image')
   │  └─ Video Preview (条件: previewType === 'video')
   │
   └─ Delete Storyboard Dialog (条件: deleteStoryboardId !== null)
      ├─ Message
      └─ Confirm Button
```

---

## 关键技术点

### 1. 拖拽排序 (Drag & Drop)
**库**: `@dnd-kit/core`, `@dnd-kit/sortable`

```typescript
// 传感器配置
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

// 拖拽结束处理
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldItems = activeTab === 'audio' ? audioContent : sceneContent;
    const newItems = arrayMove(oldItems, oldIndex, newIndex);
    // 更新本地状态和API
  }
};

// 渲染时包装
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={items} strategy={verticalListSortingStrategy}>
    {/* Sortable Items */}
  </SortableContext>
</DndContext>
```

### 2. 动态Tab切换
```typescript
const [activeTab, setActiveTab] = useState<string>('script');

{activeTab === 'script' && <ScriptContent />}
{activeTab === 'audio' && <AudioContent />}
{activeTab === 'image' && <ImageContent />}
{activeTab === 'video' && <VideoContent />}
```

### 3. 异步操作和轮询
```typescript
// 视频生成轮询
const pollVideoProgress = async (fileId: string) => {
  const maxPolls = 60;
  let pollCount = 0;

  const poll = async () => {
    pollCount++;
    const result = await fetch(`.../video/progress`);
    
    if (result.status === 'COMPLETED') {
      // 完成
    } else if (result.status === 'FAILED') {
      // 失败
    } else if (pollCount < maxPolls) {
      setTimeout(poll, 5000); // 5秒后重试
    }
  };

  setTimeout(poll, 2000); // 延迟开始
};
```

### 4. 文件上传
```typescript
const handleFileUpload = async (file: File) => {
  const userId = getUserId();
  const fileName = encodeURIComponent(file.name);
  const uploadUrl = `${STORYAI_API_BASE}/file/upload?userId=${userId}&fileName=${fileName}`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'X-Prompt-Manager-Token': token },
    body: formData
  });

  const result = await response.json();
  return result.data; // { fileId, fileUrl, fileName }
};
```

### 5. 时间范围验证
```typescript
const validateTimeLogic = (
  startMinutes: string,
  startSeconds: string,
  endMinutes: string,
  endSeconds: string
) => {
  const startSecs = parseInt(startMinutes) * 60 + parseInt(startSeconds);
  const endSecs = parseInt(endMinutes) * 60 + parseInt(endSeconds);

  if (startSecs >= endSecs) {
    return { valid: false, error: '开始时间必须小于结束时间' };
  }

  return { valid: true };
};
```

---

## 总结

### 核心特性
1. **多Tab设计**：脚本、音频、图片、视频四个独立工作流
2. **场景管理**：支持多场景，每场景独立编辑内容
3. **拖拽排序**：所有列表都支持DnD Kit拖拽
4. **实时编辑**：支持内容、时间范围、角色名等编辑
5. **资源库**：音色、音效、图片等资源库和历史记录
6. **AI生成**：脚本、图片、视频、BGM等AI生成功能
7. **进度跟踪**：视频生成进度实时轮询显示

### 架构优势
- **组件化**：子组件解耦，易于维护和扩展
- **类型安全**：完整的TypeScript类型定义
- **状态管理清晰**：集中式状态+局部props传递
- **异步处理完善**：轮询、错误处理、超时机制
- **用户体验好**：Toast提示、加载状态、进度显示

### 代码量统计
- **总代码行数**：7000+行
- **主文件**：4491行 (ShortplayEntryPage.tsx)
- **子组件**：2588行
- **自定义Hooks**：5个内部 + 3个全局
- **API接口**：20+个

