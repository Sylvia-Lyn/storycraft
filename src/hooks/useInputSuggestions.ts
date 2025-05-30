import { useState, useCallback } from 'react';

interface SuggestionTemplates {
  [key: string]: string[];
}

export function useInputSuggestions(suggestionTemplates: SuggestionTemplates, generalSuggestions: string[]) {
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // 选择建议并填充到输入框
  const selectSuggestion = useCallback((
    suggestion: string,
    setFeedbackText: (text: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    setFeedbackText(suggestion);
    setShowSuggestions(false);
    // 聚焦输入框，以便用户可以立即按Enter发送
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 分析输入，生成建议
  const analyzeFeedbackForSuggestions = useCallback((feedbackText: string) => {
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
  }, [suggestionTemplates, generalSuggestions]);

  return {
    inputSuggestions,
    setInputSuggestions,
    showSuggestions,
    setShowSuggestions,
    suggestionCategory,
    setSuggestionCategory,
    getQuickPhrases,
    selectSuggestion,
    analyzeFeedbackForSuggestions
  };
}
