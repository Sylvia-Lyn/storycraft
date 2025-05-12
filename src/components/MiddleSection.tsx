import { Icon } from '@iconify/react'
import Navigation from './Navigation'
import { useAppState } from '../hooks/useAppState'
import { useState, useEffect } from 'react'

// Middle Section Component
function MiddleSection() {
  const {
    // 标签相关
    selectedTab,
    setSelectedTab,
    tabs,
    
    // 模型相关
    showModelDropdown,
    toggleModelDropdown,
    selectedModel,
    selectModel,
    models,
    
    // 文风相关
    showStyleDropdown,
    toggleStyleDropdown,
    selectedStyle,
    selectStyle,
    styles,
    
    // 知识库相关
    showKnowledgeDropdown,
    toggleKnowledgeDropdown,
    selectedKnowledge,
    selectKnowledge,
    knowledgeBases,
    
    // 剧情选项相关
    generatingScenarios,
    scenarioOptions,
    selectedScenario,
    selectScenario,
    generateScenarioOptions,
    
    // 消息相关
    optimizationText,
    setOptimizationText,
    messages,
    handleKeyDown
  } = useAppState();
  
  // 初稿相关状态
  const [previousDraftContent, setPreviousDraftContent] = useState("");
  const [currentDraftContent, setCurrentDraftContent] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<Array<{id: string, text: string}>>([]);
  
  // 监听文本选择事件
  useEffect(() => {
    const handleDraftTextSelected = (event: CustomEvent) => {
      if (event.detail && event.detail.text) {
        setSelectedText(event.detail.text);
        // 可能还需要获取之前的内容和当前分幕内容
        if (event.detail.previousContent) {
          setPreviousDraftContent(event.detail.previousContent);
        }
        if (event.detail.currentContent) {
          setCurrentDraftContent(event.detail.currentContent);
        }
      }
    };
    
    // 注册自定义事件监听
    window.addEventListener('draftTextSelected' as any, handleDraftTextSelected);
    
    return () => {
      window.removeEventListener('draftTextSelected' as any, handleDraftTextSelected);
    };
  }, []);
  
  // 生成优化剧情
  const generateOptimizedContent = async () => {
    if (!feedbackText.trim()) {
      return;
    }
    
    setIsGenerating(true);
    console.log("开始生成优化内容, 输入:", feedbackText);
    
    // 构建优化提示词
    let prompt = '';
    
    // 如果有之前的内容，添加"接上文"
    if (previousDraftContent) {
      prompt += `接上文：\n${previousDraftContent}\n`;
    }
    
    // 添加角色视角和基本要求
    prompt += `以「角色名称」的第二人称视角，要求符合逻辑、不能有超现实内容，并输出三种可能性的结果，继续展开以下剧情：\n`;
    
    // 如果有当前分幕剧情，添加分幕剧情
    if (currentDraftContent) {
      prompt += `${currentDraftContent}\n`;
    }
    
    // 如果有用户输入的内容，添加补充说明
    if (feedbackText) {
      prompt += `补充：${feedbackText}\n`;
    }
    
    console.log("构建的提示词:", prompt);
    
    try {
      // 调用API获取优化结果
      console.log("调用API...");
      
      // 临时使用模拟数据，因为API可能还没实现
      // 实际使用时取消注释下面的代码
      /*
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          style: selectedStyle
        }),
      });
      
      if (!response.ok) {
        throw new Error('API调用失败');
      }
      
      const data = await response.json();
      */
      
      // 模拟API响应
      const data = {
        results: [
          "这是第一个优化结果，根据你的反馈，我们调整了剧情走向...",
          "这是第二个可能的剧情发展方向，角色将面临不同的选择...",
          "第三个方案提供了完全不同的视角，让我们从另一个角度看这个故事..."
        ]
      };
      
      console.log("API返回结果:", data);
      
      // 将API返回的结果转换为选项格式
      const results = data.results.map((result: string, index: number) => ({
        id: String(index + 1),
        text: `${index + 1}. ${result}`
      }));
      
      console.log("格式化后的结果:", results);
      setOptimizationResults(results);
    } catch (error) {
      console.error('生成优化内容失败:', error);
      // 可以在这里添加错误处理，如显示错误消息
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 选择并应用优化结果
  const applyOptimizedText = (optimizedText: string) => {
    console.log("正在应用选择的优化内容:", optimizedText);
    
    // 触发自定义事件，通知其他组件替换文本
    const event = new CustomEvent('optimizedTextReady', {
      detail: { text: optimizedText }
    });
    window.dispatchEvent(event);
    
    // 添加一条用户消息，表示用户已选择
    const userMessage = {
      text: `我选择了: "${optimizedText.substring(0, 30)}..."`,
      isUser: true
    };
    
    // 更新消息列表
    // 注意: 如果messages是通过useAppState获取的，可能需要调用setMessages函数
    // setMessages([...messages, userMessage]);
    
    // 清空当前选择和结果
    setSelectedText("");
    setPreviousDraftContent("");
    setCurrentDraftContent("");
    setFeedbackText("");
    setOptimizationResults([]);
    
    console.log("优化内容已应用");
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
          {/* 使用Navigation组件 */}
          <Navigation 
            tabs={tabs} 
            defaultTab={selectedTab} 
            onTabChange={setSelectedTab}
          />
          
          {/* 模型、文风和知识库选择 */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <div 
                className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full cursor-pointer"
                onClick={toggleModelDropdown}
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
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedModel === model ? 'bg-gray-100' : ''}`}
                      onClick={() => selectModel(model)}
                    >
                      <div className="flex items-center justify-center bg-white h-5 w-5 rounded-sm mr-2">
                        <span className="text-black text-xs font-medium">AI</span>
                      </div>
                      <span>{model}</span>
                      {selectedModel === model && (
                        <Icon icon="ri:check-line" className="ml-auto text-black" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative flex-1">
              <div 
                className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full cursor-pointer"
                onClick={toggleStyleDropdown}
              >
                <span className="text-black">文风</span>
                <Icon icon="ri:arrow-down-s-line" className="ml-auto text-gray-700" />
              </div>
              
              {showStyleDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {styles.map(style => (
                    <div 
                      key={style} 
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedStyle === style ? 'bg-gray-100' : ''}`}
                      onClick={() => selectStyle(style)}
                    >
                      <span>{style}</span>
                      {selectedStyle === style && (
                        <Icon icon="ri:check-line" className="ml-auto text-black" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative flex-1">
              <div 
                className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer"
                onClick={toggleKnowledgeDropdown}
              >
                <span className="text-gray-700">知识库: xxxxxxx</span>
                <Icon icon="ri:arrow-down-s-line" className="ml-auto text-gray-700" />
              </div>
              
              {showKnowledgeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {knowledgeBases.map(kb => (
                    <div 
                      key={kb} 
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedKnowledge === kb ? 'bg-gray-100' : ''}`}
                      onClick={() => selectKnowledge(kb)}
                    >
                      <span>{kb}</span>
                      {selectedKnowledge === kb && (
                        <Icon icon="ri:check-line" className="ml-auto text-black" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 对话消息区域 */}
          <div className="space-y-6 mb-6">
            {messages.length > 0 && messages.map((message, index) => (
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
          
          {/* 剧情选项区域 */}
          {isGenerating ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">正在使用 {selectedModel} 模型和 {selectedStyle} 文风生成剧情选项...</p>
            </div>
          ) : optimizationResults.length > 0 ? (
            <div className="space-y-4 mb-6">
              {optimizationResults.map((option, index) => (
                <div 
                  key={option.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors overflow-hidden"
                  onClick={() => applyOptimizedText(option.text)}
                >
                  <p className="whitespace-normal break-words">{option.text}</p>
                </div>
              ))}
              <div 
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setOptimizationResults([])} // 清空结果，返回输入状态
              >
                <p className="text-gray-700">点击替换。这个方向对吗？还是从xxxxxxxxxx展开？</p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <input
                type="text"
                placeholder="剧情不好？告诉我如何优化，如：xxxxxx"
                className="w-full border border-gray-300 rounded-lg p-4 text-gray-500"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && feedbackText.trim()) {
                    generateOptimizedContent();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiddleSection; 