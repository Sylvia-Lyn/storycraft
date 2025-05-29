import { useState, useCallback } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

export function useMessageManagement(
  initialMessages: Message[] = [],
  generateOptimizedContent: (
    feedbackText: string,
    previousDraftContent: string,
    currentDraftContent: string,
    quickResponses: Array<{id: string, text: string}>,
    updateRecentInputs: (input: string) => void,
    showLoading: boolean,
    retryCount: number
  ) => Promise<void>
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [regeneratingMessageIndex, setRegeneratingMessageIndex] = useState<number | null>(null);

  // 开始编辑消息
  const startEditingMessage = useCallback((index: number) => {
    setEditingMessageIndex(index);
    setEditingMessageText(messages[index].text);
  }, [messages]);

  // 保存编辑的消息
  const saveEditedMessage = useCallback(() => {
    if (editingMessageIndex === null || !editingMessageText.trim()) return;
    
    setMessages(prev => prev.map((msg, i) => 
      i === editingMessageIndex 
        ? { ...msg, text: editingMessageText }
        : msg
    ));
    
    setEditingMessageIndex(null);
    setEditingMessageText("");
  }, [editingMessageIndex, editingMessageText]);

  // 取消编辑消息
  const cancelEditingMessage = useCallback(() => {
    setEditingMessageIndex(null);
    setEditingMessageText("");
  }, []);

  // 删除消息
  const deleteMessage = useCallback((index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 重新生成AI回复
  const regenerateAIMessage = useCallback(async (
    index: number,
    feedbackText: string,
    setFeedbackText: (text: string) => void,
    previousDraftContent: string,
    currentDraftContent: string,
    quickResponses: Array<{id: string, text: string}>,
    updateRecentInputs: (input: string) => void,
    setOptimizationResults: (results: Array<{id: string, text: string}>) => void
  ) => {
    if (messages[index].isUser) return; // 只能重新生成AI消息
    
    setRegeneratingMessageIndex(index);
    
    // 查找前一条用户消息作为提示
    let userPrompt = "";
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].isUser) {
        userPrompt = messages[i].text;
        break;
      }
    }
    
    if (!userPrompt) {
      // 如果找不到用户消息，使用默认提示
      userPrompt = "请继续故事发展";
    }
    
    // 保存当前的feedbackText
    const originalFeedback = feedbackText;
    setFeedbackText(userPrompt);
    
    try {
      await generateOptimizedContent(
        userPrompt,
        previousDraftContent,
        currentDraftContent,
        quickResponses,
        updateRecentInputs,
        true,
        0
      );
      
      // 等待一小段时间，确保结果已更新
      setTimeout(() => {
        // 获取当前的优化结果
        const optimizationResults = document.querySelectorAll('.optimization-result');
        if (optimizationResults.length > 0) {
          // 使用第一个结果
          const firstResult = optimizationResults[0].textContent || '';
          const cleanResult = firstResult.replace(/^\d+\.\s+/, '');
          
          // 更新消息
          setMessages(prev => prev.map((msg, i) => 
            i === index 
              ? { ...msg, text: cleanResult }
              : msg
          ));
          
          // 清空结果
          setOptimizationResults([]);
        }
      }, 500);
    } catch (error) {
      console.error("重新生成AI回复失败:", error);
    } finally {
      // 恢复原始的feedbackText
      setFeedbackText(originalFeedback);
      setRegeneratingMessageIndex(null);
    }
  }, [messages, generateOptimizedContent]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    if (window.confirm("确定要清空所有对话历史吗？此操作不可撤销。")) {
      setMessages([]);
    }
  }, []);

  return {
    messages,
    setMessages,
    editingMessageIndex,
    editingMessageText,
    setEditingMessageText,
    regeneratingMessageIndex,
    startEditingMessage,
    saveEditedMessage,
    cancelEditingMessage,
    deleteMessage,
    regenerateAIMessage,
    clearHistory
  };
}
