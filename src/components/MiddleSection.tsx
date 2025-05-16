import { Icon } from '@iconify/react'
import Navigation from './Navigation'
import { useAppState } from '../hooks/useAppState'
import { useState, useEffect, useRef, useCallback } from 'react'

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
  
  // 添加引用
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 添加输入建议相关状态
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 添加自动完成相关状态
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
  const [autoCompleteText, setAutoCompleteText] = useState<string>('');
  
  // 添加缓存和快速响应相关状态
  const [responseCache, setResponseCache] = useState<{[key: string]: Array<{id: string, text: string}>}>({});
  const [quickResponses, setQuickResponses] = useState<Array<{id: string, text: string}>>([
    { id: "q1", text: "1. 建议让角色动机更加明确，增加角色内心的矛盾和挣扎，使角色更加立体。" },
    { id: "q2", text: "2. 情节可以更加紧凑，节奏感更强，增加一些意外转折来提高读者兴趣。" },
    { id: "q3", text: "3. 考虑增加更多环境描写和细节，让读者能够更好地沉浸在故事世界中。" }
  ]);
  
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
  
  // 使用useEffect监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 监听Command+C/V，不做特殊处理，让浏览器默认行为生效
      
      // 当按下Escape键时，如果有结果显示，则返回输入状态
      if (e.key === 'Escape' && optimizationResults.length > 0) {
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
  }, [optimizationResults]);
  
  // 当结果变化时，确保结果区域可以被选择和复制
  useEffect(() => {
    if (optimizationResults.length > 0 && resultsContainerRef.current) {
      // 确保结果区域可以接收焦点
      resultsContainerRef.current.focus();
    } else if (inputRef.current) {
      // 当没有结果时，聚焦到输入框
      inputRef.current.focus();
    }
  }, [optimizationResults.length]);
  
  // 监听输入变化，生成建议
  useEffect(() => {
    if (feedbackText.trim() === '') {
      setShowSuggestions(false);
      return;
    }
    
    // 分析输入内容，匹配相关建议
    const input = feedbackText.toLowerCase();
    let matchedSuggestions: string[] = [];
    let category = '';
    
    // 检查是否包含关键词，推荐相应建议
    if (input.includes('角色') || input.includes('人物') || input.includes('性格')) {
      matchedSuggestions = suggestionTemplates['角色'];
      category = '角色相关建议';
    } else if (input.includes('情节') || input.includes('剧情') || input.includes('故事')) {
      matchedSuggestions = suggestionTemplates['情节'];
      category = '情节相关建议';
    } else if (input.includes('对白') || input.includes('台词') || input.includes('说话')) {
      matchedSuggestions = suggestionTemplates['对白'];
      category = '对白相关建议';
    } else if (input.includes('场景') || input.includes('环境') || input.includes('背景')) {
      matchedSuggestions = suggestionTemplates['场景'];
      category = '场景相关建议';
    } else if (input.length > 2) {
      // 当输入超过2个字符，但没有匹配到特定模板时，显示通用建议
      matchedSuggestions = generalSuggestions;
      category = '通用建议';
    }
    
    if (matchedSuggestions.length > 0) {
      setInputSuggestions(matchedSuggestions);
      setSuggestionCategory(category);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [feedbackText]);
  
  // 添加建议分类状态
  const [suggestionCategory, setSuggestionCategory] = useState<string>('');
  
  // 根据输入内容动态生成常用快捷短语
  const getQuickPhrases = useCallback((input: string): string[] => {
    const phrases: string[] = [];
    
    // 添加一些与当前输入相关的快捷短语
    if (input.includes('角色')) {
      phrases.push('角色性格不够鲜明', '角色动机不明确', '角色缺乏成长');
    } else if (input.includes('情节')) {
      phrases.push('情节节奏太慢', '情节缺乏冲突', '情节转折不自然');
    }
    
    // 如果没有特定匹配，返回通用快捷短语
    if (phrases.length === 0 && input.length > 0) {
      return ['加强戏剧冲突', '改善节奏', '增加悬念', '优化结构'];
    }
    
    return phrases;
  }, []);
  
  // 更新最近输入
  const updateRecentInputs = useCallback((input: string) => {
    if (input.trim() === '') return;
    
    // 更新最近输入列表，保持最多5项，且不重复
    setRecentInputs(prev => {
      const filtered = prev.filter(item => item !== input);
      return [input, ...filtered].slice(0, 5);
    });
  }, []);
  
  // 自动完成功能
  useEffect(() => {
    if (feedbackText.trim() === '') {
      setShowAutoComplete(false);
      return;
    }
    
    // 检查是否有匹配的最近输入
    const matchingInput = recentInputs.find(input => 
      input.toLowerCase().startsWith(feedbackText.toLowerCase()) && 
      input.length > feedbackText.length
    );
    
    if (matchingInput) {
      setAutoCompleteText(matchingInput);
      setShowAutoComplete(true);
    } else {
      setShowAutoComplete(false);
    }
  }, [feedbackText, recentInputs]);
  
  // 选择自动完成的文本
  const acceptAutoComplete = () => {
    if (showAutoComplete && autoCompleteText) {
      setFeedbackText(autoCompleteText);
      setShowAutoComplete(false);
      
      // 聚焦输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  // 修改原有的生成函数，添加重试机制
  const generateOptimizedContent = async (showLoading = true, retryCount = 0) => {
    if (!feedbackText.trim()) {
      return;
    }
    
    // 最大重试次数
    const MAX_RETRIES = 3;
    
    // 检查缓存
    const cacheKey = feedbackText.trim().toLowerCase();
    if (responseCache[cacheKey]) {
      setOptimizationResults(responseCache[cacheKey]);
      setIsGenerating(false);
      return;
    }
    
    // 保存到最近输入
    updateRecentInputs(feedbackText);
    
    if (showLoading) {
      setIsGenerating(true);
    }
    
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
      console.log(`调用DeepSeek API... 尝试 ${retryCount + 1}/${MAX_RETRIES + 1}`);
      
      // 调用DeepSeek API
      const DEEPSEEK_API_KEY = 'sk-657e30eb77ba48e0834a0821dcd8279f';
      
      // 设置请求超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
      
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
        }),
        signal: controller.signal
      });
      
      // 清除超时
      clearTimeout(timeoutId);
      
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
      
      // 添加到缓存
      setResponseCache(prev => ({
        ...prev,
        [cacheKey]: results
      }));
      
      // 更新结果
      setOptimizationResults(results);
      
    } catch (error: any) {
      console.error('生成优化内容失败:', error);
      
      // 重试机制
      if (retryCount < MAX_RETRIES && 
          (error.name === 'AbortError' || // 超时错误
           error.name === 'TypeError' || // 网络错误
           (error.message && error.message.includes('network')))) { // 网络相关错误
        
        console.log(`网络错误，将在1秒后重试 (${retryCount + 1}/${MAX_RETRIES})`);
        // 显示重试状态
        setOptimizationResults([
          { id: "retry", text: `网络连接不稳定，正在重试 (${retryCount + 1}/${MAX_RETRIES})...` }
        ]);
        
        // 等待一段时间后重试
        setTimeout(() => {
          generateOptimizedContent(false, retryCount + 1);
        }, 1000 * (retryCount + 1)); // 逐次增加重试间隔
        
        return;
      }
      
      // 已经重试MAX_RETRIES次或非网络错误，显示错误信息
      const fallbackResults = [
        { id: "1", text: "1. 由于网络连接问题，无法获取建议。请检查您的网络连接后重试。" },
        { id: "2", text: "2. 您也可以刷新页面或稍后再试。" },
        { id: "3", text: "3. 如果问题持续存在，可能是API服务暂时不可用。" }
      ];
      
      setOptimizationResults(fallbackResults);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 快速生成内容而不等待API调用
  const generateQuickContent = useCallback(() => {
    if (!feedbackText.trim()) {
      return;
    }
    
    // 首先检查缓存
    const cacheKey = feedbackText.trim().toLowerCase();
    if (responseCache[cacheKey]) {
      setOptimizationResults(responseCache[cacheKey]);
      return;
    }
    
    // 保存到最近输入
    updateRecentInputs(feedbackText);
    
    // 立即显示快速响应
    setOptimizationResults(quickResponses);
    
    // 同时开始后台API调用
    setIsGenerating(true);
    
    // 延迟一小段时间模拟加载
    setTimeout(() => {
      // 启动实际的API调用，带重试机制
      generateOptimizedContent(false, 0);
    }, 300);
  }, [feedbackText, responseCache, quickResponses]);
  
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
  
  // 使用useCallback包装复制函数以避免不必要的渲染
  const copyToClipboard = useCallback((text: string) => {
    // 移除编号前缀
    const cleanText = text.replace(/^\d+\.\s+/, '');
    navigator.clipboard.writeText(cleanText)
      .then(() => {
        console.log('文本已复制到剪贴板');
        // 这里可以添加一个临时提示，表示复制成功
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }, []);
  
  // 选择建议并填充到输入框
  const selectSuggestion = (suggestion: string) => {
    setFeedbackText(suggestion);
    setShowSuggestions(false);
    // 聚焦输入框，以便用户可以立即按Enter发送
    if (inputRef.current) {
      inputRef.current.focus();
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
            <div 
              className="space-y-3 mb-4" 
              tabIndex={0} 
              ref={resultsContainerRef}
            >
              {optimizationResults.map((option) => (
                <div 
                  key={option.id}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors overflow-hidden relative group"
                  onClick={(e) => {
                    // 防止点击导致焦点跳转
                    e.preventDefault();
                    // 仅在双击时应用文本
                    if (e.detail === 2) {
                      applyOptimizedText(option.text);
                    }
                  }}
                  onDoubleClick={() => applyOptimizedText(option.text)}
                >
                  <div 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button 
                      className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        copyToClipboard(option.text);
                      }}
                      title="复制内容"
                      aria-label="复制内容"
                    >
                      <Icon icon="mdi:content-copy" className="w-4 h-4" />
                    </button>
                  </div>
                  <p 
                    className="whitespace-normal break-words" 
                    style={{ userSelect: 'text' }}
                  >
                    <span className="font-medium">{option.id}. </span>
                    {option.text.replace(/^\d+\.\s+/, '')}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* 底部固定输入框 - 移除条件渲染，使其始终显示 */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={isGenerating ? "正在生成内容..." : "剧情不好？告诉我如何优化，如：xxxxxx"}
            className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-gray-700 focus:border-black focus:ring-0 transition-colors"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && feedbackText.trim() && !isGenerating) {
                generateQuickContent();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
                setShowAutoComplete(false);
              } else if (e.key === 'ArrowDown' && showSuggestions) {
                // 导航到建议列表
                const suggestionElements = document.querySelectorAll('.suggestion-item');
                if (suggestionElements.length > 0) {
                  (suggestionElements[0] as HTMLElement).focus();
                }
                e.preventDefault();
              } else if (e.key === 'Tab' && showAutoComplete) {
                // 接受自动完成
                acceptAutoComplete();
                e.preventDefault();
              } else if (e.key === 'ArrowRight' && showAutoComplete) {
                // 也可以用右箭头接受自动完成
                const selStart = e.currentTarget.selectionStart;
                const selEnd = e.currentTarget.selectionEnd;
                
                // 只有当光标在最右侧时才接受自动完成
                if (selStart === selEnd && selEnd === feedbackText.length) {
                  acceptAutoComplete();
                  e.preventDefault();
                }
              }
            }}
            onFocus={() => {
              if (feedbackText.trim() !== '' && inputSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              // 延迟隐藏建议，以便用户可以点击建议
              setTimeout(() => {
                // 添加安全检查，确保元素仍然存在于DOM中
                if (e.currentTarget && document.activeElement && document.body.contains(e.currentTarget) && 
                    !e.currentTarget.contains(document.activeElement)) {
                  setShowSuggestions(false);
                  setShowAutoComplete(false);
                }
              }, 200);
            }}
            disabled={isGenerating} // 当正在生成内容时禁用输入框
          />
          <button
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${feedbackText.trim() && !isGenerating ? 'text-black' : 'text-gray-400'}`}
            onClick={() => {
              if (feedbackText.trim() && !isGenerating) {
                generateQuickContent();
              }
            }}
            disabled={isGenerating} // 当正在生成内容时禁用按钮
          >
            <Icon icon={isGenerating ? "mdi:loading" : "mdi:send"} className={isGenerating ? "animate-spin" : ""} />
          </button>
          
          {/* 输入建议下拉框 */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 flex justify-between items-center">
                <span>{suggestionCategory || '推荐建议'}</span>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowSuggestions(false)}
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                </button>
              </div>
              
              {/* 快捷短语区域 */}
              {feedbackText.length > 0 && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-1.5">快捷短语</div>
                  <div className="flex flex-wrap gap-2">
                    {getQuickPhrases(feedbackText).map((phrase, idx) => (
                      <button
                        key={idx}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 transition-colors"
                        onClick={() => selectSuggestion(phrase)}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 完整建议列表 */}
              <div className="divide-y divide-gray-50">
                {inputSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors flex items-center"
                    onClick={() => selectSuggestion(suggestion)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        selectSuggestion(suggestion);
                      } else if (e.key === 'ArrowDown') {
                        const next = document.querySelectorAll('.suggestion-item')[index + 1] as HTMLElement;
                        if (next) next.focus();
                        e.preventDefault();
                      } else if (e.key === 'ArrowUp') {
                        const prev = document.querySelectorAll('.suggestion-item')[index - 1] as HTMLElement;
                        if (prev) prev.focus();
                        else if (inputRef.current) inputRef.current.focus();
                        e.preventDefault();
                      }
                    }}
                    tabIndex={0}
                  >
                    <Icon icon="mdi:lightbulb-outline" className="mr-2 text-gray-400 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 自动完成提示 */}
          {showAutoComplete && (
            <div className="absolute left-0 right-0 top-0 pointer-events-none">
              <div className="relative pl-3 pr-10 py-3 text-gray-400">
                <span className="invisible">{feedbackText}</span>
                <span>{autoCompleteText.substring(feedbackText.length)}</span>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  Tab 补全
                </div>
              </div>
            </div>
          )}
          
          {/* 最近使用的输入 */}
          {feedbackText === '' && recentInputs.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                最近使用
              </div>
              {recentInputs.map((input, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 border-b border-gray-50 last:border-0"
                  onClick={() => selectSuggestion(input)}
                >
                  <div className="flex items-center">
                    <Icon icon="mdi:history" className="mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{input}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiddleSection; 