import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Button, Select } from 'antd';
import { useI18n } from '../contexts/I18nContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 一键创作API基础路径
const STORYAI_API_BASE = '/episode-api/storyai';

const { Option } = Select;

// 可排序的音频项组件
interface AudioItem {
  id: string;
  type: 'voice' | 'sound';
  speaker: string;
  content: string;
  timeRange: string;
  icon: string;
}

interface SortableAudioItemProps {
  item: AudioItem;
}

function SortableAudioItem({ item }: SortableAudioItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // 防止拖动时字体变形
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    // 强制硬件加速，避免亚像素渲染问题
    willChange: isDragging ? 'transform' : 'auto',
    // 确保像素完美渲染
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    // 防止拖动时卡片伸缩
    width: isDragging ? '100%' : 'auto',
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 px-3 py-2 cursor-move transition-all ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
      {...attributes}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div {...listeners}>
            <Icon icon="ri:drag-move-line" className="w-4 h-4 text-gray-400 cursor-grab" />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            item.type === 'sound' ? 'bg-blue-500' : 'bg-gray-100'
          }`}>
            <Icon
              icon={item.icon}
              className={`w-4 h-4 ${item.type === 'sound' ? 'text-white' : 'text-gray-600'}`}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-800">{item.speaker}</span>
          {item.type === 'voice' && (
            <Icon icon="ri:arrow-down-s-line" className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <div className="flex-1 text-sm text-gray-600">{item.content}</div>
        <div className="text-xs text-gray-400">{item.timeRange}</div>
        <div className="flex items-center space-x-2">
          <Icon icon="ri:time-line" className="w-4 h-4 text-gray-400" />
          <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500" />
        </div>
      </div>
    </div>
  );
}

// 剧本卡片组件
interface ScriptCardProps {
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

interface SortableScriptCardProps {
  item: ScriptCardProps;
}


function SortableScriptCard({ item }: SortableScriptCardProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // 防止拖动时字体变形
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    // 强制硬件加速，避免亚像素渲染问题
    willChange: isDragging ? 'transform' : 'auto',
    // 确保像素完美渲染
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    // 防止拖动时卡片伸缩
    width: isDragging ? '100%' : 'auto',
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center space-x-4 transition-all ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
    >
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
        {/* 拖拽手柄 */}
        <div className="flex items-start space-x-3">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1 p-1 hover:bg-gray-100 rounded"
            title={t('shortplayEntry.dragSort.title')}
          >
            <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex-1">
            <div className={`text-sm mb-2 font-medium ${item.descriptionColor || 'text-blue-600'}`}>
              {t('shortplayEntry.dragSort.scriptDescription')}{item.description}
            </div>
            <div className="space-y-3">
              {item.dialogues.map((dialogue, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-start space-x-2">
                    <span className={`text-sm font-medium min-w-0 ${item.characterColor || 'text-gray-800'}`}>
                      {dialogue.character}：
                    </span>
                    <div className="flex-1">
                      <span className={`text-sm ${item.contentColor || 'text-gray-600'}`}>
                        {dialogue.content}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 独立的删除按钮列 */}
      <div className="flex items-center">
        <Icon
          icon="ri:delete-bin-line"
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
          onClick={() => item.onDelete?.(item.id)}
        />
      </div>
    </div>
  );
}

// 底部输入区域组件
interface BottomInputAreaProps {
  activeTab: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  userInput: string;
  onInputChange: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  placeholder?: string;
  // 音频tab特有属性
  voiceType?: string;
  onVoiceTypeChange?: (voice: string) => void;
  // 图片tab特有属性
  backgroundType?: string;
  onBackgroundTypeChange?: (bg: string) => void;
  style?: string;
  onStyleChange?: (style: string) => void;
  // 视频tab特有属性
  videoLength?: string;
  onVideoLengthChange?: (length: string) => void;
  resolution?: string;
  onResolutionChange?: (res: string) => void;
  singleGenerate?: boolean;
  onSingleGenerateChange?: (single: boolean) => void;
}

function BottomInputArea({
  activeTab,
  selectedModel,
  onModelChange,
  userInput,
  onInputChange,
  isGenerating,
  onGenerate,
  placeholder,
  // 音频tab属性
  voiceType = "male",
  onVoiceTypeChange,
  // 图片tab属性
  backgroundType = "背景",
  onBackgroundTypeChange,
  style = "古风",
  onStyleChange,
  // 视频tab属性
  videoLength = "2s",
  onVideoLengthChange,
  resolution = "1080p",
  onResolutionChange,
  singleGenerate = false,
  onSingleGenerateChange
}: BottomInputAreaProps) {
  const { t } = useI18n();

  // Use translated placeholder if not provided
  const finalPlaceholder = placeholder || t('shortplayEntry.input.placeholder');

  return (
    <div className="border-t border-gray-100 p-4">
      {activeTab === 'script' && (
        <>
          <div className="mb-3">
            <div className="relative w-40">
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
              >
                <option value="gemini-2.5pro">Gemini2.5pro</option>
                <option value="deepseek-r1">DeepSeek-R1</option>
                <option value="gpt-4">GPT-4</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-4 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <button
              onClick={onGenerate}
              disabled={isGenerating || !userInput.trim()}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors flex items-center space-x-1 ${
                isGenerating || !userInput.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating && (
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}</span>
            </button>
          </div>
        </>
      )}

      {activeTab === 'audio' && (
        <>
          <div className="mb-3">
            <div className="flex space-x-3">
              <div className="relative w-32">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="gemini-2.5pro">Gemini2.5pro</option>
                  <option value="deepseek-r1">DeepSeek-R1</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-20">
                <select
                  value={voiceType}
                  onChange={(e) => onVoiceTypeChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="male">{t('shortplayEntry.audio.male')}</option>
                  <option value="female">{t('shortplayEntry.audio.female')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-4 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <button
              onClick={onGenerate}
              disabled={isGenerating || !userInput.trim()}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors ${
                isGenerating || !userInput.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.modelGenerate')}
            </button>
          </div>
        </>
      )}

      {activeTab === 'image' && (
        <>
          <div className="mb-3">
            <div className="flex space-x-3">
              <div className="relative w-32">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="gemini-2.5pro">Gemini2.5pro</option>
                  <option value="deepseek-r1">DeepSeek-R1</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-20">
                <select
                  value={backgroundType}
                  onChange={(e) => onBackgroundTypeChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="背景">{t('shortplayEntry.image.background')}</option>
                  <option value="人物">{t('shortplayEntry.image.character')}</option>
                  <option value="物体">{t('shortplayEntry.image.object')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-20">
                <select
                  value={style}
                  onChange={(e) => onStyleChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="古风">{t('shortplayEntry.image.ancient')}</option>
                  <option value="现代">{t('shortplayEntry.image.modern')}</option>
                  <option value="科幻">{t('shortplayEntry.image.scifi')}</option>
                  <option value="卡通">{t('shortplayEntry.image.cartoon')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-4 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <button
              onClick={onGenerate}
              disabled={isGenerating || !userInput.trim()}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors ${
                isGenerating || !userInput.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}
            </button>
          </div>
        </>
      )}

      {activeTab === 'video' && (
        <>
          <div className="mb-3">
            <div className="flex space-x-2">
              <div className="relative w-32">
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="gemini-2.5pro">Gemini2.5pro</option>
                  <option value="deepseek-r1">DeepSeek-R1</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-24">
                <select
                  value={videoLength}
                  onChange={(e) => onVideoLengthChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="2s">{t('shortplayEntry.video.duration2s')}</option>
                  <option value="5s">{t('shortplayEntry.video.duration5s')}</option>
                  <option value="10s">{t('shortplayEntry.video.duration10s')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-24">
                <select
                  value={resolution}
                  onChange={(e) => onResolutionChange?.(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="1080p">{t('shortplayEntry.video.resolution1080p')}</option>
                  <option value="720p">{t('shortplayEntry.video.resolution720p')}</option>
                  <option value="4K">{t('shortplayEntry.video.resolution4k')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="relative w-24">
                <select
                  value={singleGenerate ? "single" : "batch"}
                  onChange={(e) => onSingleGenerateChange?.(e.target.value === "single")}
                  className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-white focus:outline-none appearance-none text-black/50"
                >
                  <option value="batch">{t('shortplayEntry.video.batchMode')}</option>
                  <option value="single">{t('shortplayEntry.video.singleMode')}</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-12 py-2 pl-12 pr-24 text-xs rounded-lg bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1px solid rgba(116, 116, 116, 0.41)' }}
              placeholder={finalPlaceholder}
              disabled={isGenerating}
            />
            <label className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200">
              <Icon icon="ri:image-line" className="w-4 h-4 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle image upload here
                    console.log('Image uploaded:', file);
                  }
                }}
              />
            </label>
            <button
              onClick={onGenerate}
              disabled={isGenerating || !userInput.trim()}
              className={`absolute bottom-2 right-2 px-3 py-1 text-white text-xs font-medium rounded transition-colors ${
                isGenerating || !userInput.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? t('shortplayEntry.generation.generating') : t('shortplayEntry.generation.oneClickGenerate')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 可排序的图片项组件
interface SortableImageItemProps {
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

function SortableImageItem({
  item,
  index,
  editingTimeId,
  editingStartMinutes,
  editingStartSeconds,
  editingEndMinutes,
  editingEndSeconds,
  onEditingStartMinutesChange,
  onEditingStartSecondsChange,
  onEditingEndMinutesChange,
  onEditingEndSecondsChange,
  onStartEditTime,
  onSaveTimeEdit,
  onCancelTimeEdit,
  parseTimeRange,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ImageItemComponent
        item={item}
        index={index}
        editingTimeId={editingTimeId}
        editingStartMinutes={editingStartMinutes}
        editingStartSeconds={editingStartSeconds}
        editingEndMinutes={editingEndMinutes}
        editingEndSeconds={editingEndSeconds}
        onEditingStartMinutesChange={onEditingStartMinutesChange}
        onEditingStartSecondsChange={onEditingStartSecondsChange}
        onEditingEndMinutesChange={onEditingEndMinutesChange}
        onEditingEndSecondsChange={onEditingEndSecondsChange}
        onStartEditTime={onStartEditTime}
        onSaveTimeEdit={onSaveTimeEdit}
        onCancelTimeEdit={onCancelTimeEdit}
        parseTimeRange={parseTimeRange}
        dragListeners={listeners}
      />
    </div>
  );
}

// 图片项组件
interface ImageItem {
  id: string;
  description: string;
  parameters: string;
  timeRange: string;
}

interface ImageItemProps {
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

function ImageItemComponent({
  item,
  index,
  editingTimeId,
  editingStartMinutes,
  editingStartSeconds,
  editingEndMinutes,
  editingEndSeconds,
  onEditingStartMinutesChange,
  onEditingStartSecondsChange,
  onEditingEndMinutesChange,
  onEditingEndSecondsChange,
  onStartEditTime,
  onSaveTimeEdit,
  onCancelTimeEdit,
  parseTimeRange,
  dragListeners,
}: ImageItemProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-stretch space-x-3 min-h-[100px]">
      {/* 序号和操作按钮列 */}
      <div className="flex flex-col justify-between items-center h-full min-w-[20px]">
        <div className="text-lg font-medium text-blue-600">
          {index + 1}
        </div>
        <div className="flex flex-col items-center space-y-1">
          {dragListeners && (
            <button className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing" {...dragListeners}>
              <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button className="p-1 hover:bg-gray-100 rounded">
            <Icon icon="ri:add-circle-line" className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* 图片缩略图 */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200"></div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0 flex space-x-4">
        {/* 左侧：描述 */}
        <div className="flex-1 text-sm text-gray-800 leading-relaxed">
          {item.description}
        </div>
        {/* 右侧：参数和时间 */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs text-gray-500 leading-relaxed">
            {item.parameters}
          </div>
          <div className="flex items-center space-x-2">
            {editingTimeId === item.id ? (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                {/* 开始时间编辑 - 分钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingStartMinutes}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingStartMinutesChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  placeholder="00"
                  maxLength={2}
                />
                <span>:</span>
                {/* 开始时间编辑 - 秒钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingStartSeconds}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingStartSecondsChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  placeholder="00"
                  maxLength={2}
                />
                <span>-</span>
                {/* 结束时间编辑 - 分钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingEndMinutes}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingEndMinutesChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  placeholder="00"
                  maxLength={2}
                />
                <span>:</span>
                {/* 结束时间编辑 - 秒钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingEndSeconds}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingEndSecondsChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  placeholder="00"
                  maxLength={2}
                />
                {/* 统一的保存和取消按钮 */}
                <button
                  onClick={() => onSaveTimeEdit(item.id)}
                  className="text-green-600 hover:text-green-800 ml-1 p-0 border-0 bg-transparent outline-none cursor-pointer"
                >
                  <Icon icon="ri:check-line" className="w-3 h-3" />
                </button>
                <button
                  onClick={onCancelTimeEdit}
                  className="text-red-600 hover:text-red-800 p-0 border-0 bg-transparent outline-none cursor-pointer"
                >
                  <Icon icon="ri:close-line" className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                {(() => {
                  const timeData = parseTimeRange(item.timeRange);
                  return (
                    <>
                      <span>{timeData.startMinutes}:{timeData.startSeconds}</span>
                      <span>-</span>
                      <span>{timeData.endMinutes}:{timeData.endSeconds}</span>
                      <button
                        onClick={() => onStartEditTime(item.id, item.timeRange)}
                        className="text-gray-400 hover:text-blue-600 ml-1 p-0 border-0 bg-transparent outline-none cursor-pointer"
                      >
                        <Icon icon="ri:edit-line" className="w-3 h-3" />
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 视频项组件
interface VideoItem {
  id: string;
  description: string;
  parameters: string;
  timeRange: string;
}

interface VideoItemProps {
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

function VideoItemComponent({
  item,
  index,
  editingTimeId,
  editingStartMinutes,
  editingStartSeconds,
  editingEndMinutes,
  editingEndSeconds,
  onEditingStartMinutesChange,
  onEditingStartSecondsChange,
  onEditingEndMinutesChange,
  onEditingEndSecondsChange,
  onStartEditTime,
  onSaveTimeEdit,
  onCancelTimeEdit,
  parseTimeRange,
  dragListeners,
}: VideoItemProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-stretch space-x-3 min-h-[100px]">
      {/* 序号和操作按钮列 */}
      <div className="flex flex-col justify-between items-center h-full min-w-[20px]">
        <div className="text-lg font-medium text-blue-600">
          {index + 1}
        </div>
        <div className="flex flex-col items-center space-y-1">
          {dragListeners && (
            <button className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing" {...dragListeners}>
              <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button className="p-1 hover:bg-gray-100 rounded">
            <Icon icon="ri:add-circle-line" className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* 视频缩略图 */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200"></div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0 flex space-x-4">
        {/* 左侧：描述 */}
        <div className="flex-1 text-sm text-gray-800 leading-relaxed">
          {item.description}
        </div>
        {/* 右侧：参数和时间 */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-xs text-gray-500 leading-relaxed">
            {item.parameters}
          </div>
          <div className="flex items-center space-x-2">
            {editingTimeId === item.id ? (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                {/* 开始时间编辑 - 分钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingStartMinutes}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingStartMinutesChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveTimeEdit(item.id);
                    } else if (e.key === 'Escape') {
                      onCancelTimeEdit();
                    }
                  }}
                  placeholder="00"
                  maxLength={2}
                />
                <span>:</span>
                {/* 开始时间编辑 - 秒钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingStartSeconds}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingStartSecondsChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveTimeEdit(item.id);
                    } else if (e.key === 'Escape') {
                      onCancelTimeEdit();
                    }
                  }}
                  placeholder="00"
                  maxLength={2}
                />
                <span>-</span>
                {/* 结束时间编辑 - 分钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingEndMinutes}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingEndMinutesChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveTimeEdit(item.id);
                    } else if (e.key === 'Escape') {
                      onCancelTimeEdit();
                    }
                  }}
                  placeholder="00"
                  maxLength={2}
                />
                <span>:</span>
                {/* 结束时间编辑 - 秒钟 */}
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editingEndSeconds}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    onEditingEndSecondsChange(value.toString());
                  }}
                  className="text-xs w-8 text-center bg-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveTimeEdit(item.id);
                    } else if (e.key === 'Escape') {
                      onCancelTimeEdit();
                    }
                  }}
                  placeholder="00"
                  maxLength={2}
                />
                {/* 统一的保存和取消按钮 */}
                <button
                  onClick={() => onSaveTimeEdit(item.id)}
                  className="text-green-600 hover:text-green-800 ml-1"
                >
                  <Icon icon="ri:check-line" className="w-3 h-3" />
                </button>
                <button
                  onClick={onCancelTimeEdit}
                  className="text-red-600 hover:text-red-800 p-0 border-0 bg-transparent outline-none cursor-pointer"
                >
                  <Icon icon="ri:close-line" className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                {(() => {
                  const timeData = parseTimeRange(item.timeRange);
                  return (
                    <>
                      <span>{timeData.startMinutes}:{timeData.startSeconds}</span>
                      <span>-</span>
                      <span>{timeData.endMinutes}:{timeData.endSeconds}</span>
                      <button
                        onClick={() => onStartEditTime(item.id, item.timeRange)}
                        className="text-gray-400 hover:text-blue-600 ml-1 p-0 border-0 bg-transparent outline-none cursor-pointer"
                      >
                        <Icon icon="ri:edit-line" className="w-3 h-3" />
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 可排序的视频项组件
interface SortableVideoItemProps {
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

function SortableVideoItem({
  item,
  index,
  editingTimeId,
  editingStartMinutes,
  editingStartSeconds,
  editingEndMinutes,
  editingEndSeconds,
  onEditingStartMinutesChange,
  onEditingStartSecondsChange,
  onEditingEndMinutesChange,
  onEditingEndSecondsChange,
  onStartEditTime,
  onSaveTimeEdit,
  onCancelTimeEdit,
  parseTimeRange,
}: SortableVideoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <VideoItemComponent
        item={item}
        index={index}
        editingTimeId={editingTimeId}
        editingStartMinutes={editingStartMinutes}
        editingStartSeconds={editingStartSeconds}
        editingEndMinutes={editingEndMinutes}
        editingEndSeconds={editingEndSeconds}
        onEditingStartMinutesChange={onEditingStartMinutesChange}
        onEditingStartSecondsChange={onEditingStartSecondsChange}
        onEditingEndMinutesChange={onEditingEndMinutesChange}
        onEditingEndSecondsChange={onEditingEndSecondsChange}
        onStartEditTime={onStartEditTime}
        onSaveTimeEdit={onSaveTimeEdit}
        onCancelTimeEdit={onCancelTimeEdit}
        parseTimeRange={parseTimeRange}
        dragListeners={listeners}
      />
    </div>
  );
}

// 通用标题栏组件
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  subtitleOptions?: string[];
  onSubtitleChange?: (value: string) => void;
  onOptionsChange?: (options: string[]) => void;
}

function SectionHeader({ title, subtitle, subtitleOptions, onSubtitleChange, onOptionsChange }: SectionHeaderProps) {
  const { t } = useI18n();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState('');

  // 处理单击文本开始编辑
  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingValue(subtitle || '');
    setIsDropdownOpen(false);
  };

  // 处理点击箭头显示下拉框
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
    setIsEditing(false);
  };

  // 处理编辑完成
  const handleEditComplete = () => {
    if (editingValue.trim() && editingValue !== subtitle) {
      onSubtitleChange?.(editingValue.trim());
    }
    setIsEditing(false);
    setEditingValue('');
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingValue('');
    }
  };

  // 处理下拉选项编辑
  const handleOptionDoubleClick = (index: number, option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOptionIndex(index);
    setEditingOptionValue(option);
  };

  // 处理下拉选项编辑完成
  const handleOptionEditComplete = () => {
    if (editingOptionIndex !== null && subtitleOptions && onOptionsChange) {
      const newOptions = [...subtitleOptions];
      if (editingOptionValue.trim()) {
        newOptions[editingOptionIndex] = editingOptionValue.trim();
        onOptionsChange(newOptions);
      }
    }
    setEditingOptionIndex(null);
    setEditingOptionValue('');
  };

  // 处理下拉选项键盘事件
  const handleOptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOptionEditComplete();
    } else if (e.key === 'Escape') {
      setEditingOptionIndex(null);
      setEditingOptionValue('');
    }
  };

  return (
    <div className="p-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg width="40" height="36" viewBox="0 0 56 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 边框 */}
            <rect width="56" height="51" rx="10" fill="#3E83F6"/>
            {/* Logo内容 - 星星 */}
            <g transform="translate(28, 25.5) scale(0.7, 0.7) translate(-19, -19)">
              <path d="M34.8333 15.3109C34.7333 15.0213 34.5515 14.767 34.3098 14.5787C34.0681 14.3904 33.7769 14.2762 33.4717 14.2501L24.4625 12.9359L20.425 4.75011C20.2954 4.48241 20.0929 4.25665 19.8409 4.09868C19.5889 3.94072 19.2974 3.85693 19 3.85693C18.7026 3.85693 18.4111 3.94072 18.1591 4.09868C17.9071 4.25665 17.7047 4.48241 17.575 4.75011L13.5375 12.9201L4.52834 14.2501C4.2353 14.2918 3.9598 14.4147 3.73311 14.605C3.50642 14.7953 3.33761 15.0454 3.24584 15.3268C3.16183 15.6018 3.1543 15.8944 3.22403 16.1734C3.29377 16.4523 3.43815 16.707 3.64167 16.9101L10.1808 23.2434L8.59751 32.2368C8.54098 32.5336 8.57058 32.8404 8.6828 33.121C8.79503 33.4015 8.98519 33.6441 9.23084 33.8201C9.47027 33.9913 9.75266 34.0923 10.0463 34.1119C10.34 34.1315 10.6333 34.0688 10.8933 33.9309L19 29.7034L27.075 33.9468C27.2972 34.0721 27.5482 34.1376 27.8033 34.1368C28.1387 34.138 28.4658 34.0326 28.7375 33.8359C28.9832 33.66 29.1733 33.4174 29.2855 33.1368C29.3978 32.8563 29.4274 32.5494 29.3708 32.2526L27.7875 23.2593L34.3267 16.9259C34.5553 16.7323 34.7242 16.4777 34.8139 16.1918C34.9036 15.9059 34.9103 15.6005 34.8333 15.3109ZM25.0958 21.6443C24.9102 21.8239 24.7712 22.0462 24.6912 22.2918C24.6112 22.5374 24.5924 22.7989 24.6367 23.0534L25.7767 29.6876L19.8233 26.5209C19.5943 26.399 19.3387 26.3352 19.0792 26.3352C18.8196 26.3352 18.5641 26.399 18.335 26.5209L12.3817 29.6876L13.5217 23.0534C13.5659 22.7989 13.5472 22.5374 13.4671 22.2918C13.3871 22.0462 13.2482 21.8239 13.0625 21.6443L8.31251 16.8943L14.9783 15.9284C15.2348 15.8928 15.4787 15.7947 15.6885 15.6429C15.8983 15.4911 16.0676 15.2901 16.1817 15.0576L19 9.02511L21.9767 15.0734C22.0907 15.3059 22.2601 15.5069 22.4699 15.6587C22.6797 15.8105 22.9235 15.9086 23.18 15.9443L29.8458 16.9101L25.0958 21.6443Z" fill="white"/>
            </g>
          </svg>
          <span className="text-base font-medium text-gray-900">{title}</span>
          {subtitle && (
            <div className="relative">
              {isEditing ? (
                // 编辑模式
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={handleEditComplete}
                  onKeyDown={handleKeyDown}
                  className="text-sm text-gray-600 bg-white border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  style={{ minWidth: '200px' }}
                />
              ) : (
                // 显示模式
                <div className="flex items-center space-x-1 text-sm text-gray-600 select-none">
                  <span
                    className="cursor-pointer hover:text-gray-800 transition-colors"
                    onClick={handleTextClick}
                    title={t('shortplayEntry.scenes.editSceneName')}
                  >
                    {subtitle}
                  </span>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    className={`w-4 h-4 cursor-pointer hover:text-blue-500 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    onClick={handleArrowClick}
                    title={t('shortplayEntry.scenes.selectPresetScene')}
                  />
                </div>
              )}

              {/* 下拉选择器 */}
              {isDropdownOpen && subtitleOptions && !isEditing && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  {subtitleOptions.map((option, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        if (editingOptionIndex !== index) {
                          onSubtitleChange?.(option);
                          setIsDropdownOpen(false);
                        }
                      }}
                      onDoubleClick={(e) => handleOptionDoubleClick(index, option, e)}
                      title={t('shortplayEntry.scenes.clickToSelectDoubleClickToEdit')}
                    >
                      {editingOptionIndex === index ? (
                        <input
                          type="text"
                          value={editingOptionValue}
                          onChange={(e) => setEditingOptionValue(e.target.value)}
                          onBlur={handleOptionEditComplete}
                          onKeyDown={handleOptionKeyDown}
                          className="w-full bg-transparent border-none outline-none text-sm text-gray-700"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        option
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Icon icon="ri:add-circle-line" className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      {/* 点击其他地方关闭下拉框和编辑框 */}
      {(isDropdownOpen || isEditing || editingOptionIndex !== null) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsDropdownOpen(false);
            if (isEditing) {
              handleEditComplete();
            }
            if (editingOptionIndex !== null) {
              handleOptionEditComplete();
            }
          }}
        />
      )}
    </div>
  );
}

function ShortplayEntryPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('script');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1');
  const [progress, setProgress] = useState<number>(75); // 进度百分比
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasVideo, setHasVideo] = useState<boolean>(true); // 默认有视频
  const [userInput, setUserInput] = useState<string>(''); // 用户输入内容
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // 生成状态

  // 底部输入区域的额外状态
  const [voiceType, setVoiceType] = useState<string>('male');
  const [backgroundType, setBackgroundType] = useState<string>(t('shortplayEntry.image.background'));
  const [style, setStyle] = useState<string>(t('shortplayEntry.image.ancient'));
  const [videoLength, setVideoLength] = useState<string>('2s');
  const [resolution, setResolution] = useState<string>('1080p');
  const [singleGenerate, setSingleGenerate] = useState<boolean>(false);

  // 场次管理状态
  const [selectedScene, setSelectedScene] = useState<string>('1-2夜内 废弃工厂 (分支B)');
  const [sceneOptions, setSceneOptions] = useState([
    '1-2夜内 废弃工厂 (分支B)',
    '1-1白天 学校走廊 (分支A)',
    '2-1夜内 神秘房间 (分支C)',
    '3-1黄昏 天台 (分支D)',
    '4-1深夜 地下室 (分支E)'
  ]);

  // 剧本卡片数据状态
  const [scriptCards, setScriptCards] = useState<ScriptCardProps[]>([
    {
      id: 'script-1',
      description: '瞬移技术下忙中的希，用自己的外套盖在她身上，他始起身，踏上濡湿下吊与最后一丝希望。',
      dialogues: [
        {
          character: '千草折 (Chigusa Inori)',
          content: '(急切地) 嗯！你快走！诗织她已经...'
        },
        {
          character: '神谷瞬 (Kamiya Shun)',
          content: '(打断她，大步走向诗织) 不！我不能就这么放弃她！'
        }
      ]
    },
    {
      id: 'script-2',
      description: '他张开双臂，没有害怕何威胁，拥住诗织的前额。',
      dialogues: [
        {
          character: '神谷瞬 (Kamiya Shun)',
          content: '(声音颤抖但坚大声) 诗织！看着我！我爱你！神谷瞬！你忘了我们一起在天台许的愿吗？你说要买一家全世界最好吃的蛋糕店！'
        }
      ]
    },
    {
      id: 'script-3',
      description: '魔化的诗织动作一顿，浑浊的眼中似乎闪过了一丝迷茫，她往后一步，仍徘徊在方向纠结。',
      dialogues: [
        {
          character: '夏目诗织 (Natsume Shiori)',
          content: '(低语，含泪不清) ......蛋糕......好子......好像......'
        }
      ]
    },
    {
      id: 'script-4',
      description: '瞬着到一丝希望，眼中燃起了光芒，趁住此时，诗织的速攻被挡弹跳的可塑感载攻代。她拉她挡起出一声失魂，眼中重新的光芒闪闪烁现了。',
      dialogues: [
        {
          character: '夏目诗织 (Natsume Shiori)',
          content: '(尖叫) 肉——！！！'
        }
      ]
    }
  ]);

  // 音频数据状态
  const [audioItems, setAudioItems] = useState([
    {
      id: 'audio-1',
      type: 'voice',
      speaker: '男1',
      content: '他抬头更是惊骇到了极点',
      timeRange: '00:45\'-00:49\'',
      icon: 'ri:user-line'
    },
    {
      id: 'audio-2',
      type: 'voice',
      speaker: '男1',
      content: '不知道会有什么程度',
      timeRange: '00:49\'-00:53\'',
      icon: 'ri:user-line'
    },
    {
      id: 'audio-3',
      type: 'sound',
      speaker: '音效',
      content: '需要悲伤的，沉重的.mp3',
      timeRange: '00:49\'-00:59\'',
      icon: 'ri:music-2-line'
    }
  ]);

  // 图片数据状态
  const [imageItems, setImageItems] = useState([
    {
      id: 'img-1',
      description: '真实照片质感线波丽符写，银灰蓝色发丝浸润透光，反光材质玻璃感雾染柔雾...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:00\'-00:05\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'img-2',
      description: '金黄色调，手绘插画，金箔岩精美，华贵，奇秘，华丽异域风情纱丽少女，黑...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:05\'-00:10\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'img-3',
      description: '一头黑色的长发如瀑布般垂落，发间点缀着古老经生铜，有韵的闪烁着光芒。唯...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:11\'-00:15\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'img-4',
      description: '高定风，漫画中国古代金发美女，厚涂肌理，被紧细腺，超写实，超清晰，王...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:16\'-00:20\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'img-5',
      description: '古风女，深色长发，粉红衣服，花朵发饰，雨夜，怯感，颓靡，病娇，女脸上身...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:21\'-00:25\'',
      image: '/api/placeholder/80/80'
    }
  ]);

  // 编辑时间状态
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingStartMinutes, setEditingStartMinutes] = useState<string>('');
  const [editingStartSeconds, setEditingStartSeconds] = useState<string>('');
  const [editingEndMinutes, setEditingEndMinutes] = useState<string>('');
  const [editingEndSeconds, setEditingEndSeconds] = useState<string>('');

  // 视频数据状态 (使用与图片相同的数据结构)
  const [videoItems, setVideoItems] = useState([
    {
      id: 'video-1',
      description: '真实照片质感线波丽符写，银灰蓝色发丝浸润透光，反光材质玻璃感雾染柔雾...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:00\'-00:05\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'video-2',
      description: '金黄色调，手绘插画，金箔岩精美，华贵，奇秘，华丽异域风情纱丽少女，黑...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:05\'-00:10\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'video-3',
      description: '一头黑色的长发如瀑布般垂落，发间点缀着古老经生铜，有韵的闪烁着光芒。唯...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:11\'-00:15\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'video-4',
      description: '高定风，漫画中国古代金发美女，厚涂肌理，被紧细腺，超写实，超清晰，王...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:16\'-00:20\'',
      image: '/api/placeholder/80/80'
    },
    {
      id: 'video-5',
      description: '古风女，深色长发，粉红衣服，花朵发饰，雨夜，怯感，颓靡，病娇，女脸上身...',
      parameters: '柯达5219胶片颗粒｜快门速度1/48｜色温2800K｜F1.8浅景深｜霓虹辉光强度120%',
      timeRange: '00:21\'-00:25\'',
      image: '/api/placeholder/80/80'
    }
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = "/32767410413-1-192.mp4"; // 视频文件路径

  // 进度条拖拽状态
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAudioItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 图片拖拽处理
  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 视频拖拽处理
  const handleVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setVideoItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 剧本卡片拖动处理
  const handleScriptDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScriptCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 删除剧本卡片
  const handleDeleteScriptCard = (id: string) => {
    setScriptCards((items) => items.filter((item) => item.id !== id));
  };

  // 时间解析和格式化函数
  const parseTimeRange = (timeRange: string) => {
    // 从 "00:00'-00:05'" 格式中提取开始和结束时间
    const match = timeRange.match(/(\d{2}):(\d{2})'-(\d{2}):(\d{2})'/);
    if (match) {
      return {
        startMinutes: match[1],
        startSeconds: match[2],
        endMinutes: match[3],
        endSeconds: match[4]
      };
    }
    return { startMinutes: '00', startSeconds: '00', endMinutes: '00', endSeconds: '05' };
  };

  const formatTimeRange = (startMin: string, startSec: string, endMin: string, endSec: string) => {
    return `${startMin.padStart(2, '0')}:${startSec.padStart(2, '0')}'-${endMin.padStart(2, '0')}:${endSec.padStart(2, '0')}'`;
  };

  // 编辑时间相关函数
  const startEditTime = (itemId: string, currentTimeRange: string) => {
    console.log('Starting edit for item:', itemId, 'timeRange:', currentTimeRange);
    const timeData = parseTimeRange(currentTimeRange);
    console.log('Parsed time data:', timeData);

    setEditingTimeId(itemId);
    setEditingStartMinutes(timeData.startMinutes);
    setEditingStartSeconds(timeData.startSeconds);
    setEditingEndMinutes(timeData.endMinutes);
    setEditingEndSeconds(timeData.endSeconds);
  };

  const saveTimeEdit = (itemId: string, isImage: boolean = true) => {
    // 验证输入是否有效
    if (!editingStartMinutes || !editingStartSeconds || !editingEndMinutes || !editingEndSeconds) return;

    // 在保存时补零
    const startMin = editingStartMinutes.padStart(2, '0');
    const startSec = editingStartSeconds.padStart(2, '0');
    const endMin = editingEndMinutes.padStart(2, '0');
    const endSec = editingEndSeconds.padStart(2, '0');

    const newTimeRange = formatTimeRange(startMin, startSec, endMin, endSec);

    const updateItems = (items: typeof imageItems) =>
      items.map(item => {
        if (item.id === itemId) {
          return { ...item, timeRange: newTimeRange };
        }
        return item;
      });

    if (isImage) {
      setImageItems(updateItems);
    } else {
      setVideoItems(updateItems);
    }

    setEditingTimeId(null);
    setEditingStartMinutes('');
    setEditingStartSeconds('');
    setEditingEndMinutes('');
    setEditingEndSeconds('');
  };

  const cancelTimeEdit = () => {
    setEditingTimeId(null);
    setEditingStartMinutes('');
    setEditingStartSeconds('');
    setEditingEndMinutes('');
    setEditingEndSeconds('');
  };

  // 处理时间输入的辅助函数
  const handleTimeInput = (value: string, max: number) => {
    // 只允许数字输入，最多2位
    const numValue = value.replace(/\D/g, '').slice(0, 2);

    if (numValue === '') return '';

    const intValue = parseInt(numValue);
    if (isNaN(intValue)) return '';

    // 如果超过最大值，返回最大值对应的字符串
    if (intValue > max) {
      return max.toString();
    }

    return numValue;
  };

  // 处理进度条拖拽
  const handleProgressMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, newProgress)));

    // 同步视频时间
    if (videoRef.current && videoRef.current.duration) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressMove(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressMove(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 视频控制函数
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 视频加载完成后重置进度
  const handleVideoLoaded = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  // 计算当前时间
  const videoDuration = videoRef.current?.duration || 0;
  const currentTime = Math.floor((progress / 100) * videoDuration);
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 计算总时长显示
  const totalMinutes = Math.floor(videoDuration / 60);
  const totalSeconds = Math.floor(videoDuration % 60);
  const totalTimeDisplay = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;


  // 一键生成API调用
  const handleGenerate = async () => {
    if (!userInput.trim()) {
      alert(t('shortplayEntry.input.description'));
      return;
    }

    setIsGenerating(true);
    try {
      // 从localStorage获取token和user信息
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token) {
        alert(t('shortplayEntry.input.authTokenError'));
        return;
      }

      // 解析user信息获取userId
      let userId = "use123"; // 默认值
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.userId || userId;
        } catch (error) {
          console.warn(t('shortplayEntry.input.userInfoParseError') + ', userId:', error);
        }
      }

      const response = await fetch(`${STORYAI_API_BASE}/series/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          userId: userId,
          seriesName: t('shortplayEntry.examples.series.name'),
          seriesDescription: t('shortplayEntry.examples.series.description'),
          userInput: userInput.trim(),
          prompt: userInput.trim(),
          status: "DRAFT",
          episodes: []
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(t('shortplayEntry.input.generateSuccess') + ':', result);

        // 检查返回的code是否为0表示成功
        if (result.code === 0) {
          const { seriesId, episodeId, message } = result.data;
          alert(`${message}\n剧集ID: ${seriesId}\n剧集ID: ${episodeId}`);
          setUserInput(''); // 清空输入
        } else {
          throw new Error(result.message || t('shortplayEntry.input.generateFailed'));
        }
      } else {
        throw new Error(`请求失败: ${response.status}`);
      }
    } catch (error) {
      console.error(t('shortplayEntry.input.generateFailed') + ':', error);
      alert(t('shortplayEntry.input.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex flex-grow overflow-hidden">
        <>
          {/* 左侧面板 - 一键创作 (均分) */}
          <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          {/* 顶部Logo和标题区 */}
          <div className="p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg width="40" height="36" viewBox="0 0 56 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 边框 */}
                  <rect width="56" height="51" rx="10" fill="#3E83F6"/>
                  {/* Logo内容 - 星星 */}
                  <g transform="translate(28, 25.5) scale(0.7, 0.7) translate(-19, -19)">
                    <path d="M34.8333 15.3109C34.7333 15.0213 34.5515 14.767 34.3098 14.5787C34.0681 14.3904 33.7769 14.2762 33.4717 14.2501L24.4625 12.9359L20.425 4.75011C20.2954 4.48241 20.0929 4.25665 19.8409 4.09868C19.5889 3.94072 19.2974 3.85693 19 3.85693C18.7026 3.85693 18.4111 3.94072 18.1591 4.09868C17.9071 4.25665 17.7047 4.48241 17.575 4.75011L13.5375 12.9201L4.52834 14.2501C4.2353 14.2918 3.9598 14.4147 3.73311 14.605C3.50642 14.7953 3.33761 15.0454 3.24584 15.3268C3.16183 15.6018 3.1543 15.8944 3.22403 16.1734C3.29377 16.4523 3.43815 16.707 3.64167 16.9101L10.1808 23.2434L8.59751 32.2368C8.54098 32.5336 8.57058 32.8404 8.6828 33.121C8.79503 33.4015 8.98519 33.6441 9.23084 33.8201C9.47027 33.9913 9.75266 34.0923 10.0463 34.1119C10.34 34.1315 10.6333 34.0688 10.8933 33.9309L19 29.7034L27.075 33.9468C27.2972 34.0721 27.5482 34.1376 27.8033 34.1368C28.1387 34.138 28.4658 34.0326 28.7375 33.8359C28.9832 33.66 29.1733 33.4174 29.2855 33.1368C29.3978 32.8563 29.4274 32.5494 29.3708 32.2526L27.7875 23.2593L34.3267 16.9259C34.5553 16.7323 34.7242 16.4777 34.8139 16.1918C34.9036 15.9059 34.9103 15.6005 34.8333 15.3109ZM25.0958 21.6443C24.9102 21.8239 24.7712 22.0462 24.6912 22.2918C24.6112 22.5374 24.5924 22.7989 24.6367 23.0534L25.7767 29.6876L19.8233 26.5209C19.5943 26.399 19.3387 26.3352 19.0792 26.3352C18.8196 26.3352 18.5641 26.399 18.335 26.5209L12.3817 29.6876L13.5217 23.0534C13.5659 22.7989 13.5472 22.5374 13.4671 22.2918C13.3871 22.0462 13.2482 21.8239 13.0625 21.6443L8.31251 16.8943L14.9783 15.9284C15.2348 15.8928 15.4787 15.7947 15.6885 15.6429C15.8983 15.4911 16.0676 15.2901 16.1817 15.0576L19 9.02511L21.9767 15.0734C22.0907 15.3059 22.2601 15.5069 22.4699 15.6587C22.6797 15.8105 22.9235 15.9086 23.18 15.9443L29.8458 16.9101L25.0958 21.6443Z" fill="white"/>
                  </g>
                </svg>
                <span className="text-base font-medium text-gray-900">一键创作</span>
              </div>

              {/* Tab切换按钮组 */}
              <div className="flex items-center bg-gray-100 border" style={{ height: '36px', width: '268px', borderRadius: '100px', borderColor: '#3e83f6' }}>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'script'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('script')}
                >
                  剧本
                </button>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'audio'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('audio')}
                >
                  音频
                </button>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'image'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('image')}
                >
                  图片
                </button>
                <button
                  className={`flex-1 h-full text-sm font-medium transition-all flex items-center justify-center ${
                    activeTab === 'video'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ borderRadius: '100px' }}
                  onClick={() => setActiveTab('video')}
                >
                  视频
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-grow p-4 overflow-auto min-h-0">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              {/* 卡片内容区域 */}
              <div className="flex-grow p-4 overflow-auto">
                {activeTab === 'script' && (
                  <div className="space-y-4">
                    {/* 画面1 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-medium">G</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">画面：1  时长：00:00'-00:05'</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700 pl-8">
                        <div className="break-words"><span className="font-medium">• 景别：</span>特写 → 全景</div>
                        <div className="break-words"><span className="font-medium">• 运镜：</span>镜头从上往下摇</div>
                        <div className="break-words">
                          <span className="font-medium">• 画面：</span>
                          <div className="ml-4 space-y-1 mt-1 text-gray-600">
                            <div className="break-words">○ 从餐车顶部一个褪色的黄红招牌【特写】开始，招牌上"外粥·24小时"的字样残缺不全，闪烁着不稳定的红光。</div>
                            <div className="break-words">○ 镜头【下摇】，红光在逐渐暗淡的路面上洒下了一片微弱的光晕。雨丝在灯光下清晰可见。</div>
                            <div className="break-words">○ 镜头最终定格在餐车旁的金属桌椅，几张惆怅的桌椅在外面，虽然、格雷独自一人坐在餐桌角落的位置。</div>
                            <div className="break-words">○ 音效：环境雨声，远处城市交通噪音，霓虹灯"滋滋"的电流声。</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 画面2 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-800">画面：2  时长：00:05'-00:10'</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700 pl-8">
                        <div className="break-words"><span className="font-medium">• 景别：</span>中近景</div>
                        <div className="break-words"><span className="font-medium">• 运镜：</span>固定</div>
                        <div className="break-words">
                          <span className="font-medium">• 画面：</span>虽然，格雷。深灰色连帽衫的视线垂得很低，只露出尖细的下颌线。他指间握着皱巴巴的纸巾，缓慢地擦去嘴角边的汁液。面前的是早已被泪水打湿的热粥。他的动作缓慢且理。
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'audio' && (
                  <div className="space-y-4">
                    {/* 配音选择区域 */}
                    <div className="space-y-3">
                      <div className="relative w-24">
                        <select className="w-full h-9 pl-3 pr-8 text-sm rounded-lg bg-white focus:outline-none appearance-none">
                          <option value="dubbing">配音</option>
                          <option value="sound_effects">音效</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>

                      {/* 已设置的配音人员 */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">楚</span>
                          </div>
                          <span className="text-sm text-gray-800">楚青</span>
                          <div className="flex space-x-2 ml-auto">
                            <button className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600">试听</button>
                            <button className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600">删除</button>
                          </div>
                        </div>
                      </div>

                      {/* 音频文件列表 */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Icon icon="ri:music-2-line" className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">清潮少年音.mp3</div>
                          </div>
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">男</span>
                          </div>
                          <Icon icon="ri:arrow-down-s-line" className="w-4 h-4 text-gray-400" />
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-xs border border-blue-500 text-blue-500 rounded">播放</button>
                            <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded">应用</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'image' && (
                  <div className="space-y-4">
                    {/* 分镜选择区域 */}
                    <div className="space-y-3">
                      <div className="relative w-24">
                        <select className="w-full h-9 pl-3 pr-8 text-sm rounded-lg bg-white focus:outline-none appearance-none">
                          <option value="shot1">分镜1</option>
                          <option value="shot2">分镜2</option>
                          <option value="shot3">分镜3</option>
                          <option value="shot4">分镜4</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 图片功能内容区域 */}
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <span>图片功能开发中...</span>
                    </div>
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="space-y-4">
                    {/* 分镜选择区域 */}
                    <div className="space-y-3">
                      <div className="relative w-24">
                        <select className="w-full h-9 pl-3 pr-8 text-sm rounded-lg bg-white focus:outline-none appearance-none">
                          <option value="shot1">分镜1</option>
                          <option value="shot2">分镜2</option>
                          <option value="shot3">分镜3</option>
                          <option value="shot4">分镜4</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 视频功能内容区域 */}
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <span>视频功能开发中...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 卡片底部输入区域 */}
              <BottomInputArea
                activeTab={activeTab}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                userInput={userInput}
                onInputChange={setUserInput}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                placeholder={t('shortplayEntry.input.placeholder')}
                voiceType={voiceType}
                onVoiceTypeChange={setVoiceType}
                backgroundType={backgroundType}
                onBackgroundTypeChange={setBackgroundType}
                style={style}
                onStyleChange={setStyle}
                videoLength={videoLength}
                onVideoLengthChange={setVideoLength}
                resolution={resolution}
                onResolutionChange={setResolution}
                singleGenerate={singleGenerate}
                onSingleGenerateChange={setSingleGenerate}
              />
            </div>
          </div>
        </div>

        {/* 中间面板 - 剧本编辑区域 */}
        <div className="flex-1 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <SectionHeader
            title={
              activeTab === 'script' ? t('shortplayEntry.tabs.script') :
              activeTab === 'audio' ? t('shortplayEntry.tabs.audio') :
              activeTab === 'image' ? t('shortplayEntry.tabs.image') : t('shortplayEntry.tabs.video')
            }
            subtitle={
              activeTab === 'script' ? selectedScene :
              activeTab === 'audio' ? selectedScene :
              undefined
            }
            subtitleOptions={
              activeTab === 'script' || activeTab === 'audio' ? sceneOptions : undefined
            }
            onSubtitleChange={(value) => setSelectedScene(value)}
            onOptionsChange={(options) => setSceneOptions(options)}
          />

          {/* 剧本内容区域 */}
          <div className="flex-grow p-4 overflow-auto min-h-0">
            {activeTab === 'script' && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleScriptDragEnd}
              >
                <SortableContext
                  items={scriptCards.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {scriptCards.map((item) => (
                      <SortableScriptCard
                        key={item.id}
                        item={{
                          ...item,
                          onDelete: handleDeleteScriptCard
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {activeTab === 'audio' && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={audioItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {audioItems.map((item) => (
                      <SortableAudioItem key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {activeTab === 'image' && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleImageDragEnd}
              >
                <SortableContext
                  items={imageItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {imageItems.map((item, index) => (
                      <SortableImageItem
                        key={item.id}
                        item={item}
                        index={index}
                        editingTimeId={editingTimeId}
                        editingStartMinutes={editingStartMinutes}
                        editingStartSeconds={editingStartSeconds}
                        editingEndMinutes={editingEndMinutes}
                        editingEndSeconds={editingEndSeconds}
                        onEditingStartMinutesChange={setEditingStartMinutes}
                        onEditingStartSecondsChange={setEditingStartSeconds}
                        onEditingEndMinutesChange={setEditingEndMinutes}
                        onEditingEndSecondsChange={setEditingEndSeconds}
                        onStartEditTime={startEditTime}
                        onSaveTimeEdit={(itemId) => saveTimeEdit(itemId, true)}
                        onCancelTimeEdit={cancelTimeEdit}
                        parseTimeRange={parseTimeRange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {activeTab === 'video' && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleVideoDragEnd}
              >
                <SortableContext
                  items={videoItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {videoItems.map((item, index) => (
                      <SortableVideoItem
                        key={item.id}
                        item={item}
                        index={index}
                        editingTimeId={editingTimeId}
                        editingStartMinutes={editingStartMinutes}
                        editingStartSeconds={editingStartSeconds}
                        editingEndMinutes={editingEndMinutes}
                        editingEndSeconds={editingEndSeconds}
                        onEditingStartMinutesChange={setEditingStartMinutes}
                        onEditingStartSecondsChange={setEditingStartSeconds}
                        onEditingEndMinutesChange={setEditingEndMinutes}
                        onEditingEndSecondsChange={setEditingEndSeconds}
                        onStartEditTime={startEditTime}
                        onSaveTimeEdit={(itemId) => saveTimeEdit(itemId, false)}
                        onCancelTimeEdit={cancelTimeEdit}
                        parseTimeRange={parseTimeRange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* 右侧面板 - 手机预览区域 (固定宽度340px) */}
        <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ width: '340px' }}>
          {/* 预览头部 */}
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon icon="ri:circle-fill" className="w-2 h-2 text-blue-500" />
                <span className="text-sm font-medium text-gray-800">分镜4</span>
                <Icon icon="ri:arrow-down-s-line" className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <Button size="small" type="text" className="text-xs text-blue-500 border border-blue-200 rounded">
                  <Icon icon="ri:download-line" className="w-3 h-3 mr-1" />
                  下载
                </Button>
                <Button size="small" type="text" className="text-xs text-blue-500 border border-blue-200 rounded">
                  插入选项
                </Button>
              </div>
            </div>
          </div>

          {/* 手机预览容器 */}
          <div className="flex-grow overflow-auto min-h-0 p-2.5">
            <div className="h-full flex items-start justify-center pt-4">
              <div className="relative w-full max-w-xs" style={{ height: '700px' }}>
                {/* 手机外框 - 响应式高度 */}
                <div className="w-full h-full mx-auto bg-black rounded-[2.5rem] p-2 shadow-2xl" style={{ aspectRatio: '9/16' }}>
                  {/* 手机屏幕 */}
                  <div className="w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden relative">
                    {/* 刘海屏设计 */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

                    {/* 视频播放内容 */}
                    <div className="absolute inset-0 overflow-hidden">
                      {hasVideo ? (
                        /* 真实视频播放 */
                        <video
                          ref={videoRef}
                          src={videoSrc}
                          className="w-full h-full object-cover"
                          onClick={togglePlay}
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget;
                            if (video.duration && !isDragging) {
                              setProgress((video.currentTime / video.duration) * 100);
                            }
                          }}
                          onLoadedMetadata={handleVideoLoaded}
                        />
                      ) : (
                        <>
                          {/* 默认雪景背景 */}
                          <div className="relative w-full h-full">
                            {/* 雪景背景 - 模拟真实照片效果 */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-gray-200 to-blue-200">
                              {/* 背景纹理 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gray-300/30"></div>

                              {/* 雪花效果 - 更真实的大小和分布 */}
                              <div className="absolute inset-0">
                                {Array.from({ length: 35 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`absolute bg-white rounded-full opacity-80 ${
                                      Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1'
                                    }`}
                                    style={{
                                      left: `${Math.random() * 100}%`,
                                      top: `${Math.random() * 100}%`,
                                      boxShadow: '0 0 2px rgba(255,255,255,0.5)'
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>

                            {/* 人物照片模拟 */}
                            <div className="absolute inset-0">
                              {/* 男主角 - 前景中心位置 */}
                              <div className="absolute top-16 left-8 w-32 h-48 rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-b from-amber-100 via-orange-200 to-amber-300 relative">
                                  {/* 脸部区域 */}
                                  <div className="absolute top-4 left-6 w-20 h-24 bg-gradient-to-b from-pink-200 to-orange-200 rounded-lg">
                                    {/* 眼睛 */}
                                    <div className="absolute top-6 left-3 w-2 h-1 bg-gray-700 rounded-full"></div>
                                    <div className="absolute top-6 right-3 w-2 h-1 bg-gray-700 rounded-full"></div>
                                    {/* 嘴巴 */}
                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-red-300 rounded-full"></div>
                                  </div>
                                  {/* 头发 */}
                                  <div className="absolute top-2 left-4 w-24 h-16 bg-gradient-to-b from-gray-800 to-gray-600 rounded-t-lg"></div>
                                  {/* 衣服 - 黑色外套 */}
                                  <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-gray-900 to-black"></div>
                                </div>
                              </div>

                              {/* 女主角 - 右侧较远位置 */}
                              <div className="absolute top-28 right-6 w-24 h-36 rounded-lg overflow-hidden opacity-90">
                                <div className="w-full h-full bg-gradient-to-b from-pink-100 via-rose-200 to-pink-300 relative">
                                  {/* 脸部区域 */}
                                  <div className="absolute top-3 left-3 w-16 h-18 bg-gradient-to-b from-pink-200 to-rose-200 rounded-lg">
                                    {/* 眼睛 */}
                                    <div className="absolute top-4 left-2 w-1.5 h-0.5 bg-gray-700 rounded-full"></div>
                                    <div className="absolute top-4 right-2 w-1.5 h-0.5 bg-gray-700 rounded-full"></div>
                                  </div>
                                  {/* 头发 */}
                                  <div className="absolute top-1 left-2 w-18 h-12 bg-gradient-to-b from-amber-800 to-amber-600 rounded-t-lg"></div>
                                  {/* 衣服 */}
                                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-gray-700 to-gray-800"></div>
                                </div>
                              </div>

                              {/* 景深模糊效果 */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                            </div>

                            {/* 字幕区域 */}
                            <div className="absolute bottom-24 left-6 right-6">
                              <div className="text-white text-base font-medium text-center leading-relaxed drop-shadow-lg">
                                她前夫要是看到这个场景
                              </div>
                            </div>
                          </div>
                        </>
                      )}


                      {/* 播放控制按钮 */}
                      {hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <button
                            onClick={togglePlay}
                            className="bg-black/50 text-white rounded-full p-4 hover:bg-black/70 transition-all transform hover:scale-110"
                          >
                            <Icon
                              icon={isPlaying ? "ri:pause-fill" : "ri:play-fill"}
                              className="w-8 h-8"
                            />
                          </button>
                        </div>
                      )}

                      <>
                        {/* 进度条 */}
                        <div className="absolute bottom-12 left-4 right-4 z-10">
                            <div className="flex items-center justify-between text-white text-xs mb-1">
                              <span>{timeDisplay}</span>
                              <span>{totalTimeDisplay}</span>
                            </div>
                            <div className="relative">
                              <div
                                className="w-full h-1 bg-white/30 rounded-full cursor-pointer select-none"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                              >
                                <div
                                  className="h-1 bg-white rounded-full relative"
                                  style={{ width: `${progress}%` }}
                                >
                                  <div
                                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab ${isDragging ? 'cursor-grabbing scale-110' : 'hover:scale-110'} transition-transform duration-150`}
                                    onMouseDown={handleMouseDown}
                                  ></div>
                                </div>
                              </div>
                              {/* 不可见的拖拽区域，增加交互面积 */}
                              <div
                                className="absolute -top-2 -bottom-2 left-0 right-0 cursor-pointer"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                              ></div>
                            </div>
                          </div>

                          {/* 底部操作栏 */}
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 flex items-center justify-around backdrop-blur-sm">
                            <div className="text-center">
                              <div className="text-white text-sm">续梦</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white text-sm">我的</div>
                            </div>
                          </div>
                        </>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

export default ShortplayEntryPage;