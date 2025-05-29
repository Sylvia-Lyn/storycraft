import { useState, useCallback } from 'react';

export function usePresetPrompts(defaultPrompts: string[]) {
  const [showPresetPrompts, setShowPresetPrompts] = useState(false);
  const [presetPrompts] = useState<string[]>(defaultPrompts);

  // 使用预设Prompt
  const usePresetPrompt = useCallback((
    prompt: string,
    setFeedbackText: (text: string) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    setFeedbackText(prompt);
    setShowPresetPrompts(false);
    // 聚焦输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return {
    showPresetPrompts,
    setShowPresetPrompts,
    presetPrompts,
    usePresetPrompt
  };
}
