import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Tooltip } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableAudioItemProps } from '../types';
import { TimeRangeInput } from '../Common/TimeRangeInput';

export function SortableAudioItem({
  item,
  audioType,
  configuredVoices,
  onVoiceSelect,
  onPlayAudio,
  onShowDeleteConfirm,
  editingItemId,
  editingContent,
  editingRoleName,
  onEditingContentChange,
  onEditingRoleNameChange,
  onStartEditContent,
  onSaveContentEdit,
  onCancelContentEdit,
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
  isHighlighted
}: SortableAudioItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displaySpeaker, setDisplaySpeaker] = useState<string>(item.speaker);
  const [showContentTooltip, setShowContentTooltip] = useState(false);
  const editSelectRef = useRef<HTMLSelectElement>(null);
  const displaySelectRef = useRef<HTMLSelectElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // 当 item.speaker 改变时，更新显示的角色名称
  React.useEffect(() => {
    setDisplaySpeaker(item.speaker);
  }, [item.speaker]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // 防止拖动时字体变形
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    // 强制硬件加速，避免亚像素渲染问题
    willChange: isDragging ? 'transform' : 'auto',
    // 确保像素完美渲染
    backfaceVisibility: 'hidden' as any,
    transformStyle: 'preserve-3d' as any,
    // 防止拖动时卡片伸缩
    width: isDragging ? '100%' : 'auto',
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border px-3 py-2 transition-all ${
        isDragging ? 'shadow-lg z-10' : ''
      } ${
        isHighlighted ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200'
      }`}
      {...attributes}
    >
      {editingItemId?.toString() === item.id ? (
        // 编辑模式
        <div className="space-y-2">
          {/* 音色选择和时间在一行 */}
          <div className="flex items-center space-x-2">
            {item.type === 'voice' && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src="/img/avatar.png" alt="角色" className="w-full h-full object-cover" />
              </div>
            )}
            {audioType === 'voice' ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  ref={editSelectRef}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '24px',
                    height: '24px',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  value={editingRoleName || ''}
                  onChange={(e) => {
                    const voiceId = e.target.value;
                    const selectedVoice = configuredVoices.find(v => v.voiceId === voiceId);
                    onEditingRoleNameChange?.(selectedVoice?.displayName || voiceId);
                    // 重置select，防止相同选项无法再次触发change
                    setTimeout(() => {
                      if (editSelectRef.current) {
                        editSelectRef.current.value = '';
                      }
                    }, 0);
                  }}
                  onClick={(e) => {
                    // 点击时重置值，确保change事件能触发
                    if (editSelectRef.current) {
                      editSelectRef.current.value = '';
                    }
                    e.stopPropagation();
                  }}
                >
                  {configuredVoices.map((voice) => (
                    <option key={voice.voiceId} value={voice.voiceId}>
                      {voice.displayName}
                    </option>
                  ))}
                </select>
                <Icon
                  icon="ri:arrow-down-s-line"
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            ) : (
              <div></div>
            )}
            <TimeRangeInput
              startMinutes={editingStartMinutes || '00'}
              startSeconds={editingStartSeconds || '00'}
              endMinutes={editingEndMinutes || '00'}
              endSeconds={editingEndSeconds || '05'}
              onStartMinutesChange={onEditingStartMinutesChange}
              onStartSecondsChange={onEditingStartSecondsChange}
              onEndMinutesChange={onEditingEndMinutesChange}
              onEndSecondsChange={onEditingEndSecondsChange}
            />
          </div>

          {/* 台词编辑 */}
          <textarea
            value={editingContent || ''}
            onChange={(e) => onEditingContentChange?.(e.target.value)}
            className="w-full p-1.5 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="输入台词..."
          />

          {/* 统一的保存/取消按钮 */}
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onSaveContentEdit?.(item.id)}
              className="text-green-600 hover:text-green-800 p-1 border-0 bg-transparent outline-none cursor-pointer"
            >
              <Icon icon="ri:check-line" className="w-4 h-4" />
            </button>
            <button
              onClick={onCancelContentEdit}
              className="text-red-600 hover:text-red-800 p-1 border-0 bg-transparent outline-none cursor-pointer"
            >
              <Icon icon="ri:close-line" className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // 显示模式
        <div className="flex items-center justify-between"
          onClick={() => onStartEditContent?.(item.id, item.content, item.speaker)}
        >
        <div className="flex items-center space-x-2 flex-shrink-0">
          {item.type === 'voice' ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/img/avatar.png" alt="角色" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
              <Icon
                icon={item.icon}
                className="w-4 h-4 text-white"
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2" style={{ flex: '0 1 70px', minWidth: '70px', marginLeft: '4px' }}>
          <div className="flex items-center" style={{ overflow: 'hidden', width: '100%' }}>
            <Tooltip title={displaySpeaker}>
              <span
                className="text-sm font-medium truncate inline-block w-full"
                style={{
                  color: item.itemType === 1 ? '#3E83F6' : '#1F2937'
                }}
              >
                {displaySpeaker}
              </span>
            </Tooltip>
          </div>
          {item.type === 'voice' && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                ref={displaySelectRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '24px',
                  height: '24px',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 10
                }}
                onChange={(e) => {
                  const voiceId = e.target.value;
                  const selectedVoice = configuredVoices.find(v => v.voiceId === voiceId);
                  // 立即更新前端显示的角色名称
                  if (selectedVoice) {
                    setDisplaySpeaker(selectedVoice.displayName);
                  }
                  // 异步请求后端绑定音色
                  onVoiceSelect?.(item.id, voiceId);
                  // 重置select，防止相同选项无法再次触发change
                  setTimeout(() => {
                    if (displaySelectRef.current) {
                      displaySelectRef.current.value = '';
                    }
                  }, 0);
                }}
                onClick={(e) => {
                  // 点击时重置值，确保change事件能触发
                  if (displaySelectRef.current) {
                    displaySelectRef.current.value = '';
                  }
                  e.stopPropagation();
                }}
              >
                {configuredVoices.map((voice) => (
                  <option key={voice.voiceId} value={voice.voiceId}>
                    {voice.displayName}
                  </option>
                ))}
              </select>
              <Icon
                icon="ri:arrow-down-s-line"
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500"
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center" style={{ flex: '1 1 auto', minWidth: 0, marginLeft: '4px' }}>
          <Tooltip
            title={
              <div style={{ maxHeight: '200px', overflowY: 'auto', maxWidth: '400px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.content}
              </div>
            }
            placement="top"
            overlayStyle={{ zIndex: 1000, backgroundColor: '#ffffff' }}
            overlayInnerStyle={{ backgroundColor: '#ffffff', color: '#333333' }}
          >
            <div
              className="text-sm truncate"
              style={{ color: item.itemType === 1 ? '#3E83F6' : '#4B5563' }}
            >
              {item.content}
            </div>
          </Tooltip>
        </div>
        <div className="flex-1 flex items-center"></div>
        <div className="flex items-center space-x-2" style={{ width: '150px', minWidth: '150px', flexShrink: 0 }}>
          {editingTimeId === item.id ? (
            <div className="flex items-center space-x-1">
              <TimeRangeInput
                startMinutes={editingStartMinutes}
                startSeconds={editingStartSeconds}
                endMinutes={editingEndMinutes}
                endSeconds={editingEndSeconds}
                onStartMinutesChange={onEditingStartMinutesChange}
                onStartSecondsChange={onEditingStartSecondsChange}
                onEndMinutesChange={onEditingEndMinutesChange}
                onEndSecondsChange={onEditingEndSecondsChange}
              />
              <button
                onClick={() => onSaveTimeEdit?.(item.id)}
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
            <div className="text-xs text-gray-400">
              <span>{item.timeRange}</span>
            </div>
          )}
          <Tooltip title="播放音频">
            <Icon
              icon="ri:play-circle-line"
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500"
              onClick={() => onPlayAudio?.(item.id)}
            />
          </Tooltip>
          <div {...listeners} className="cursor-move">
            <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400 cursor-grab" />
          </div>
          <Tooltip title="删除">
            <Icon
              icon="ri:delete-bin-line"
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
              onClick={() => onShowDeleteConfirm?.(parseInt(item.id))}
            />
          </Tooltip>
        </div>
      </div>
      )}
    </div>
  );
}
