import React from 'react';
import { Icon } from '@iconify/react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StoryboardListProps } from '../types';
import { SortableStoryboardItem } from './SortableStoryboardItem';

export function StoryboardList({
  storyboardItems,
  isLoadingStoryboard,
  editingTimeId,
  editingStartMinutes,
  editingStartSeconds,
  editingEndMinutes,
  editingEndSeconds,
  sensors,
  onEditingStartMinutesChange,
  onEditingStartSecondsChange,
  onEditingEndMinutesChange,
  onEditingEndSecondsChange,
  onStartEditTime,
  onSaveTimeEdit,
  onCancelTimeEdit,
  onDragEnd,
  onDeleteItem,
  TimeRangeInput,
  onPreview,
  onRefreshList,
  highlightedItemId,
}: StoryboardListProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={storyboardItems.map(item => item.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {isLoadingStoryboard ? (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <Icon icon="ri:loader-4-line" className="w-4 h-4 animate-spin mr-2" />
              加载中...
            </div>
          ) : storyboardItems.length > 0 ? (
            storyboardItems.map((item, index) => (
              <SortableStoryboardItem
                key={item.id}
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
                onDeleteItem={onDeleteItem}
                TimeRangeInput={TimeRangeInput}
                onPreview={onPreview}
                onRefreshList={onRefreshList}
                isHighlighted={highlightedItemId === item.id}
              />
            ))
          ) : null}
        </div>
      </SortableContext>
    </DndContext>
  );
}
