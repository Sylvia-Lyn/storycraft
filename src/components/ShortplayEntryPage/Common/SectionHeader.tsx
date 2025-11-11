import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Tooltip } from 'antd';
import { useI18n } from '../../../contexts/I18nContext';
import { SectionHeaderProps } from '../types';

export function SectionHeader({ title, subtitle, subtitleOptions, onSubtitleChange, onSubtitleEdit, onOptionsChange, onAddClick, onApplyClick, isLoading, isContentLoading, onAddSubtitleOption, onDeleteSubtitleOption }: SectionHeaderProps) {
  const { t } = useI18n();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [editingOptionValue, setEditingOptionValue] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');

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
  const handleEditComplete = async () => {
    if (editingValue.trim() && editingValue !== subtitle) {
      // 如果有专门的编辑回调，优先使用它
      if (onSubtitleEdit) {
        const success = await onSubtitleEdit(editingValue.trim());
        if (!success) {
          // 编辑失败，恢复原值
          setEditingValue(subtitle || '');
          return;
        }
      } else {
        // 否则使用通用的变更回调
        onSubtitleChange?.(editingValue.trim());
      }
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

  // 处理新增选项
  const handleAddOption = async () => {
    if (newOptionValue.trim() && onAddSubtitleOption) {
      const success = await onAddSubtitleOption(newOptionValue.trim());
      if (success) {
        setNewOptionValue('');
        setIsAddingOption(false);
      }
    }
  };

  // 处理删除选项
  const handleDeleteOption = async (optionName: string) => {
    if (onDeleteSubtitleOption) {
      await onDeleteSubtitleOption(optionName);
    }
  };

  // 处理新增选项键盘事件
  const handleAddOptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddOption();
    } else if (e.key === 'Escape') {
      setIsAddingOption(false);
      setNewOptionValue('');
    }
  };

  const actionButtonClass =
    "flex items-center space-x-1 px-1 py-0.5 text-xs text-blue-500 border border-blue-200 rounded hover:border-blue-300 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200";

  return (
    <div className="bg-white border-b border-gray-100 flex items-center" style={{ height: '64px', paddingLeft: '16px', paddingRight: '16px' }}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3 whitespace-nowrap">
          <svg width="40" height="36" viewBox="0 0 56 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 边框 */}
            <rect width="56" height="51" rx="10" fill="#3E83F6"/>
            {/* Logo内容 - 星星 */}
            <g transform="translate(28, 25.5) scale(0.7, 0.7) translate(-19, -19)">
              <path d="M34.8333 15.3109C34.7333 15.0213 34.5515 14.767 34.3098 14.5787C34.0681 14.3904 33.7769 14.2762 33.4717 14.2501L24.4625 12.9359L20.425 4.75011C20.2954 4.48241 20.0929 4.25665 19.8409 4.09868C19.5889 3.94072 19.2974 3.85693 19 3.85693C18.7026 3.85693 18.4111 3.94072 18.1591 4.09868C17.9071 4.25665 17.7047 4.48241 17.575 4.75011L13.5375 12.9201L4.52834 14.2501C4.2353 14.2918 3.9598 14.4147 3.73311 14.605C3.50642 14.7953 3.33761 15.0454 3.24584 15.3268C3.16183 15.6018 3.1543 15.8944 3.22403 16.1734C3.29377 16.4523 3.43815 16.707 3.64167 16.9101L10.1808 23.2434L8.59751 32.2368C8.54098 32.5336 8.57058 32.8404 8.6828 33.121C8.79503 33.4015 8.98519 33.6441 9.23084 33.8201C9.47027 33.9913 9.75266 34.0923 10.0463 34.1119C10.34 34.1315 10.6333 34.0688 10.8933 33.9309L19 29.7034L27.075 33.9468C27.2972 34.0721 27.5482 34.1376 27.8033 34.1368C28.1387 34.138 28.4658 34.0326 28.7375 33.8359C28.9832 33.66 29.1733 33.4174 29.2855 33.1368C29.3978 32.8563 29.4274 32.5494 29.3708 32.2526L27.7875 23.2593L34.3267 16.9259C34.5553 16.7323 34.7242 16.4777 34.8139 16.1918C34.9036 15.9059 34.9103 15.6005 34.8333 15.3109ZM25.0958 21.6443C24.9102 21.8239 24.7712 22.0462 24.6912 22.2918C24.6112 22.5374 24.5924 22.7989 24.6367 23.0534L25.7767 29.6876L19.8233 26.5209C19.5943 26.399 19.3387 26.3352 19.0792 26.3352C18.8196 26.3352 18.5641 26.399 18.335 26.5209L12.3817 29.6876L13.5217 23.0534C13.5659 22.7989 13.5472 22.5374 13.4671 22.2918C13.3871 22.0462 13.2482 21.8239 13.0625 21.6443L8.31251 16.8943L14.9783 15.9284C15.2348 15.8928 15.4787 15.7947 15.6885 15.6429C15.8983 15.4911 16.0676 15.2901 16.1817 15.0576L19 9.02511L21.9767 15.0734C22.0907 15.3059 22.2601 15.5069 22.4699 15.6587C22.6797 15.8105 22.9235 15.9086 23.18 15.9443L29.8458 16.9101L25.0958 21.6443Z" fill="white"/>
            </g>
          </svg>
          <span className="text-base font-medium text-gray-900">{title}</span>
          {(subtitle || (subtitleOptions && subtitleOptions.length === 0)) && (
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
                <div className="flex items-center space-x-2 text-sm text-gray-600 select-none" onClick={subtitleOptions ? handleArrowClick : undefined} style={{cursor: subtitleOptions ? 'pointer' : 'default'}}>
                  {isContentLoading && (
                    <Icon icon="ri:loader-4-line" className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  <span className={`${subtitle ? '' : 'text-gray-400 italic'} hover:text-blue-500`}>
                    {subtitle || t('shortplayEntry.ui.noSceneYet')}
                  </span>
                  <Tooltip title={t('shortplayEntry.scenes.selectPresetScene')}>
                    <Icon
                      icon="ri:arrow-down-s-line"
                      className={`w-4 h-4 cursor-pointer hover:text-blue-500 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      onClick={handleArrowClick}
                    />
                  </Tooltip>
                </div>
              )}

              {/* 下拉选择器 */}
              {isDropdownOpen && subtitleOptions && !isEditing && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
                  {subtitleOptions.length > 0 && subtitleOptions.map((option, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg flex items-center justify-between group"
                      title={t('shortplayEntry.scenes.clickToSelectOrEdit')}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          if (editingOptionIndex !== index) {
                            onSubtitleChange?.(option);
                            setIsDropdownOpen(false);
                          }
                        }}
                      >
                        {editingOptionIndex === index ? (
                          <input
                            type="text"
                            value={editingOptionValue}
                            onChange={(e) => setEditingOptionValue(e.target.value)}
                            onBlur={handleOptionEditComplete}
                            onKeyDown={handleOptionKeyDown}
                            className="w-full bg-transparent border-none outline-none text-sm text-gray-700 focus:bg-blue-50"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span>
                            {option}
                          </span>
                        )}
                      </div>
                      {editingOptionIndex !== index && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionDoubleClick(index, option, e as any);
                            }}
                            className="text-blue-500 hover:text-blue-600 p-0.5"
                            title={t('shortplayEntry.ui.edit')}
                          >
                            <Icon icon="ri:edit-line" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOption(option);
                            }}
                            className="text-red-500 hover:text-red-600 p-0.5"
                            title={t('shortplayEntry.buttons.delete')}
                          >
                            <Icon icon="ri:delete-bin-line" className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 新增选项区域 */}
                  {isAddingOption ? (
                    <div className={`px-3 py-2 ${subtitleOptions.length > 0 ? 'border-t border-gray-200' : ''}`}>
                      <input
                        type="text"
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        onBlur={handleAddOption}
                        onKeyDown={handleAddOptionKeyDown}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('shortplayEntry.ui.inputSceneName')}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className={`px-3 py-2 ${subtitleOptions.length > 0 ? 'border-t border-gray-200' : ''}`}>
                      <button
                        onClick={() => setIsAddingOption(true)}
                        className="w-full text-left text-sm text-blue-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                        <Icon icon="ri:add-line" className="w-4 h-4" />
                        {t('shortplayEntry.ui.addScene')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {(onAddClick || onApplyClick) && subtitleOptions && subtitleOptions.length > 0 && (
          <div className="flex items-center space-x-2">
            {onAddClick && (
              <button
                type="button"
                data-section-add-button="true"
                onClick={onAddClick}
                className={actionButtonClass}
              >
                <Icon icon="ri:add-circle-line" className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('shortplayEntry.buttons.add')}</span>
              </button>
            )}
            {onApplyClick && (
              <button
                type="button"
                onClick={onApplyClick}
                disabled={isLoading}
                className={`${actionButtonClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon icon="ri:check-line" className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('shortplayEntry.buttons.apply')}</span>
              </button>
            )}
          </div>
        )}
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
