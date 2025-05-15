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
    selectedStyle,
    
    // 知识库相关
    showKnowledgeDropdown,
    toggleKnowledgeDropdown,
    selectedKnowledge,
    selectKnowledge,
    knowledgeBases,
    
    // 消息相关
    messages,
  } = useAppState();
  
  // 初稿相关状态
  const [previousDraftContent, setPreviousDraftContent] = useState("");
  const [currentDraftContent, setCurrentDraftContent] = useState("");
  // const [selectedText, setSelectedText] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<Array<{id: string, text: string}>>([]);
  
  // 监听文本选择事件
  useEffect(() => {
    const handleDraftTextSelected = (event: CustomEvent) => {
      if (event.detail && event.detail.text) {
        // setSelectedText(event.detail.text);
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
    console.log("开始生成优化内容，输入:", feedbackText);
    
    // 构建上下文和提示词
    let prompt = '';
    
    // 如果有之前的内容，添加"接上文"
    if (previousDraftContent) {
      prompt += `接上文：${previousDraftContent}\n\n`;
    }
    
    // 添加当前内容
    if (currentDraftContent) {
      prompt += `当前剧情：${currentDraftContent}\n\n`;
    }
    
    // 添加用户输入
    prompt += `用户反馈：${feedbackText}\n\n`;
    
    // 添加指令
    prompt += `根据以上上下文，请提供三种不同的剧情优化方向，每个方向具有创意性和连贯性，符合角色设定和故事逻辑。`;
    
    try {
      console.log("调用DeepSeek API...");
      
      // 调用DeepSeek API
      const DEEPSEEK_API_KEY = 'sk-657e30eb77ba48e0834a0821dcd8279f';
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "你是一个专业的剧本顾问和编剧，擅长分析故事结构、角色发展并提供富有创意的剧情建议。你的回答应当简洁、具体、有创意，并且分为三个不同的选项。每个选项都应该以数字编号（1. 2. 3.）开头。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
          top_p: 0.95
        })
      });
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("DeepSeek API返回:", data);
      
      // 解析API返回的内容，提取三个建议
      const content = data.choices[0].message.content;
      
      // 解析内容，提取三个建议
      // 这里的正则表达式可能需要根据实际返回格式调整
      const suggestions = content
        .split(/\n\s*\d+[\.\)]\s+/)
        .filter((item: string) => item.trim().length > 0)
        .slice(0, 3)  // 确保只有3个结果
        .map((suggestion: string) => suggestion.trim());
      
      // 将提取的建议转换为选项格式
      const results = suggestions.map((suggestion: string, i: number) => ({
        id: String(i + 1),
        text: `${i + 1}. ${suggestion}`
      }));
      
      // 如果没有得到足够的建议，添加一些默认选项
      while (results.length < 3) {
        results.push({
          id: String(results.length + 1),
          text: `${results.length + 1}. 抱歉，我无法为您提供更多的建议。`
        });
      }
      
      console.log("格式化后的建议:", results);
      setOptimizationResults(results);
      
    } catch (error) {
      console.error('生成优化内容失败:', error);
      
      // 出错时显示一些默认选项
      const fallbackResults = [
        { id: "1", text: "1. 由于API调用失败，这是一个默认的建议选项。您可以尝试重新发送您的请求。" },
        { id: "2", text: "2. 您也可以尝试修改您的输入，使其更具体或更清晰。" },
        { id: "3", text: "3. 如果问题持续存在，可能是API密钥或连接问题，请联系技术支持。" }
      ];
      
      setOptimizationResults(fallbackResults);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 选择并应用优化结果
  const applyOptimizedText = (optimizedText: string) => {
    console.log("选择了回复:", optimizedText);
    
    // 在这里，我们不去除编号，保持原始格式
    // 触发自定义事件，通知其他组件替换文本
    const event = new CustomEvent('optimizedTextReady', {
      detail: { text: optimizedText }
    });
    window.dispatchEvent(event);
    
    // 清空当前选择和结果
    setPreviousDraftContent("");
    setCurrentDraftContent("");
    setFeedbackText("");
    setOptimizationResults([]);
    
    console.log("回复已选择");
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
      
      {/* 中间内容区域 */}
      <div className="scrollbar-container flex-1 relative overflow-auto">
        <div className="scrollbar-overlay"></div>
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {/* 使用Navigation组件 */}
          <Navigation 
            tabs={tabs} 
            defaultTab={selectedTab} 
            onTabChange={setSelectedTab}
          />
          
          {/* 顶部选择器区域 - 按照设计图排列 */}
          <div className="flex items-center gap-4 mb-6 mt-4">
            {/* AI模型选择区域 */}
            <div className="relative">
              <div 
                className="flex items-center px-4 py-2 bg-gray-100 rounded-md cursor-pointer"
                onClick={toggleModelDropdown}
              >
                <div className="flex items-center justify-center mr-2">
                  <span className="font-medium text-black">AI</span>
                </div>
                <span className="font-medium text-black">{selectedModel}</span>
                <Icon icon="mdi:chevron-down" className="ml-2 text-gray-700" />
              </div>
              
              {showModelDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-full">
                  {models.map(model => (
                    <div 
                      key={model}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedModel === model ? 'bg-gray-100' : ''}`}
                      onClick={() => selectModel(model)}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 文风显示 */}
            <div className="flex items-center px-4 py-2 bg-gray-50 rounded-md">
              <span className="text-gray-700">文风: {selectedStyle}</span>
            </div>

            {/* 知识库选择器 */}
            <div className="relative flex-1 max-w-[180px]">
              <div 
                className="flex items-center border border-gray-300 rounded-md px-4 py-2 cursor-pointer"
                onClick={toggleKnowledgeDropdown}
              >
                <span className="text-black truncate">知识库: {selectedKnowledge}</span>
                <Icon icon="mdi:chevron-down" className="ml-2 text-gray-700 flex-shrink-0" />
              </div>
              
              {showKnowledgeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-full">
                  {knowledgeBases.map(kb => (
                    <div 
                      key={kb}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedKnowledge === kb ? 'bg-gray-100' : ''}`}
                      onClick={() => selectKnowledge(kb)}
                    >
                      {kb}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 对话消息区域 */}
          <div className="space-y-4 mb-6">
            {messages.length > 0 && messages.map((message, index) => (
              <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
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
          
          {/* 生成内容区域 */}
          {isGenerating ? (
            <div className="text-center py-4 mb-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">正在使用 {selectedModel} 生成回复...</p>
            </div>
          ) : optimizationResults.length > 0 ? (
            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-500 mb-2">根据xxxxxxx, 为您提供以下内容选择：</p>
              {optimizationResults.map((option) => (
                <div 
                  key={option.id}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors overflow-hidden"
                  onClick={() => applyOptimizedText(option.text)}
                >
                  <p className="whitespace-normal break-words">{option.text}</p>
                </div>
              ))}
              <div 
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setOptimizationResults([])}
              >
                <p className="text-gray-700">点击替换。这个方向对吗？还是从xxxxxxxxxx展开？</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* 底部固定输入框 */}
      {!isGenerating && optimizationResults.length === 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="剧情不好？告诉我如何优化，如：xxxxxx"
              className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-gray-700 focus:border-black focus:ring-0 transition-colors"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && feedbackText.trim()) {
                  generateOptimizedContent();
                }
              }}
            />
            <button
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${feedbackText.trim() ? 'text-black' : 'text-gray-400'}`}
              onClick={() => {
                if (feedbackText.trim()) {
                  generateOptimizedContent();
                }
              }}
            >
              <Icon icon="mdi:send" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiddleSection; 