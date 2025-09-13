import { Icon } from '@iconify/react'
import Navigation from './Navigation'
import { useAppState } from '../hooks/useAppState'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useOptimizationResults } from '../hooks/useOptimizationResults'
import { Button, Select, message } from 'antd'
import { useI18n } from '../contexts/I18nContext'

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isUser: boolean;
  model?: string;
}

function MiddleSection() {
  const { t } = useI18n();
  const {
    selectedTab,
    setSelectedTab,
    tabs,
    selectedModel,
    selectModel,
    models,
    selectedStyle,
  } = useAppState();

  // 使用优化结果hook
  const {
    isGenerating,
    optimizationResults,
    generateOptimizedContent,
  } = useOptimizationResults();

  // 基础状态
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      content: t('editor.middleSection.systemMessage'),
      role: 'system',
      timestamp: Date.now(),
      isUser: false,
      model: selectedModel
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'continue' | 'create'>('continue');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 在组件顶部添加新的状态和 ref
  const [chatMaxHeight, setChatMaxHeight] = useState('540px');
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 添加计算对话区域最大高度的函数
  const calculateChatMaxHeight = useCallback(() => {
    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const inputAreaHeight = inputAreaRef.current.clientHeight;
      
      // 计算其他固定区域的高度（参数操作区 + AI状态区 + 边距）
      const fixedAreasHeight = 250; // 根据实际测量调整这个值
      
      // 计算对话区域可用高度
      const availableHeight = containerHeight - inputAreaHeight - fixedAreasHeight;
      
      // 设置合理的高度范围
      const minHeight = 200;
      const maxHeight = 600;
      const calculatedHeight = Math.max(minHeight, Math.min(availableHeight, maxHeight));
      
      setChatMaxHeight(`${calculatedHeight}px`);
    }
  }, []);

  // 使用 ResizeObserver 监听输入区域高度变化
  useEffect(() => {
    if (inputAreaRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        calculateChatMaxHeight();
      });
      
      resizeObserver.observe(inputAreaRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [calculateChatMaxHeight]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      calculateChatMaxHeight();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateChatMaxHeight]);

  // 监听优化结果变化
  useEffect(() => {
    if (optimizationResults.length > 0 && !isGenerating) {
      const lastMessage = messages[messages.length - 1];
      // 只有当最后一条消息是用户消息时才添加AI回复
      if (lastMessage && lastMessage.isUser) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: optimizationResults[0].text,
          role: 'assistant',
          timestamp: Date.now(),
          isUser: false,
          model: selectedModel
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    }
  }, [optimizationResults, isGenerating]);

  // 消息滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;

    // 创建用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: userInput,
      role: 'user',
      timestamp: Date.now(),
      isUser: true,
      model: selectedModel
    };

    // 更新消息列表
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    try {
      // 使用generateOptimizedContent处理对话
      await generateOptimizedContent(
        userInput,
        '', // previousDraftContent
        '', // currentDraftContent
        [], // quickResponses
        () => { }, // updateRecentInputs
        true, // showLoading
        0 // retryCount
      );
    } catch (error) {
      console.error('生成回复失败:', error);
      // 添加错误消息
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: t('editor.middleSection.generateReplyFailed'),
        role: 'assistant',
        timestamp: Date.now(),
        isUser: false,
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 清空历史记录
  const clearHistory = () => {
    if (window.confirm(t('editor.middleSection.clearHistoryConfirm'))) {
      setMessages([
        {
          id: 'system-1',
          content: t('editor.middleSection.systemMessage'),
          role: 'system',
          timestamp: Date.now(),
          isUser: false,
          model: selectedModel
        }
      ]);
    }
  };

  // 自动调整输入框高度
  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setUserInput(textarea.value);
    
    // 延迟重新计算，确保 DOM 已更新
    setTimeout(() => {
      calculateChatMaxHeight();
    }, 0);
  };

  // 处理模式切换
  const handleModeChange = (mode: 'continue' | 'create') => {
    setSelectedMode(mode);
  };

  // 处理锁定功能点击
  const handleLockedFeatureClick = () => {
    message.info('功能尚在开发中...');
  };

  return (
    <div ref={containerRef} className="w-[520px] border-r border-gray-200 bg-white flex flex-col h-full min-h-0">
      {/* 中间内容区域 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          {/* 参数操作区（两行） */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* 第一行：模型选择和模式切换 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-700 min-w-[50px]">AI模型</span>
                <Select
                  value={selectedModel}
                  onChange={(val) => selectModel(val)}
                  style={{ width: 120 }}
                  size="small"
                  className="rounded-md"
                  options={models.map(m => ({ value: m, label: m }))}
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-700 min-w-[50px]">模式</span>
                <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden">
                  <Button 
                    type={selectedMode === 'continue' ? 'primary' : 'text'} 
                    size="small"
                    onClick={() => handleModeChange('continue')}
                    className={`px-3 py-1 h-8 border-0 rounded-none text-xs ${
                      selectedMode === 'continue' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {t('editor.middleSection.continueMode')}
                  </Button>
                  <Button 
                    type={selectedMode === 'create' ? 'primary' : 'text'} 
                    size="small"
                    onClick={() => handleModeChange('create')}
                    className={`px-3 py-1 h-8 border-0 rounded-none text-xs ${
                      selectedMode === 'create' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {t('editor.middleSection.createMode')}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* 第二行：功能选项 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-700 min-w-[50px]">文风参考</span>
                <div 
                  className="relative cursor-not-allowed group"
                  onClick={handleLockedFeatureClick}
                  title="功能尚在开发中..."
                >
                  <Select 
                    defaultValue={t('editor.middleSection.styleReference')} 
                    style={{ width: 120 }} 
                    size="small" 
                    disabled
                    className="rounded-md"
                    options={[{ value: t('editor.middleSection.styleReference'), label: t('editor.middleSection.styleReference') }]} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/80 rounded-full p-1 shadow-sm">
                      <Icon icon="mdi:lock" className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    功能尚在开发中...
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-700 min-w-[50px]">提示词</span>
                <div 
                  className="relative cursor-not-allowed group"
                  onClick={handleLockedFeatureClick}
                  title="功能尚在开发中..."
                >
                  <Select 
                    defaultValue={t('editor.middleSection.prompt')} 
                    style={{ width: 120 }} 
                    size="small" 
                    disabled
                    className="rounded-md"
                    options={[{ value: t('editor.middleSection.prompt'), label: t('editor.middleSection.prompt') }]} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/80 rounded-full p-1 shadow-sm">
                      <Icon icon="mdi:lock" className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    功能尚在开发中...
                  </div>
                </div>
              </div>
              
              {/* 角色选项暂时隐藏，但保留代码 */}
              {/* <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-gray-700 min-w-[50px]">角色</span>
                <Select defaultValue={t('editor.middleSection.character')} style={{ width: 120 }} size="small" className="rounded-md" options={[{ value: t('editor.middleSection.character'), label: t('editor.middleSection.character') }]} />
              </div> */}
            </div>
          </div>

          {/* AI助手状态区域 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">AI助手</span>
                <span className="text-sm text-blue-600">{selectedModel}</span>
              </div>
              <div className="text-sm text-gray-500">
                已就绪，随时为您提供创作帮助
              </div>
            </div>
          </div>

          {/* 对话消息区域 - 使用动态计算的高度 */}
          <div className="flex flex-col min-h-0" style={{ maxHeight: chatMaxHeight }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:chat-outline" className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">{t('editor.middleSection.chatHistory')}</h3>
              </div>
              <button
                className="text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 flex items-center gap-1 px-2 py-1 rounded transition-colors duration-200"
                onClick={clearHistory}
              >
                <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                <span>{t('editor.middleSection.clearHistory')}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        message.isUser 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      } rounded-xl p-4 relative`}>
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        {!message.isUser && message.model && (
                          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
                            <Icon icon="mdi:robot" className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {t('editor.middleSection.model', { model: message.model })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm text-gray-600 ml-2">{t('editor.middleSection.aiThinking')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon icon="mdi:chat-outline" className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">{t('editor.middleSection.noChatHistory')}</p>
                  <p className="text-sm text-gray-400 mt-1">{t('editor.middleSection.startChatting')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部输入区域 - 添加 ref */}
      <div ref={inputAreaRef} className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="relative">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all duration-200">
            <textarea
              ref={textareaRef}
              placeholder={t('editor.middleSection.inputPlaceholder')}
              className="w-full rounded-xl p-4 pr-12 text-gray-700 focus:outline-none resize-none min-h-[60px] max-h-[200px] bg-transparent"
              value={userInput}
              onChange={adjustTextareaHeight}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isGenerating}
              rows={1}
            />
            <button
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                userInput.trim() && !isGenerating 
                  ? 'text-white bg-blue-500 hover:bg-blue-600 shadow-sm' 
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
              onClick={sendMessage}
              disabled={!userInput.trim() || isGenerating}
            >
              <Icon 
                icon={isGenerating ? "mdi:loading" : "mdi:send"} 
                className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiddleSection;
