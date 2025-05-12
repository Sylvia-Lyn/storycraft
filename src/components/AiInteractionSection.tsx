import { useState } from 'react'
import { Icon } from '@iconify/react'

interface AiInteractionSectionProps {
  // 必要的属性
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  userInput: string;
  setUserInput: (input: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  aiSuggestions: string[];
  inputPlaceholder?: string;
}

function AiInteractionSection({
  selectedModel,
  setSelectedModel,
  userInput,
  setUserInput,
  handleKeyDown,
  aiSuggestions,
  inputPlaceholder = "这段内容不好？点击单元格，告诉我如何优化，如：xxxxxx"
}: AiInteractionSectionProps) {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  // AI模型列表
  const models = [
    'claude35_sonnet2',
    'claude35_haiku',
    'claude37_sonnet',
    'gpt-4o',
    'gemini-pro'
  ];
  
  return (
    <div className="border-t border-gray-200 pt-4 pb-4 bg-white">
      {/* AI模型选择区域 */}
      <div className="px-6 py-2">
        <div className="relative inline-block">
          <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md cursor-pointer" onClick={() => setShowModelDropdown(!showModelDropdown)}>
            <Icon icon="mdi:robot-outline" className="text-gray-700 mr-2" />
            <span className="text-black font-medium">{selectedModel}</span>
            <Icon icon="mdi:chevron-down" className="ml-2 text-gray-500" />
          </div>
          
          {/* 模型下拉菜单 */}
          {showModelDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-full">
              {models.map(model => (
                <div 
                  key={model}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedModel === model ? 'bg-gray-100' : ''}`}
                  onClick={() => {
                    setSelectedModel(model);
                    setShowModelDropdown(false);
                  }}
                >
                  {model}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 聊天气泡 */}
      <div className="py-3 px-6">
        <div className="flex justify-end mb-4">
          <div className="bg-black text-white px-4 py-3 rounded-lg max-w-[80%] relative">
            <p>角色1和角色2在xxx发生了xxx而不是xxx</p>
            <div className="absolute w-3 h-3 bg-black transform rotate-45 right-[-6px] top-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        <div className="flex justify-start mb-4">
          <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg max-w-[80%]">
            <p className="text-sm text-gray-700">根据xxxxxxxx, 为您提供以下内容选择:</p>
          </div>
        </div>
      </div>
      
      {/* AI建议显示区域 */}
      {aiSuggestions.length > 0 && (
        <div className="px-6 py-2">
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
              <p className="text-gray-800 break-words">{suggestion}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* 输入框区域 */}
      <div className="px-6 pt-2">
        <input
          type="text"
          placeholder={inputPlaceholder}
          className="w-full border border-gray-300 rounded-lg p-4 text-gray-600"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default AiInteractionSection; 