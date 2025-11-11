import React from 'react';
import { Icon } from '@iconify/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableScriptItemProps } from '../types';

export function SortableScriptItem({
  item,
  index = 0,
  editingSceneItemId,
  editingSceneType,
  editingSceneContent,
  editingSceneRoleName,
  editingSceneStartMinutes,
  editingSceneStartSeconds,
  editingSceneEndMinutes,
  editingSceneEndSeconds,
  onEditingSceneTypeChange,
  onEditingSceneContentChange,
  onEditingSceneRoleNameChange,
  onEditingSceneStartMinutesChange,
  onEditingSceneStartSecondsChange,
  onEditingSceneEndMinutesChange,
  onEditingSceneEndSecondsChange,
  onEditSceneItem,
  onSaveSceneItem,
  onCancelEditSceneItem,
  onShowDeleteConfirm,
  TimeRangeInput,
  isHighlighted,
}: SortableScriptItemProps) {
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
      className={`py-1 px-3 transition-all ${
        isDragging ? 'shadow-lg z-10' : ''
      } ${
        isHighlighted ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      {editingSceneItemId === item.id ? (
        // 编辑模式
        <div className="flex items-start space-x-3">
          {/* 左侧操作区 - 竖直排列 */}
          <div className="flex flex-col items-center justify-start pt-0.5">
            {/* 序号 */}
            <span className="text-xs text-gray-500 font-medium leading-tight">{index + 1}</span>
            {/* 拖拽手柄 */}
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              title="拖拽排序"
            >
              <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 编辑内容区 */}
          <div className="flex-1 space-y-2">
            {/* 编辑内容输入 */}
            <textarea
              value={editingSceneContent}
              onChange={(e) => onEditingSceneContentChange(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
              rows={3}
              placeholder="输入内容..."
            />

            {/* 编辑操作按钮 */}
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={onSaveSceneItem}
                className="text-green-600 hover:text-green-800 p-1 border-0 bg-transparent outline-none cursor-pointer"
              >
                <Icon icon="ri:check-line" className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEditSceneItem}
                className="text-red-600 hover:text-red-800 p-1 border-0 bg-transparent outline-none cursor-pointer"
              >
                <Icon icon="ri:close-line" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 显示模式
        <div className="flex items-start space-x-3">
          {/* 左侧操作区 - 竖直排列 */}
          <div className="flex flex-col items-center justify-start pt-0.5">
            {/* 序号 */}
            <span className="text-xs text-gray-500 font-medium leading-tight">{index + 1}</span>
            {/* 拖拽手柄 */}
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              title="拖拽排序"
            >
              <Icon icon="ri:drag-move-2-line" className="w-4 h-4 text-gray-400" />
            </div>
            {/* 删除按钮 */}
            <div title="删除">
              <Icon
                icon="ri:delete-bin-line"
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => onShowDeleteConfirm(item.id)}
              />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 cursor-pointer border border-gray-200 rounded p-2 min-h-[58px]" onClick={() => onEditSceneItem(item)}>
            <div className="text-sm line-clamp-2" style={{ color: item.type === 1 ? '#3E83F6' : '#1F2937' }}>
              {item.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
