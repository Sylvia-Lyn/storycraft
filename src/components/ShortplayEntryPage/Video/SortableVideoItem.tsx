import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableVideoItemProps } from '../types';
import { VideoItemComponent } from './VideoItemComponent';

export function SortableVideoItem({
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
