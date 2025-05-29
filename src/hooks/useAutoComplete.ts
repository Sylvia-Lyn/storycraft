import { useState, useEffect, useCallback } from 'react';

export function useAutoComplete() {
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
  const [autoCompleteText, setAutoCompleteText] = useState<string>('');

  // 更新最近输入
  const updateRecentInputs = useCallback((input: string) => {
    if (input.trim() === '') return;
    
    // 更新最近输入列表，保持最多5项，且不重复
    setRecentInputs(prev => {
      const filtered = prev.filter(item => item !== input);
      return [input, ...filtered].slice(0, 5);
    });
  }, []);

  // 选择自动完成的文本
  const acceptAutoComplete = useCallback((
    setFeedbackText: (text: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    if (showAutoComplete && autoCompleteText) {
      setFeedbackText(autoCompleteText);
      setShowAutoComplete(false);
      
      // 聚焦输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [showAutoComplete, autoCompleteText]);

  // 检查输入是否有匹配的自动完成
  const checkAutoComplete = useCallback((feedbackText: string) => {
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
  }, [recentInputs]);

  return {
    recentInputs,
    setRecentInputs,
    showAutoComplete,
    setShowAutoComplete,
    autoCompleteText,
    setAutoCompleteText,
    updateRecentInputs,
    acceptAutoComplete,
    checkAutoComplete
  };
}
