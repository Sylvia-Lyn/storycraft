import { Icon } from '@iconify/react'
import Navigation from './Navigation'
import { useAppState } from '../hooks/useAppState'
import { useState, useEffect, useRef } from 'react'
import InputSection from './InputSection'
import ResultsSection from './ResultsSection'
// MessageSection 组件已集成到 MiddleSection 中
// 移除了 defaultPrompts 导入

// 导入自定义 hooks
import { useOptimizationResults } from '../hooks/useOptimizationResults'
import { useMessageManagement } from '../hooks/useMessageManagement'
import { useInputSuggestions } from '../hooks/useInputSuggestions'
import { useAutoComplete } from '../hooks/useAutoComplete'
import { useDraftContent } from '../hooks/useDraftContent'
// 移除了 usePresetPrompts 导入

// 预定义的一些常见建议模板
const suggestionTemplates = {
  '角色': [
    '让角色性格更加鲜明，增加以下特点...',
    '调整角色之间的关系，使冲突更加明显',
    '增加角色的成长弧线，从内向变得更加自信'
  ],
  '情节': [
    '增加一个意外转折，让主角面临更大的挑战',
    '调整情节节奏，使高潮部分更加紧凑',
    '增加一些伏笔，为后续发展做铺垫'
  ],
  '对白': [
    '让对白更加简练，突出角色个性',
    '增加潜台词，让对白层次更加丰富',
    '调整对白节奏，增加停顿和交锋'
  ],
  '场景': [
    '增加场景描写，突出氛围和情绪',
    '调整场景转换，使故事流程更加流畅',
    '在关键场景增加象征性元素'
  ]
};

// 通用建议，当没有匹配到特定关键词时使用
const generalSuggestions = [
  '剧情节奏太慢，希望更加紧凑',
  '角色动机不够清晰，需要调整',
  '故事缺乏高潮，需要增加戏剧冲突'
];

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
    
    // 消息相关
    messages: initialMessages,
    setMessages: setAppMessages,
  } = useAppState();
  
  // 基础状态
  const [feedbackText, setFeedbackText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  
  // 工作模式
  // 移除了工作模式状态
  
  // 快速响应
  const [quickResponses] = useState<Array<{id: string, text: string}>>([
    { id: "q1", text: "1. 建议让角色动机更加明确，增加角色内心的矛盾和挣扎，使角色更加立体。" },
    { id: "q2", text: "2. 情节可以更加紧凑，节奏感更强，增加一些意外转折来提高读者兴趣。" },
    { id: "q3", text: "3. 考虑增加更多环境描写和细节，让读者能够更好地沉浸在故事世界中。" }
  ]);
  
  // 使用自定义 hooks
  const {
    previousDraftContent,
    currentDraftContent,
    clearDraftContent
  } = useDraftContent();
  
  const {
    isGenerating,
    optimizationResults,
    setOptimizationResults,
    resultsContainerRef,
    applyOptimizedText,
    copyToClipboard,
    generateOptimizedContent,
    generateQuickContent
  } = useOptimizationResults();
  
  const {
    messages,
    editingMessageIndex,
    editingMessageText,
    setEditingMessageText,
    regeneratingMessageIndex,
    startEditingMessage,
    saveEditedMessage,
    cancelEditingMessage,
    deleteMessage,
    clearHistory
  } = useMessageManagement(initialMessages, generateOptimizedContent);
  
  const {
    inputSuggestions,
    showSuggestions,
    setShowSuggestions,
    suggestionCategory,
    getQuickPhrases,
    selectSuggestion,
    analyzeFeedbackForSuggestions
  } = useInputSuggestions(suggestionTemplates, generalSuggestions);
  
  const {
    recentInputs,
    showAutoComplete,
    setShowAutoComplete,
    autoCompleteText,
    updateRecentInputs,
    acceptAutoComplete,
    checkAutoComplete
  } = useAutoComplete();
  
  // 监听输入变化，生成建议
  useEffect(() => {
    analyzeFeedbackForSuggestions(feedbackText);
  }, [feedbackText, analyzeFeedbackForSuggestions]);
  
  // 自动完成功能
  useEffect(() => {
    checkAutoComplete(feedbackText);
  }, [feedbackText, checkAutoComplete]);
  
  // 使用useEffect监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 监听Command+C/V，不做特殊处理，让浏览器默认行为生效
      
      // 当按下Escape键时，如果有结果显示，则返回输入状态
      if (e.key === 'Escape' && optimizationResults.length > 0) {
        // 清空优化结果
        setOptimizationResults([]);
      }
      
      // 选择结果的快捷键 (1-3)
      if (optimizationResults.length > 0 && ['1', '2', '3'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (optimizationResults[index]) {
          applyOptimizedText(optimizationResults[index].text);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [optimizationResults, applyOptimizedText]);
  
  // 当结果变化时，确保结果区域可以被选择和复制
  useEffect(() => {
    if (optimizationResults.length > 0 && resultsContainerRef.current) {
      // 确保结果区域可以接收焦点
      resultsContainerRef.current.focus();
    } else if (inputRef.current) {
      // 当没有结果时，聚焦到输入框
      inputRef.current.focus();
    }
  }, [optimizationResults.length, resultsContainerRef]);
  
  // 重新生成AI回复的包裹函数
  const regenerateAIMessageWrapper = (index: number) => {
    // 直接使用消息管理hook中的方法
    if (messages[index] && !messages[index].isUser) {
      // 找到前一条用户消息作为提示
      let userPrompt = "";
      for (let i = index - 1; i >= 0; i--) {
        if (messages[i].isUser) {
          userPrompt = messages[i].text;
          break;
        }
      }
      
      // 生成新的回复
      generateOptimizedContent(
        userPrompt,
        previousDraftContent,
        currentDraftContent,
        quickResponses,
        updateRecentInputs,
        true,
        0
      );
    }
  };
  
  // 选择建议的包装函数
  const selectSuggestionWrapper = (suggestion: string) => {
    selectSuggestion(suggestion, setFeedbackText, inputRef);
  };
  
  // 接受自动完成的包装函数
  const acceptAutoCompleteWrapper = () => {
    acceptAutoComplete(setFeedbackText, inputRef);
  };
  
  // 移除了使用预设Prompt的包装函数
  
  // 生成内容的包装函数
  const generateQuickContentWrapper = () => {
    generateQuickContent(
      feedbackText,
      previousDraftContent,
      currentDraftContent,
      quickResponses,
      updateRecentInputs,
      setAppMessages,
      setFeedbackText
    );
  };
  
  // 选择并应用优化结果的包装函数
  const applyOptimizedTextWrapper = (text: string) => {
    applyOptimizedText(text);
    clearDraftContent();
    setFeedbackText("");
  };
  
  // 自定义滚动条样式
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
      
      {/* 中间内容区域，调整为自动滚动区域 */}
      <div className="scrollbar-container flex-1 relative overflow-auto">
        <div className="scrollbar-overlay"></div>
        <div className="p-4 pb-20 overflow-y-auto custom-scrollbar"> {/* 增加底部内边距，为固定输入框留出空间 */}
          {/* 使用Navigation组件 */}
          <Navigation 
            tabs={tabs} 
            defaultTab={selectedTab} 
            onTabChange={setSelectedTab}
          />
          
          {/* 顶部选择器区域 - 固定模型在左，文风在右 */}
          <div className="flex items-center justify-between mb-6 mt-4">
            {/* AI模型选择区域 - 左侧固定 */}
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

            {/* 文风显示 - 右侧固定 */}
            <div className="flex items-center px-4 py-2 bg-gray-50 rounded-md">
              <span className="text-gray-700">文风: {selectedStyle}</span>
            </div>
          </div>
          
          {/* 对话消息区域 */}
          <div className="space-y-4 mb-6">
            {messages.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">对话历史</h3>
                  <button 
                    className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                    onClick={clearHistory}
                  >
                    <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                    <span>清空历史</span>
                  </button>
                </div>
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    {editingMessageIndex === index ? (
                      <div className="w-full max-w-[80%] bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <textarea
                          className="w-full p-3 focus:outline-none resize-none"
                          value={editingMessageText}
                          onChange={(e) => setEditingMessageText(e.target.value)}
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end p-2 bg-gray-50 border-t border-gray-200">
                          <button 
                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 mr-2"
                            onClick={cancelEditingMessage}
                          >
                            取消
                          </button>
                          <button 
                            className="px-3 py-1 text-xs bg-black text-white rounded-md"
                            onClick={saveEditedMessage}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`${message.isUser ? 'bg-black text-white' : 'bg-white border border-gray-200'} rounded-lg px-4 py-3 relative max-w-[80%] group`}>
                        <div className={message.isUser ? 'text-right' : ''}>
                          {message.text}
                        </div>
                        {message.isUser && (
                          <div className="absolute w-3 h-3 bg-black transform rotate-45 right-[-6px] top-1/2 -translate-y-1/2"></div>
                        )}
                        
                        {/* 消息操作按钮 */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button 
                            className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"
                            onClick={() => startEditingMessage(index)}
                            title="编辑消息"
                          >
                            <Icon icon="mdi:pencil" className="w-3 h-3" />
                          </button>
                          
                          {!message.isUser && (
                            <button 
                              className={`p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600 ${regeneratingMessageIndex === index ? 'animate-spin' : ''}`}
                              onClick={() => regenerateAIMessageWrapper(index)}
                              disabled={regeneratingMessageIndex !== null}
                              title="重新生成"
                            >
                              <Icon icon="mdi:refresh" className="w-3 h-3" />
                            </button>
                          )}
                          
                          <button 
                            className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"
                            onClick={() => deleteMessage(index)}
                            title="删除消息"
                          >
                            <Icon icon="mdi:delete" className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>暂无对话历史</p>
                <p className="text-sm mt-1">输入内容开始对话</p>
              </div>
            )}
          </div>
          
          {/* 生成内容区域 */}
          <ResultsSection
            isGenerating={isGenerating}
            selectedModel={selectedModel}
            optimizationResults={optimizationResults}
            resultsContainerRef={resultsContainerRef}
            applyOptimizedText={applyOptimizedTextWrapper}
            copyToClipboard={copyToClipboard}
          />
        </div>
      </div>
      
      {/* 底部固定输入框 */}
      <InputSection
        inputRef={inputRef}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
        isGenerating={isGenerating}

        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        suggestionCategory={suggestionCategory}
        inputSuggestions={inputSuggestions}
        getQuickPhrases={getQuickPhrases}
        selectSuggestion={selectSuggestionWrapper}
        showAutoComplete={showAutoComplete}
        setShowAutoComplete={setShowAutoComplete}
        autoCompleteText={autoCompleteText}
        acceptAutoComplete={acceptAutoCompleteWrapper}
        recentInputs={recentInputs}
        generateQuickContent={generateQuickContentWrapper}
      />
    </div>
  );
}

export default MiddleSection;
