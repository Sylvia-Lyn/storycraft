import { useState, useEffect } from 'react';

export function useDraftContent() {
  const [previousDraftContent, setPreviousDraftContent] = useState("");
  const [currentDraftContent, setCurrentDraftContent] = useState("");

  // 监听文本选择事件
  useEffect(() => {
    const handleDraftTextSelected = (event: CustomEvent) => {
      if (event.detail && event.detail.text) {
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

  // 清空草稿内容
  const clearDraftContent = () => {
    setPreviousDraftContent("");
    setCurrentDraftContent("");
  };

  return {
    previousDraftContent,
    setPreviousDraftContent,
    currentDraftContent,
    setCurrentDraftContent,
    clearDraftContent
  };
}
