// 音频相关类型
export interface AudioItem {
  id: string;
  type: 'voice' | 'sound';
  itemType?: number; // 原始类型：1=场景描述, 2=对话, 3=音效
  speaker: string;
  content: string;
  timeRange: string;
  icon: string;
}

export interface SortableAudioItemProps {
  item: AudioItem;
  audioType: 'voice' | 'sound';
  configuredVoices: any[];
  onVoiceSelect?: (itemId: string, voiceId: string) => void;
  onPlayAudio?: (itemId: string) => void;
  onShowDeleteConfirm?: (itemId: number) => void;
  // 内容编辑相关
  editingItemId?: string | number | null;
  editingContent?: string;
  editingRoleName?: string;
  onEditingContentChange?: (content: string) => void;
  onEditingRoleNameChange?: (name: string) => void;
  onStartEditContent?: (itemId: string, content: string, roleName?: string) => void;
  onSaveContentEdit?: (itemId: string) => void;
  onCancelContentEdit?: () => void;
  // 时间编辑相关
  editingTimeId?: string | number | null;
  editingStartMinutes?: string;
  editingStartSeconds?: string;
  editingEndMinutes?: string;
  editingEndSeconds?: string;
  onEditingStartMinutesChange?: (value: string) => void;
  onEditingStartSecondsChange?: (value: string) => void;
  onEditingEndMinutesChange?: (value: string) => void;
  onEditingEndSecondsChange?: (value: string) => void;
  onStartEditTime?: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit?: (itemId: string) => void;
  onCancelTimeEdit?: () => void;
  isHighlighted?: boolean;
}

// 剧本相关类型
export interface ScriptCardProps {
  id: string;
  description: string;
  dialogues: Array<{
    character: string;
    content: string;
  }>;
  descriptionColor?: string;
  characterColor?: string;
  contentColor?: string;
  onDelete?: (id: string) => void;
}

export interface SortableScriptCardProps {
  item: ScriptCardProps;
}

export interface SortableScriptItemProps {
  item: any;
  index?: number;
  editingSceneItemId: number | null;
  editingSceneType: number;
  editingSceneContent: string;
  editingSceneRoleName: string;
  editingSceneStartMinutes: string;
  editingSceneStartSeconds: string;
  editingSceneEndMinutes: string;
  editingSceneEndSeconds: string;
  onEditingSceneTypeChange: (type: number) => void;
  onEditingSceneContentChange: (content: string) => void;
  onEditingSceneRoleNameChange: (name: string) => void;
  onEditingSceneStartMinutesChange: (minutes: string) => void;
  onEditingSceneStartSecondsChange: (seconds: string) => void;
  onEditingSceneEndMinutesChange: (minutes: string) => void;
  onEditingSceneEndSecondsChange: (seconds: string) => void;
  onEditSceneItem: (item: any) => void;
  onSaveSceneItem: () => void;
  onCancelEditSceneItem: () => void;
  onShowDeleteConfirm: (id: number) => void;
  TimeRangeInput: React.ComponentType<any>;
  isHighlighted?: boolean;
}

// 底部输入区域类型
export interface BottomInputAreaProps {
  activeTab: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  userInput: string;
  onInputChange: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  placeholder?: string;
  generationStatus?: string;
  // 音频tab特有属性
  audioType?: 'voice' | 'sound';
  voiceType?: string;
  onVoiceTypeChange?: (voice: string) => void;
  // 图片tab特有属性
  backgroundType?: string;
  onBackgroundTypeChange?: (bg: string) => void;
  style?: string;
  onStyleChange?: (style: string) => void;
  relevanceScore?: string;
  onRelevanceScoreChange?: (score: string) => void;
  // 视频tab特有属性
  videoLength?: string;
  onVideoLengthChange?: (length: string) => void;
  resolution?: string;
  onResolutionChange?: (res: string) => void;
  singleGenerate?: string;
  onSingleGenerateChange?: (single: string) => void;
  videoModel?: string;
  onVideoModelChange?: (model: string) => void;
  uploadedImagesCount?: number;
  onFileUpload?: (file: File) => Promise<any>;
  onMultipleFileUpload?: (files: File[]) => Promise<any>;
  isUploading?: boolean;
  uploadProgress?: { current: number; total: number };
  uploadedImages?: Array<{fileId: string; fileUrl: string; fileName: string}>;
  onRemoveImage?: (fileId: string) => void;
}

// 图片相关类型
export interface ImageItem {
  id: string;
  description: string;
  parameters: string;
  timeRange: string;
}

export interface SortableImageItemProps {
  item: ImageItem;
  index: number;
  editingTimeId: string | null;
  editingStartMinutes: string;
  editingStartSeconds: string;
  editingEndMinutes: string;
  editingEndSeconds: string;
  onEditingStartMinutesChange: (value: string) => void;
  onEditingStartSecondsChange: (value: string) => void;
  onEditingEndMinutesChange: (value: string) => void;
  onEditingEndSecondsChange: (value: string) => void;
  onStartEditTime: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit: (itemId: string) => void;
  onCancelTimeEdit: () => void;
  parseTimeRange: (timeRange: string) => { startMinutes: string; startSeconds: string; endMinutes: string; endSeconds: string; };
}

export interface ImageItemProps {
  item: ImageItem;
  index: number;
  editingTimeId: string | null;
  editingStartMinutes: string;
  editingStartSeconds: string;
  editingEndMinutes: string;
  editingEndSeconds: string;
  onEditingStartMinutesChange: (value: string) => void;
  onEditingStartSecondsChange: (value: string) => void;
  onEditingEndMinutesChange: (value: string) => void;
  onEditingEndSecondsChange: (value: string) => void;
  onStartEditTime: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit: (itemId: string) => void;
  onCancelTimeEdit: () => void;
  parseTimeRange: (timeRange: string) => { startMinutes: string; startSeconds: string; endMinutes: string; endSeconds: string; };
  dragListeners?: any;
}

// 视频相关类型
export interface VideoItem {
  id: string;
  description: string;
  parameters: string;
  timeRange: string;
}

export interface VideoItemProps {
  item: VideoItem;
  index: number;
  editingTimeId: string | null;
  editingStartMinutes: string;
  editingStartSeconds: string;
  editingEndMinutes: string;
  editingEndSeconds: string;
  onEditingStartMinutesChange: (value: string) => void;
  onEditingStartSecondsChange: (value: string) => void;
  onEditingEndMinutesChange: (value: string) => void;
  onEditingEndSecondsChange: (value: string) => void;
  onStartEditTime: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit: (itemId: string) => void;
  onCancelTimeEdit: () => void;
  parseTimeRange: (timeRange: string) => { startMinutes: string; startSeconds: string; endMinutes: string; endSeconds: string; };
  dragListeners?: any;
}

export interface SortableVideoItemProps {
  item: VideoItem;
  index: number;
  editingTimeId: string | null;
  editingStartMinutes: string;
  editingStartSeconds: string;
  editingEndMinutes: string;
  editingEndSeconds: string;
  onEditingStartMinutesChange: (value: string) => void;
  onEditingStartSecondsChange: (value: string) => void;
  onEditingEndMinutesChange: (value: string) => void;
  onEditingEndSecondsChange: (value: string) => void;
  onStartEditTime: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit: (itemId: string) => void;
  onCancelTimeEdit: () => void;
  parseTimeRange: (timeRange: string) => { startMinutes: string; startSeconds: string; endMinutes: string; endSeconds: string; };
}

// 分镜板相关类型
export interface SortableStoryboardItemProps {
  item: any;
  index: number;
  editingTimeId: string | null;
  editingStartMinutes: string;
  editingStartSeconds: string;
  editingEndMinutes: string;
  editingEndSeconds: string;
  onEditingStartMinutesChange: (value: string) => void;
  onEditingStartSecondsChange: (value: string) => void;
  onEditingEndMinutesChange: (value: string) => void;
  onEditingEndSecondsChange: (value: string) => void;
  onStartEditTime: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit: (itemId: string) => void;
  onCancelTimeEdit: () => void;
  onDeleteItem: (itemId: string) => void;
  TimeRangeInput: React.ComponentType<any>;
  onPreview?: (fileUrl: string, fileName?: string) => void;
  onRefreshList?: () => Promise<void>;
  isHighlighted?: boolean;
}

export interface StoryboardListProps {
  storyboardItems: any[];
  isLoadingStoryboard: boolean;
  editingTimeId: string | null;
  editingStartMinutes: string;
  editingStartSeconds: string;
  editingEndMinutes: string;
  editingEndSeconds: string;
  sensors: any;
  onEditingStartMinutesChange: (value: string) => void;
  onEditingStartSecondsChange: (value: string) => void;
  onEditingEndMinutesChange: (value: string) => void;
  onEditingEndSecondsChange: (value: string) => void;
  onStartEditTime: (itemId: string, timeRange: string) => void;
  onSaveTimeEdit: (itemId: string) => void;
  onCancelTimeEdit: () => void;
  onDragEnd: (event: any) => void;
  onDeleteItem: (itemId: string) => void;
  TimeRangeInput: React.ComponentType<any>;
  onPreview?: (fileUrl: string, fileName?: string) => void;
  onRefreshList?: () => Promise<void>;
  highlightedItemId?: string | number | null;
}

// 通用组件类型
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  subtitleOptions?: string[];
  onSubtitleChange?: (value: string) => void;
  onSubtitleEdit?: (value: string) => Promise<boolean>; // 新增：专门处理编辑的回调
  onOptionsChange?: (options: string[]) => void;
  onAddClick?: () => void;
  onApplyClick?: () => void;
  isLoading?: boolean; // 应用按钮加载状态
  isContentLoading?: boolean; // 内容列表加载状态
  onAddSubtitleOption?: (newName: string) => Promise<boolean>; // 新增：添加选项回调
  onDeleteSubtitleOption?: (optionName: string) => Promise<boolean>; // 新增：删除选项回调
}
