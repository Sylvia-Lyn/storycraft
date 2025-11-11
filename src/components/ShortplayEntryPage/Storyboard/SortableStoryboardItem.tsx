import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableStoryboardItemProps } from '../types';
import { formatMillisecondsToTime } from '../utils/formatTime';
import { TimeRangeInput } from '../Common/TimeRangeInput';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../contexts/AuthContext';

const STORYAI_API_BASE = '/storyai';

export function SortableStoryboardItem({
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
  onDeleteItem,
  TimeRangeInput: TimeRangeInputComponent,
  onPreview,
  onRefreshList,
  isHighlighted,
}: SortableStoryboardItemProps) {
  const { t } = useI18n();
  const { token } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateStoryboard = async () => {
    try {
      setIsRegenerating(true);

      const response = await fetch(`${STORYAI_API_BASE}/storyboard/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          storyboardId: item.id
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await response.json();

      if (result.code === 0) {
        toast.success('分镜板重新生成成功！');
        // 刷新列表数据
        if (onRefreshList) {
          await onRefreshList();
        }
      } else {
        throw new Error(result.message || '重新生成分镜板失败');
      }
    } catch (error) {
      console.error('重新生成分镜板失败:', error);
      toast.error('重新生成分镜板失败：' + (error as Error).message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id.toString() });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    WebkitFontSmoothing: 'antialiased' as any,
    MozOsxFontSmoothing: 'grayscale' as any,
    willChange: isDragging ? 'transform' : 'auto',
    backfaceVisibility: 'hidden' as any,
    transformStyle: 'preserve-3d' as any,
    width: isDragging ? '100%' : 'auto',
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg border p-3 flex items-stretch space-x-3 min-h-[100px] transition-all ${
        isDragging ? 'shadow-lg z-10' : ''
      } ${
        isHighlighted
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200'
      }`}
    >
      {/* 序号和操作按钮列 */}
      <div className="flex flex-col justify-between items-center h-full min-w-[20px]">
        <div className="text-lg font-medium text-black">
          {index + 1}
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            title="拖拽排序"
          >
            <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400" />
          </div>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={handleRegenerateStoryboard}
            disabled={isRegenerating}
            title="重新生成分镜板"
          >
            <Icon
              icon="ri:add-circle-line"
              className={`w-4 h-4 ${isRegenerating ? 'text-gray-300 animate-spin' : 'text-gray-400'}`}
            />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => {
              onDeleteItem(item.id.toString());
            }}
          >
            <Icon icon="ri:delete-bin-line" className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* 图片/视频缩略图 */}
      <div className="w-16 bg-gray-200 flex-shrink-0 overflow-hidden relative group" style={{ aspectRatio: '9 / 16' }}>
        {item.fileUrl ? (
          // 判断是否为视频文件 (.mp4, .webm, .mov, .avi)
          /\.(mp4|webm|mov|avi)$/i.test(item.fileUrl) || /\.(mp4|webm|mov|avi)$/i.test(item.fileName || '') ? (
            <video
              src={item.fileUrl}
              className="w-full h-full object-cover cursor-pointer"
              controls
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <img
              src={item.fileUrl}
              alt={item.fileName || '分镜图片'}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              onClick={() => {
                window.open(item.fileUrl, '_blank');
              }}
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center">
            <Icon icon="ri:image-line" className="w-8 h-8 text-white" />
          </div>
        )}
        {/* 查看按钮 */}
        <button
          onClick={() => onPreview?.(item.fileUrl, item.fileName)}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
        >
          <Icon icon="ri:eye-line" className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 内容区域 - 分为上下两行 */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 上面一行：userPrompt 内容，高度自适应 */}
        <div className="flex-1 min-w-0 overflow-hidden mb-2">
          <div className="text-sm text-gray-800 leading-relaxed line-clamp-3">
            {item.userPrompt}
          </div>
        </div>

        {/* 下面一行：时间信息，固定高度底部布局，居右 */}
        <div className="h-6 flex items-center justify-end">
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
              <span>{formatMillisecondsToTime(item.startTime || 0)}</span>
              <span>-</span>
              <span>{formatMillisecondsToTime(item.endTime || 0)}</span>
              <button
                onClick={() => {
                  const startTime = formatMillisecondsToTime(item.startTime || 0);
                  const endTime = formatMillisecondsToTime(item.endTime || 0);
                  onStartEditTime(item.id, `${startTime}-${endTime}`);
                }}
                className="text-gray-400 hover:text-blue-600 ml-1 p-0 border-0 bg-transparent outline-none cursor-pointer"
              >
                <Icon icon="ri:edit-line" className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
