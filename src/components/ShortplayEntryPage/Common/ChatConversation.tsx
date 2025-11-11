import React from 'react';
import { Icon } from '@iconify/react';
import { useI18n } from '../../../contexts/I18nContext';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ChatConversationProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
}

export function ChatConversation({ messages, isLoading = false }: ChatConversationProps) {
  const { t } = useI18n();
  const endRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Icon icon="ri:chat-smile-line" className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('shortplayEntry.chat.noMessages') || '暂无对话'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-lg px-4 py-3 ${
              message.type === 'user'
                ? 'bg-blue-500 text-white rounded-br-none max-w-[80%]'
                : 'bg-gray-100 text-gray-800 rounded-bl-none max-w-[90%]'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap break-words overflow-auto max-h-[500px]">
              {message.content}
            </div>
            {message.timestamp && (
              <div
                className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 加载指示器 */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-3">
            <div className="flex items-center space-x-2">
              <Icon icon="ri:loader-4-line" className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('shortplayEntry.generation.generating') || '生成中...'}</span>
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
