import React, { useState } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

interface PromptDisplayProps {
  type: 'character' | 'timeline' | 'event' | 'emotion' | 'relationship' | 'character-effect';
  content: string;
  onEdit?: (newContent: string) => void;
  editable?: boolean;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ 
  type, 
  content, 
  onEdit,
  editable = true 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'character':
        return '角色名称';
      case 'timeline':
        return '时间线';
      case 'event':
        return '关键事件';
      case 'emotion':
        return '情感变化';
      case 'relationship':
        return '人物关系';
      case 'character-effect':
        return '人物塑造效果';
      default:
        return '';
    }
  };

  return (
    <div className="w-full">
      {isEditing ? (
        <div className="flex flex-col w-full">
          <textarea
            className="w-full min-h-[60px] p-2 border border-gray-300 rounded text-sm"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-2 py-1 bg-black text-white text-xs rounded mr-2"
              onClick={handleSave}
            >
              保存
            </button>
            <button
              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
              onClick={handleCancel}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="whitespace-pre-wrap text-sm">{content}</div>
          {editable && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip title={`编辑${getTypeLabel()}`}>
                <IconButton size="small" onClick={handleEdit}>
                  <Icon icon="ri:edit-line" className="w-4 h-4" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptDisplay; 