import { useState, useRef, useCallback } from 'react';
import { useAppState } from './useAppState';
import { generateDeepSeekContent } from '../services/deepseekService';
import { generateGeminiContent } from '../services/geminiService';

interface OptimizationResult {
  id: string;
  text: string;
}

// 创建一个全局的事件总线来处理模型切换
export const modelChangeEventBus = {
  listeners: new Set<(model: string) => void>(),
  subscribe(listener: (model: string) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  notify(model: string) {
    this.listeners.forEach(listener => listener(model));
  }
};

export function useOptimizationResults() {
  const { selectedModel } = useAppState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [responseCache, setResponseCache] = useState<{ [key: string]: OptimizationResult[] }>({});
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // 使用一个独立的state来跟踪当前使用的模型
  const [currentModel, setCurrentModel] = useState(selectedModel);

  // 当selectedModel变化时，通过事件总线通知更新
  useCallback(() => {
    const unsubscribe = modelChangeEventBus.subscribe((model) => {
      console.log(`[useOptimizationResults] 收到模型切换事件: ${model}`);
      setCurrentModel(model);
    });
    return unsubscribe;
  }, [])();

  // 选择并应用优化结果
  const applyOptimizedText = useCallback((optimizedText: string) => {
    console.log("选择了回复:", optimizedText);

    // 触发自定义事件，通知其他组件替换文本
    const event = new CustomEvent('optimizedTextReady', {
      detail: { text: optimizedText }
    });
    window.dispatchEvent(event);

    // 清空结果
    setOptimizationResults([]);

    console.log("回复已选择");
  }, []);

  // 复制到剪贴板
  const copyToClipboard = useCallback((text: string) => {
    // 移除编号前缀
    const cleanText = text.replace(/^\d+\.\s+/, '');
    navigator.clipboard.writeText(cleanText)
      .then(() => {
        console.log('文本已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }, []);

  // 生成优化内容
  const generateOptimizedContent = useCallback(async (
    feedbackText: string,
    previousDraftContent: string,
    currentDraftContent: string,
    quickResponses: OptimizationResult[],
    updateRecentInputs: (input: string) => void,
    showLoading = true,
    retryCount = 0
  ) => {
    if (!feedbackText.trim()) {
      return;
    }

    // 最大重试次数
    const MAX_RETRIES = 3;

    // 检查缓存
    const cacheKey = feedbackText.trim().toLowerCase();
    if (responseCache[cacheKey]) {
      setOptimizationResults(responseCache[cacheKey]);
      setIsGenerating(false);
      return;
    }

    // 保存到最近输入
    updateRecentInputs(feedbackText);

    if (showLoading) {
      setIsGenerating(true);
    }

    console.log("[useOptimizationResults] 开始生成优化内容");
    console.log("[useOptimizationResults] 输入:", feedbackText);
    console.log("[useOptimizationResults] 当前使用的模型:", currentModel);

    // 构建上下文和提示词
    let prompt = '';

    // 如果有之前的内容，添加"接上文"
    if (previousDraftContent) {
      prompt += `接上文：${previousDraftContent}\n\n`;
    }

    // 添加当前内容
    if (currentDraftContent) {
      prompt += `当前剧情：${currentDraftContent}\n\n`;
    }

    // 添加用户输入
    prompt += `用户反馈：${feedbackText}\n\n`;

    // 添加指令
    prompt += `你是一名擅长写作的大师，请根据以上的用户要求，生成文本。直接写文本，不要添加任何解释。`;

    try {
      console.log(`[useOptimizationResults] 准备调用API，使用模型: ${currentModel}`);

      let response;
      if (currentModel === 'deepseek-r1') {
        console.log(`[useOptimizationResults] 调用DeepSeek API... 尝试 ${retryCount + 1}/${MAX_RETRIES + 1}`);
        response = await generateDeepSeekContent(prompt);
      } else if (currentModel === 'Gemini') {
        console.log(`[useOptimizationResults] 调用Gemini API... 尝试 ${retryCount + 1}/${MAX_RETRIES + 1}`);
        response = await generateGeminiContent(prompt);
      } else {
        throw new Error(`不支持的模型: ${currentModel}`);
      }

      console.log(`[useOptimizationResults] ${currentModel} API返回:`, response);

      // 解析API返回的内容
      const content = response;

      // 将响应转换为单个结果
      const result = {
        id: '1',
        text: content
      };

      // 添加到缓存
      setResponseCache(prev => ({
        ...prev,
        [cacheKey]: [result]
      }));

      // 更新结果
      setOptimizationResults([result]);

    } catch (error: any) {
      console.error('[useOptimizationResults] 生成优化内容失败:', error);

      // 重试机制
      if (retryCount < MAX_RETRIES &&
        (error.name === 'AbortError' || // 超时错误
          error.name === 'TypeError' || // 网络错误
          (error.message && error.message.includes('network')))) { // 网络相关错误

        console.log(`网络错误，将在1秒后重试 (${retryCount + 1}/${MAX_RETRIES})`);
        // 显示重试状态
        setOptimizationResults([
          { id: "retry", text: `网络连接不稳定，正在重试 (${retryCount + 1}/${MAX_RETRIES})...` }
        ]);

        // 等待一段时间后重试
        setTimeout(() => {
          generateOptimizedContent(
            feedbackText,
            previousDraftContent,
            currentDraftContent,
            quickResponses,
            updateRecentInputs,
            false,
            retryCount + 1
          );
        }, 1000 * (retryCount + 1)); // 逐次增加重试间隔

        return;
      }

      // 已经重试MAX_RETRIES次或非网络错误，显示错误信息
      const fallbackResults = [
        { id: "1", text: "1. 由于网络连接问题，无法获取建议。请检查您的网络连接后重试。" },
        { id: "2", text: "2. 您也可以刷新页面或稍后再试。" },
        { id: "3", text: "3. 如果问题持续存在，可能是API服务暂时不可用。" }
      ];

      setOptimizationResults(fallbackResults);
    } finally {
      setIsGenerating(false);
    }
  }, [responseCache, currentModel]);

  // 快速生成内容
  const generateQuickContent = useCallback((
    feedbackText: string,
    previousDraftContent: string,
    currentDraftContent: string,
    quickResponses: OptimizationResult[],
    updateRecentInputs: (input: string) => void,
    setMessages: (updater: (prev: any[]) => any[]) => void,
    setFeedbackText: (text: string) => void
  ) => {
    if (!feedbackText.trim()) {
      return;
    }

    // 首先检查缓存
    const cacheKey = feedbackText.trim().toLowerCase();
    if (responseCache[cacheKey]) {
      setOptimizationResults(responseCache[cacheKey]);
      return;
    }

    // 保存到最近输入
    updateRecentInputs(feedbackText);

    // 添加用户消息
    setMessages(prevMessages => [
      ...prevMessages,
      { text: feedbackText, isUser: true }
    ]);

    // 立即显示AI正在输入的状态
    setIsGenerating(true);

    // 延迟一小段时间模拟加载
    setTimeout(async () => {
      try {
        // 直接使用优化内容生成函数处理对话
        await generateOptimizedContent(
          feedbackText,
          previousDraftContent,
          currentDraftContent,
          quickResponses,
          updateRecentInputs,
          false,
          0
        );

        // 如果成功生成了回复
        if (optimizationResults.length > 0) {
          // 选择第一个回复作为AI回答
          const aiReply = optimizationResults[0].text.replace(/^\d+\.\s+/, '');

          // 添加AI回复消息
          setMessages(prevMessages => [
            ...prevMessages,
            { text: aiReply, isUser: false }
          ]);

          // 清空生成结果和输入
          setOptimizationResults([]);
          setFeedbackText("");
        }
      } catch (error) {
        console.error("生成AI回复失败:", error);

        // 添加错误消息
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "抱歉，生成回复时发生错误，请稍后重试。", isUser: false }
        ]);
      } finally {
        setIsGenerating(false);
      }
    }, 300);
  }, [generateOptimizedContent, optimizationResults, responseCache]);

  return {
    isGenerating,
    setIsGenerating,
    optimizationResults,
    setOptimizationResults,
    responseCache,
    setResponseCache,
    resultsContainerRef,
    applyOptimizedText,
    copyToClipboard,
    generateOptimizedContent,
    generateQuickContent
  };
}
