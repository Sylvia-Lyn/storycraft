import { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isUser?: boolean; // 兼容现有代码
}

// 预设 Prompt 类型定义
interface PromptDefinition {
  id: string;
  title: string;
  text: string;
  type: 'template_userInput' | 'template_selection';
}

interface AiInteractionSectionProps {
  // 必要的属性
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  userInput: string;
  setUserInput: (input: string) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  aiSuggestions?: string[];
  inputPlaceholder?: string;
  selectedText?: string; // 用户在编辑区选中的文本
}

function AiInteractionSection({
  selectedModel,
  setSelectedModel,
  userInput,
  setUserInput,
  handleKeyDown,
  aiSuggestions = [],
  inputPlaceholder = "这段内容不好？点击单元格，告诉我如何优化",
  selectedText = ""
}: AiInteractionSectionProps) {
  // 基础状态
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'optimize'>('chat');
  const [deepSeekApiKey, setDeepSeekApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState<{ id: string, content: string } | null>(null);
  const [showPresetPrompts, setShowPresetPrompts] = useState(false);
  const [editedMessageContent, setEditedMessageContent] = useState('');
  
  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // AI模型列表
  const models = [
    'deepseekr1',
  ];
  
  // 预设的 Prompt 模板
  const predefinedPrompts: PromptDefinition[] = [
    {
      id: 'character_analysis',
      title: '角色分析',
      text: '请分析以下角色的动机、性格特点和发展弧线：{selection}',
      type: 'template_selection'
    },
    {
      id: 'plot_optimization',
      title: '情节优化',
      text: '请帮我优化以下情节，使其更加紧凑、有张力：{selection}',
      type: 'template_selection'
    },
    {
      id: 'dialogue_improvement',
      title: '对话改进',
      text: '请帮我改进以下对话，使其更加自然、生动，并且更好地体现角色性格：{selection}',
      type: 'template_selection'
    },
    {
      id: 'brainstorm',
      title: '头脑风暴',
      text: '围绕"{userInput}"这个主题，请帮我进行头脑风暴，提供三个不同方向的创意点。',
      type: 'template_userInput'
    },
    {
      id: 'plot_twist',
      title: '情节转折',
      text: '请为我的故事提供一个意外的情节转折，要求合理且令人惊讶。当前故事背景：{userInput}',
      type: 'template_userInput'
    }
  ];
  
  // 初始化系统消息
  useEffect(() => {
    // 从本地存储加载 API Key
    const savedApiKey = localStorage.getItem('deepSeekApiKey');
    if (savedApiKey) {
      setDeepSeekApiKey(savedApiKey);
    }
    
    // 初始化消息列表
    setMessages([
      {
        id: 'system-1',
        content: '我是 DeepSeek AI 助手，专注于帮助您优化剧本创作。请告诉我您需要什么帮助。',
        role: 'system',
        timestamp: Date.now(),
        isUser: false
      }
    ]);
  }, []);
  
  // 消息滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingAI]);
  
  // 根据选择的模型获取输入框占位符
  const getPlaceholder = () => {
    if (isLoadingAI) {
      return "DeepSeek AI 正在思考...";
    }
    
    if (activeMode === 'chat') {
      return "输入内容开始对话，按回车发送...";
    } else {
      return "请描述如何优化剧情，按回车发送...";
    }
  };
  
  // 保存 API Key 到本地存储
  const saveApiKey = (key: string) => {
    setDeepSeekApiKey(key);
    localStorage.setItem('deepSeekApiKey', key);
    setShowApiKeyInput(false);
  };
  
  // 调用 DeepSeek API
  const callDeepSeekAPI = async (messagesPayload: any[]) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekApiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messagesPayload,
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("DeepSeek API调用失败:", error);
      throw error;
    }
  };
  
  // 触发真实 AI 响应
  const triggerRealAiResponse = async (userMessage: Message, currentMessages: Message[]) => {
    if (!deepSeekApiKey) {
      setShowApiKeyInput(true);
      return;
    }
    
    setIsLoadingAI(true);
    
    try {
      // 准备发送给 API 的消息
      const messagesPayload = currentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // 添加系统提示，根据当前模式调整
      if (activeMode === 'optimize') {
        messagesPayload.unshift({
          role: 'system',
          content: '你是一个专业的剧本顾问，专注于帮助用户优化剧情。请提供具体、创意性的建议，使剧情更加引人入胜。'
        });
      } else {
        messagesPayload.unshift({
          role: 'system',
          content: '你是一个专业的剧本创作助手，可以帮助用户解答关于剧本创作的各种问题。'
        });
      }
      
      // 调用 API
      const aiResponse = await callDeepSeekAPI(messagesPayload);
      
      // 创建 AI 回复消息
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        role: 'assistant',
        timestamp: Date.now(),
        isUser: false
      };
      
      // 更新消息列表
      setMessages([...currentMessages, aiMessage]);
    } catch (error) {
      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "抱歉，生成回复时发生错误，请稍后重试。",
        role: 'assistant',
        timestamp: Date.now(),
        isUser: false
      };
      
      setMessages([...currentMessages, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  // 发送消息
  const sendMessage = () => {
    if (!userInput.trim() || isLoadingAI) return;
    
    // 创建用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: userInput,
      role: 'user',
      timestamp: Date.now(),
      isUser: true
    };
    
    // 更新消息列表
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 清空输入框
    setUserInput('');
    
    // 触发 AI 响应
    triggerRealAiResponse(userMessage, updatedMessages);
  };
  
  // 处理键盘事件
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    
    // 如果有外部处理函数，也调用它
    if (handleKeyDown) {
      handleKeyDown(e);
    }
  };
  
  // 应用预设 Prompt
  const applyPrompt = (prompt: PromptDefinition) => {
    let finalPrompt = prompt.text;
    
    if (prompt.type === 'template_selection' && selectedText) {
      finalPrompt = finalPrompt.replace('{selection}', selectedText);
    } else if (prompt.type === 'template_userInput') {
      finalPrompt = finalPrompt.replace('{userInput}', userInput || '');
    }
    
    setUserInput(finalPrompt);
    setShowPresetPrompts(false);
    
    // 聚焦输入框
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // 开始编辑消息
  const startEditingMessage = (message: Message) => {
    setIsEditingMessage({ id: message.id, content: message.content });
    setEditedMessageContent(message.content);
  };
  
  // 保存编辑的消息
  const saveEditedMessage = () => {
    if (!isEditingMessage) return;
    
    // 找到消息在数组中的索引
    const messageIndex = messages.findIndex(msg => msg.id === isEditingMessage.id);
    if (messageIndex === -1) return;
    
    // 创建更新后的消息
    const updatedMessage = {
      ...messages[messageIndex],
      content: editedMessageContent,
      timestamp: Date.now()
    };
    
    // 截断消息列表，移除编辑点之后的所有消息
    const truncatedMessages = messages.slice(0, messageIndex + 1);
    truncatedMessages[messageIndex] = updatedMessage;
    
    // 更新消息列表
    setMessages(truncatedMessages);
    
    // 如果编辑的是用户消息，触发新的 AI 响应
    if (updatedMessage.role === 'user') {
      triggerRealAiResponse(updatedMessage, truncatedMessages);
    }
    
    // 重置编辑状态
    setIsEditingMessage(null);
    setEditedMessageContent('');
  };
  
  // 取消编辑消息
  const cancelEditingMessage = () => {
    setIsEditingMessage(null);
    setEditedMessageContent('');
  };
  
  // 删除消息
  const deleteMessage = (messageId: string) => {
    // 找到消息在数组中的索引
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    // 如果是用户消息，也删除下一条 AI 回复
    const messagesToDelete = messages[messageIndex].role === 'user' && messageIndex < messages.length - 1 ? 2 : 1;
    
    // 更新消息列表
    const updatedMessages = [
      ...messages.slice(0, messageIndex),
      ...messages.slice(messageIndex + messagesToDelete)
    ];
    
    setMessages(updatedMessages);
  };
  
  // 重新生成 AI 回复
  const regenerateAIResponse = (messageId: string) => {
    // 找到消息在数组中的索引
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'assistant') return;
    
    // 找到前一条用户消息
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }
    
    if (userMessageIndex < 0) return;
    
    // 截断消息列表，移除 AI 回复及之后的所有消息
    const truncatedMessages = messages.slice(0, messageIndex);
    
    // 更新消息列表
    setMessages(truncatedMessages);
    
    // 触发新的 AI 响应
    triggerRealAiResponse(messages[userMessageIndex], truncatedMessages);
  };
  
  // 清空历史记录
  const clearHistory = () => {
    if (window.confirm("确定要清空所有对话历史吗？此操作不可撤销。")) {
      setMessages([
        {
          id: 'system-1',
          content: '我是 DeepSeek AI 助手，专注于帮助您优化剧本创作。请告诉我您需要什么帮助。',
          role: 'system',
          timestamp: Date.now(),
          isUser: false
        }
      ]);
      setUserInput('');
      setActiveMode('chat');
      setIsEditingMessage(null);
      setEditedMessageContent('');
    }
  };
  
  // 自动调整输入框高度
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setUserInput(textarea.value);
  };
  
  return (
    <div className="flex flex-col h-full bg-white border-t border-gray-200">
      {/* 顶部工具栏 */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 模型选择 */}
          <div className="relative">
            <div 
              className="flex items-center px-3 py-2 bg-gray-100 rounded-md cursor-pointer"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
            >
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
      
          {/* 模式切换 */}
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1 text-xs rounded-full ${activeMode === 'chat' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveMode('chat')}
            >
              对话模式
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full ${activeMode === 'optimize' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveMode('optimize')}
            >
              优化模式
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* API Key 设置 */}
          <button
            className="text-xs text-gray-600 hover:text-gray-900 flex items-center"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            <Icon icon="mdi:key-outline" className="mr-1" />
            {deepSeekApiKey ? 'API Key 已设置' : '设置 API Key'}
          </button>
          
          {/* 清空历史 */}
          <button
            className="text-xs text-gray-600 hover:text-red-500 flex items-center"
            onClick={clearHistory}
          >
            <Icon icon="mdi:delete-outline" className="mr-1" />
            清空历史
          </button>
        </div>
      </div>
      
      {/* API Key 输入框 */}
      {showApiKeyInput && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="password"
              placeholder="请输入 DeepSeek API Key"
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
              value={deepSeekApiKey}
              onChange={(e) => setDeepSeekApiKey(e.target.value)}
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-r-md text-sm"
              onClick={() => saveApiKey(deepSeekApiKey)}
            >
              保存
            </button>
            </div>
          <p className="text-xs text-gray-500 mt-1">
            注意：API Key 将保存在浏览器本地存储中，仅用于演示目的。
          </p>
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {isEditingMessage && isEditingMessage.id === message.id ? (
              <div className="w-full max-w-[80%] bg-white border border-gray-300 rounded-lg overflow-hidden">
                <textarea
                  className="w-full p-3 focus:outline-none resize-none"
                  value={editedMessageContent}
                  onChange={(e) => setEditedMessageContent(e.target.value)}
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
              <div 
                className={`${
                  message.role === 'user' 
                    ? 'bg-black text-white' 
                    : message.role === 'system' 
                      ? 'bg-gray-100 border border-gray-200' 
                      : 'bg-white border border-gray-200'
                } rounded-lg px-4 py-3 relative max-w-[80%] group`}
              >
                <div className={message.role === 'user' ? 'text-right' : ''}>
                  {message.content}
                </div>
                
                {message.role === 'user' && (
                  <div className="absolute w-3 h-3 bg-black transform rotate-45 right-[-6px] top-1/2 -translate-y-1/2"></div>
                )}
                
                {/* 消息操作按钮 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {message.role !== 'system' && (
                    <>
                      <button 
                        className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"
                        onClick={() => startEditingMessage(message)}
                        title="编辑消息"
                      >
                        <Icon icon="mdi:pencil" className="w-3 h-3" />
                      </button>
                      
                      {message.role === 'assistant' && (
                        <button 
                          className={`p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600`}
                          onClick={() => regenerateAIResponse(message.id)}
                          disabled={isLoadingAI}
                          title="重新生成"
                        >
                          <Icon icon="mdi:refresh" className="w-3 h-3" />
                        </button>
                      )}
                      
                      <button 
                        className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"
                        onClick={() => deleteMessage(message.id)}
                        title="删除消息"
                      >
                        <Icon icon="mdi:delete" className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* 加载指示器 */}
        {isLoadingAI && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-[80%] flex items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="ml-3 text-sm text-gray-500">DeepSeek AI 正在思考...</span>
            </div>
          </div>
        )}
        
        {/* 用于滚动到底部的引用元素 */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 底部输入区域 */}
      <div className="px-6 py-4 border-t border-gray-200">
        {/* 预设 Prompt 按钮 */}
        <div className="flex justify-end mb-2">
          <button
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
            onClick={() => setShowPresetPrompts(!showPresetPrompts)}
          >
            <Icon icon="mdi:lightning-bolt" className="w-4 h-4" />
            <span>预设 Prompt</span>
          </button>
        </div>
        
        {/* 预设 Prompt 下拉菜单 */}
        {showPresetPrompts && (
          <div className="mb-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 flex justify-between items-center">
              <span>选择预设 Prompt</span>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowPresetPrompts(false)}
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {predefinedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors"
                  onClick={() => applyPrompt(prompt)}
                >
                  <div className="flex items-center">
                    <Icon icon="mdi:lightning-bolt" className="mr-2 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{prompt.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{prompt.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 输入框 */}
        <div className="relative">
          <textarea
            ref={textareaRef}
          placeholder={getPlaceholder()}
            className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-gray-700 focus:border-black focus:ring-0 transition-colors resize-none min-h-[60px] max-h-[200px]"
          value={userInput}
            onChange={adjustTextareaHeight}
            onKeyDown={handleInputKeyDown}
            disabled={isLoadingAI}
            rows={1}
          />
          <button
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${userInput.trim() && !isLoadingAI ? 'text-black' : 'text-gray-400'}`}
            onClick={sendMessage}
            disabled={!userInput.trim() || isLoadingAI}
          >
            <Icon icon={isLoadingAI ? "mdi:loading" : "mdi:send"} className={isLoadingAI ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiInteractionSection; 