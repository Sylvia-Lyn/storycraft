import React, { useState, useEffect } from 'react';
import ChapterTable from './ChapterTable';
import Navigation from './Navigation';
import { Icon } from '@iconify/react';

const ChaptersPage: React.FC = () => {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  const [selectedCharacter, setSelectedCharacter] = useState('女1');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const characterOptions = ['女一', '女二', '男一', '男二'];

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
    setIsDropdownOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.character-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="h-full">
      <div className="p-8">
        {/* 顶部导航和角色选择 */}
        <div className="flex items-center mb-6">
          <div className="flex-1">
            <Navigation 
              tabs={tabs} 
              defaultTab="章节" 
              onTabChange={(tab) => console.log(tab)}
            />
          </div>
          
          {/* 角色下拉菜单 */}
          <div className="relative ml-8 character-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-[80px] px-3 py-1 text-[14px] border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none"
            >
              <span className="text-black">{selectedCharacter}</span>
              <Icon 
                icon="ri:arrow-down-s-line" 
                className="w-4 h-4 ml-1 text-gray-500"
              />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-[80px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {characterOptions.map((character) => (
                  <button
                    key={character}
                    onClick={() => handleCharacterSelect(character)}
                    className={`w-full px-3 py-1 text-[14px] text-left hover:bg-gray-100 ${
                      selectedCharacter === character ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {character}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">章节管理</h1>
        <ChapterTable />
      </div>
    </div>
  );
};

export default ChaptersPage; 