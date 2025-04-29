import { useState } from 'react'
import { Icon } from '@iconify/react'

// Middle Section Component
function MiddleSection() {
  const [selectedTab, setSelectedTab] = useState('剧本')
  const [optimizationText, setOptimizationText] = useState('')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showKnowledgeDropdown, setShowKnowledgeDropdown] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude35_sonnet2')
  const [selectedKnowledge, setSelectedKnowledge] = useState('xxxxxx')
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    {
      text: '角色1和角色2在xxx发生了xxx而不是xxx',
      isUser: true
    },
    {
      text: '根据xxxxxxxx，为您提供以下内容选择:',
      isUser: false
    }
  ])
  
  const models = ['claude35_sonnet2', 'claude_opus', 'gpt-4', 'gpt-4o', 'gemini-pro']
  const knowledgeBases = ['xxxxxx', 'ABC项目', '科幻小说库', '玄幻小说库', '言情小说库']
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && optimizationText.trim() !== '') {
      // 添加用户消息
      setMessages([...messages, {
        text: optimizationText,
        isUser: true
      }]);
      
      // 模拟AI回复（在实际应用中这里会调用API）
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `您的问题"${optimizationText}"已收到，我们正在处理...`,
          isUser: false
        }]);
      }, 1000);
      
      // 清空输入框
      setOptimizationText('');
    }
  };
  
  const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #000;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #333;
    }
    .scrollbar-container {
      position: relative;
    }
    .scrollbar-overlay {
      position: absolute;
      top: 0;
      right: 0;
      width: 6px;
      height: 50%;
      background-color: white;
      z-index: 5;
      pointer-events: none;
    }
  `;
  
  return (
    <div className="w-[520px] border-r border-gray-200 bg-white flex flex-col h-full">
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyle }} />
      
      <div className="scrollbar-container flex-1 relative">
        <div className="scrollbar-overlay"></div>
        <div className="p-4 h-full overflow-y-auto custom-scrollbar">
          {/* Tab Navigation - First style (buttons) */}
          <div className="flex justify-center mb-8 mt-3 hidden">
            {['大纲', '角色', '关系', '章节', '分幕', '剧本'].map(tab => (
              <button
                key={tab}
                className={`px-6 py-2 mx-1 rounded-md border text-sm ${
                  selectedTab === tab 
                    ? 'bg-black text-white' 
                    : 'border-gray-300 bg-white'
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Navigation - Second style (with connecting lines) */}
          <div className="flex justify-center items-center mb-6 mt-5 overflow-x-auto">
            {['大纲', '角色', '关系', '章节', '分幕', '剧本'].map((tab, index) => (
              <div key={tab} className="flex items-center flex-shrink-0">
                <button 
                  className={`flex items-center justify-center min-w-[54px] px-3 py-1 text-[14px] border ${
                    selectedTab === tab 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border-gray-300'
                  } rounded-md`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
                {index < 5 && (
                  <div className="w-3 h-[1px] bg-gray-300 mx-1"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <div 
                className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full cursor-pointer"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
              >
                <div className="flex items-center justify-center bg-white h-5 w-5 rounded-sm mr-2">
                  <span className="text-black text-xs font-medium">AI</span>
                </div>
                <span className="text-black">{selectedModel}</span>
                <Icon icon="ri:arrow-down-s-line" className="ml-auto text-gray-700" />
              </div>
              
              {showModelDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {models.map(model => (
                    <div 
                      key={model} 
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        setSelectedModel(model)
                        setShowModelDropdown(false)
                      }}
                    >
                      <div className="flex items-center justify-center bg-white h-5 w-5 rounded-sm mr-2">
                        <span className="text-black text-xs font-medium">AI</span>
                      </div>
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center px-3 py-2 w-20">
              <span className="text-gray-700">文风</span>
            </div>
            
            <div className="relative flex-1">
              <div 
                className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer"
                onClick={() => setShowKnowledgeDropdown(!showKnowledgeDropdown)}
              >
                <span className="text-gray-700">知识库: {selectedKnowledge}</span>
                <Icon icon="ri:arrow-down-s-line" className="ml-auto text-gray-700" />
              </div>
              
              {showKnowledgeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {knowledgeBases.map(kb => (
                    <div 
                      key={kb} 
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedKnowledge(kb)
                        setShowKnowledgeDropdown(false)
                      }}
                    >
                      {kb}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 消息区域 */}
          <div className="space-y-6 mb-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} my-6`}>
                <div className={`${message.isUser ? 'bg-black text-white' : 'bg-white border border-gray-200'} rounded-lg px-4 py-3 relative max-w-[80%]`}>
                  <div className={message.isUser ? 'text-right' : ''}>
                    {message.text}
                  </div>
                  {message.isUser && (
                    <div className="absolute w-3 h-3 bg-black transform rotate-45 right-[-6px] top-1/2 -translate-y-1/2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-4 max-h-[120px] overflow-hidden">
            <div className="flex h-full">
              <div className="font-medium mr-2 flex-shrink-0">1.</div>
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-4 max-h-[120px] overflow-hidden">
            <div className="flex h-full">
              <div className="font-medium mr-2 flex-shrink-0">2.</div>
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p className="mb-2">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-4 max-h-[120px] overflow-hidden">
            <div className="flex h-full">
              <div className="font-medium mr-2 flex-shrink-0">3.</div>
              <div className="flex-1 overflow-y-auto pr-2">
                <p>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
              </div>
            </div>
          </div>
          
          <div className="mb-5">
            <button className="rounded-lg p-4 w-full text-left hover:bg-gray-50">
              <span className="font-bold">点击替换</span>。这个方向对吗？还是从xxxxxxxxxx展开？
            </button>
          </div>
          
          <div className="mb-5">
            <input 
              type="text" 
              className="border border-gray-200 rounded-lg p-4 w-full focus:outline-none focus:ring-1 focus:ring-gray-300" 
              placeholder="剧情不好？告诉我如何优化，如：xxxxxxxx"
              value={optimizationText}
              onChange={(e) => setOptimizationText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiddleSection 