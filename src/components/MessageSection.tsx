import { Icon } from '@iconify/react'
import { useState } from 'react'

type Message = {
  text: string;
  isUser: boolean;
}

type MessageSectionProps = {
  messages: Message[]
  editingMessageIndex: number | null
  editingMessageText: string
  setEditingMessageText: (text: string) => void
  startEditingMessage: (index: number) => void
  saveEditedMessage: () => void
  cancelEditingMessage: () => void
  regenerateAIMessage: (index: number) => void
  deleteMessage: (index: number) => void
  clearHistory: () => void
  regeneratingMessageIndex: number | null
}

function MessageSection({
  messages,
  editingMessageIndex,
  editingMessageText,
  setEditingMessageText,
  startEditingMessage,
  saveEditedMessage,
  cancelEditingMessage,
  regenerateAIMessage,
  deleteMessage,
  clearHistory,
  regeneratingMessageIndex
}: MessageSectionProps) {
  return (
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
                        onClick={() => regenerateAIMessage(index)}
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
  );
}

export default MessageSection; 