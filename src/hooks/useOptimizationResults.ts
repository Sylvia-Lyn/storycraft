import { useState, useRef, useCallback } from 'react';
import { useAppState } from './useAppState';
import { useI18n } from '../contexts/I18nContext';
import { callAIWithDynamicPrompt } from '../services/dynamicPromptService';
import { getAccessToken } from '../cloudbase';
import { checkApiConnection } from '../services/apiConnectionService';

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
  const { selectedModel, selectedMode, selectedStyle } = useAppState();
  const { language } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [responseCache, setResponseCache] = useState<{ [key: string]: OptimizationResult[] }>({});
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // 跟踪进行中的请求，避免短时间内对相同输入重复调用
  const inFlightKeysRef = useRef<Set<string>>(new Set());

  // 使用一个独立的state来跟踪当前使用的模型
  const [currentModel, setCurrentModel] = useState(selectedModel || 'Gemini');  // 默认使用Gemini

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
    showLoading = true
  ) => {
    if (!feedbackText.trim()) {
      return;
    }

    // 计算缓存key（仅用于进行中去重与写入，不再读取命中）
    const cacheKey = feedbackText.trim().toLowerCase();

    // 如果相同key已有请求在进行，直接返回，避免重复触发
    if (inFlightKeysRef.current.has(cacheKey)) {
      return;
    }
    inFlightKeysRef.current.add(cacheKey);

    // 保存到最近输入
    updateRecentInputs(feedbackText);

    if (showLoading) {
      setIsGenerating(true);
    }

    console.log("[useOptimizationResults] 开始生成优化内容");
    console.log("[useOptimizationResults] 输入:", feedbackText);
    console.log("[useOptimizationResults] 当前使用的模型:", currentModel);

    // 构建输入内容（包含上下文与用户要求），交由动态模板统一处理
    let inputContent = '';

    // 获取编辑器中的内容
    const editorContent = document.querySelector('.codex-editor__redactor')?.textContent || '';
    console.log("[useOptimizationResults] 编辑器内容:", editorContent);

    if (editorContent) {
      const MAX_CONTEXT_LENGTH = 1000;
      let contextContent = editorContent;
      if (contextContent.length > MAX_CONTEXT_LENGTH) {
        contextContent = contextContent.slice(-MAX_CONTEXT_LENGTH);
        console.log(`[useOptimizationResults] 上下文内容已截取，保留最后${MAX_CONTEXT_LENGTH}个字符`);
      }
      inputContent += `已完成的上文内容：\n${contextContent}\n\n`;
    }

    inputContent += `用户要求：${feedbackText}`;

    try {
      // 如果之前有未完成的请求，先取消
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // 为本次请求创建新的AbortController
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      console.log(`[useOptimizationResults] 准备调用动态Prompt服务，使用模型: ${currentModel}`);

      // 映射模型到动态服务的配置
      const mappedModel = currentModel === 'Gemini' ? 'gemini' : 'deepseek-r1' as const;

      // 在进行API调用之前，先检查连接状态
      console.log(`[useOptimizationResults] 检查 ${currentModel} API连接状态...`);
      const connectionResult = await checkApiConnection(currentModel);
      
      if (!connectionResult.isConnected) {
        console.error(`[useOptimizationResults] ${currentModel} API连接失败:`, connectionResult.error);
        throw new Error(`无法连接到 ${currentModel} API服务: ${connectionResult.error}`);
      }
      
      console.log(`[useOptimizationResults] ${currentModel} API连接正常，开始调用服务`);

      // 获取token（允许为空）
      const token = getAccessToken() || '';

      // 组织模板替换参数：不传"首页-创作类型"，只传模式、风格与输入内容
      const replacements: { [key: string]: string } = {};
      replacements['首页-创作模式'] = selectedMode;
      replacements['首页-题材风格'] = selectedStyle;
      replacements['输入内容'] = inputContent;

      const response = await callAIWithDynamicPrompt(
        replacements,
        token,
        { model: mappedModel, language },
        { signal }
      );

      console.log(`[useOptimizationResults] ${currentModel} API返回:`, response);

      // 解析API返回的内容
      const content = response;

      // 将响应转换为单个结果
      const result = {
        id: '1',
        text: content
      };

      // 添加到缓存（仅写入，当前不读取）
      setResponseCache(prev => ({
        ...prev,
        [cacheKey]: [result]
      }));

      // 更新结果
      setOptimizationResults([result]);

    } catch (error: any) {
      console.error('[useOptimizationResults] 生成优化内容失败:', error);

      // 如果是用户主动取消，则不显示错误
      if (error?.name === 'AbortError') {
        return;
      }

      // 根据错误类型提供不同的错误信息和建议
      let errorMessage = "抱歉，无法连接到AI服务。";
      let suggestionMessage = "您也可以刷新页面或稍后再试。";
      let helpMessage = "如果问题持续存在，请检查网络连接或联系技术支持。";
      
      // 判断是否为网络连接问题
      const isNetworkError = error?.message?.includes('网络错误') || 
                            error?.message?.includes('网络连接失败') ||
                            error?.message?.includes('网络连接问题');
      
      if (isNetworkError) {
        // 网络连接问题的专门处理
        errorMessage = "🌐 网络连接失败";
        suggestionMessage = "请检查您的网络连接是否正常";
        helpMessage = "建议：1) 检查WiFi/网络设置 2) 尝试刷新页面 3) 稍后重试";
      } else if (error?.message?.includes('无法连接到')) {
        // API服务不可用的问题
        const modelMatch = error.message.match(/无法连接到\s+(\w+)/);
        if (modelMatch) {
          errorMessage = `🤖 ${modelMatch[1]} API服务暂时不可用`;
        } else {
          errorMessage = "🤖 AI服务暂时不可用";
        }
        suggestionMessage = "服务可能正在维护，请稍后重试";
        helpMessage = "如果问题持续存在，请联系技术支持";
      } else if (error?.message?.includes('API密钥')) {
        // API密钥配置问题
        errorMessage = "🔑 API密钥配置问题";
        suggestionMessage = "请检查服务配置是否正确";
        helpMessage = "请联系管理员检查API密钥配置";
      } else {
        // 其他未知错误
        errorMessage = "❌ 服务异常";
        suggestionMessage = "请稍后重试或联系技术支持";
        helpMessage = "如果问题持续存在，请联系技术支持";
      }
      
      const fallbackResults = [
        { id: "1", text: errorMessage },
        { id: "2", text: suggestionMessage },
        { id: "3", text: helpMessage }
      ];

      setOptimizationResults(fallbackResults);
    } finally {
      // 清理当前的controller
      abortControllerRef.current = null;
      setIsGenerating(false);
      // 移除进行中的key
      const key = feedbackText.trim().toLowerCase();
      inFlightKeysRef.current.delete(key);
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

    // 不再读取缓存命中

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
          false
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

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

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
    generateQuickContent,
    cancelGeneration
  };
}
