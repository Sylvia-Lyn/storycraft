import React from 'react';
import { Icon } from '@iconify/react';
import { ImageItemProps } from '../types';
import { TimeRangeInput } from '../Common/TimeRangeInput';

export function ImageItemComponent({
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
