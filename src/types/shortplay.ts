/**
 * Shortplay Type Definitions
 * 一键创作相关的类型定义
 */

// ============ 场次相关类型 ============

export interface SceneData {
  sceneId: number;
  sceneName: string;
  sceneTitle?: string;
}

export interface SceneContentItem {
  id: number;
  type: number; // 0: 画面, 1: 对话
  content: string;
  roleName?: string;
  startTime: string;
  endTime: string;
  orderNum?: number;
}

// ============ 音色相关类型 ============

export interface VoiceData {
  voiceId: string;
  voiceName: string;
  voiceSource?: 'CUSTOM' | 'SYSTEM';
  sampleAudioUrl?: string;
  status?: number;
}

export interface AudioItem {
  id: string;
  type: 'voice' | 'sound';
  speaker: string;
  content: string;
  timeRange: string;
  icon: string;
}

// ============ BGM相关类型 ============

export interface BgmItem {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  audioUrl?: string;
  url?: string;
}

// ============ 图片相关类型 ============

export interface ImageItem {
  id: string;
  description: string;
  parameters: string;
  timeRange: string;
}

export interface ChatHistoryFile {
  fileId: string;
  fileName: string;
  fileType: 'IMAGE' | 'VIDEO';
  downloadUrl: string;
}

export interface ChatHistoryItem {
  content?: string;
  message?: string;
  createTime?: string;
  files?: ChatHistoryFile[];
  imageUrl?: string; // 兼容旧格式
}

// ============ 分镜板相关类型 ============

export interface StoryboardItem {
  id: number;
  fileId: string;
  fileName?: string;
  fileUrl?: string;
  storyboardOrder: number;
  description?: string;
  startTime?: number;
  endTime?: number;
}

// ============ 视频相关类型 ============

export interface VideoItem {
  id: string;
  description: string;
  parameters: string;
  timeRange: string;
}

export interface UploadedImage {
  fileId: string;
  fileUrl: string;
  fileName: string;
}

// ============ 剧本卡片类型 ============

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

// ============ Tab类型 ============

export type TabType = 'script' | 'audio' | 'image' | 'video';
export type AudioType = 'voice' | 'sound';

// ============ 时间范围类型 ============

export interface TimeRange {
  startMinutes: string;
  startSeconds: string;
  endMinutes: string;
  endSeconds: string;
}
