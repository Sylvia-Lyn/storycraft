import React from 'react';
import { Icon } from '@iconify/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useI18n } from '../../../contexts/I18nContext';
import { SortableScriptCardProps } from '../types';

export function SortableScriptCard({ item }: SortableScriptCardProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
    // 防止拖动时字体变形
    WebkitFontSmoothing: 'antialiased' as any,
    MozOsxFontSmoothing: 'grayscale' as any,
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
