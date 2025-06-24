import { Icon } from '@iconify/react'
import Navigation from './Navigation'
import { useAppState } from '../hooks/useAppState'
import { useState, useRef, useEffect } from 'react'
import { useOptimizationResults } from '../hooks/useOptimizationResults'
import { Button, Select } from 'antd'

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
      content: '我是 AI 助手，专注于帮助您优化剧本创作。请告诉我您需要什么帮助。',
      role: 'system',
      timestamp: Date.now(),
      isUser: false,
      model: selectedModel
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        content: "抱歉，生成回复时发生错误，请稍后重试。",
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
    if (window.confirm("确定要清空所有对话历史吗？此操作不可撤销。")) {
      setMessages([
        {
          id: 'system-1',
          content: '我是 AI 助手，专注于帮助您优化剧本创作。请告诉我您需要什么帮助。',
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
  };

  return (
    <div className="w-[520px] border-r border-gray-200 bg-white flex flex-col h-full min-h-0">
      {/* 中间内容区域 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          {/* 参数操作区（两行） */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Select defaultValue="Gemini-2.5-pro" style={{ width: 140 }} size="small" options={[{ value: 'Gemini-2.5-pro', label: 'Gemini-2.5-pro' }]} />
              <Button type="primary" size="small">续写模式</Button>
              <Button size="small">创作模式</Button>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="文风参考" style={{ width: 100 }} size="small" options={[{ value: '文风参考', label: '文风参考' }]} />
              <Select defaultValue="提示词" style={{ width: 100 }} size="small" options={[{ value: '提示词', label: '提示词' }]} />
              <Select defaultValue="角色" style={{ width: 100 }} size="small" options={[{ value: '角色', label: '角色' }]} />
            </div>
          </div>

          {/* 顶部选择器区域 */}
          <div className="flex items-center justify-between mb-6 mt-4">
            {/* AI模型选择区域 */}
            <div className="relative">
              <div
                className="flex items-center px-4 py-2 bg-gray-100 rounded-md cursor-pointer"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
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
                      onClick={() => {
                        selectModel(model);
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

          {/* 对话消息区域 - 添加固定高度和滚动控制 */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
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
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {!message.isUser && message.model && (
                          <div className="text-xs text-gray-500 mt-2">
                            模型: {message.model}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center">
                        <div className="animate-pulse flex space-x-2">
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-500">AI 正在思考...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>暂无对话历史</p>
                  <p className="text-sm mt-1">输入内容开始对话</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="relative">
          <textarea
            ref={textareaRef}
            placeholder="输入内容开始对话，按回车发送..."
            className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-gray-700 focus:border-black focus:ring-0 transition-colors resize-none min-h-[60px] max-h-[200px]"
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
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${userInput.trim() && !isGenerating ? 'text-black' : 'text-gray-400'}`}
            onClick={sendMessage}
            disabled={!userInput.trim() || isGenerating}
          >
            <Icon icon={isGenerating ? "mdi:loading" : "mdi:send"} className={isGenerating ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MiddleSection;
