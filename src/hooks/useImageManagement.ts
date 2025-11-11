/**
 * useImageManagement Hook
 * 图片生成和管理相关的状态和逻辑
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { ChatHistoryItem } from '../types/shortplay';
import * as shortplayService from '../services/shortplayService';
import { extractFilesFromChatHistory } from '../utils/shortplayUtils';

export const useImageManagement = () => {
  // 图片聊天记录数据
  const [imageChatHistory, setImageChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingImageHistory, setIsLoadingImageHistory] = useState(false);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  /**
   * 加载图片聊天记录
   */
  const loadImageChatHistory = useCallback(async (sceneId: number) => {
    if (!sceneId) {
      console.log('No scene selected, skipping image chat history load');
      setIsLoadingImageHistory(false);
      return;
    }

    setIsLoadingImageHistory(true);
    try {
      const result = await shortplayService.queryChatHistory({
        sceneId: sceneId.toString(),
        chatScene: 'IMAGE',
        type: 'AI_ANSWER',
        pageNum: 1,
        pageSize: 24
      });

      if (result.code === 0 && result.data) {
        setImageChatHistory(result.data.records || result.data || []);
      } else {
        console.log('LoadImageChatHistory - API returned error:', result);
        setImageChatHistory([]);
      }
    } catch (error) {
      console.error('加载图片聊天记录失败:', error);
      setImageChatHistory([]);
      toast.error('加载图片记录失败');
    } finally {
      setIsLoadingImageHistory(false);
    }
  }, []);

  /**
   * 生成图片
   */
  const handleImageGenerate = useCallback(async (sceneId: number, userInput: string) => {
    if (!userInput.trim()) {
      toast.error('请输入生成内容');
      return false;
    }

    if (!sceneId) {
      toast.error('请先选择场次');
      return false;
    }

    setIsGenerating(true);
    setGenerationStatus('正在生成图片...');

    try {
      const result = await shortplayService.generateImage(sceneId, userInput.trim());

      if (result.code === 0) {
        setGenerationStatus('生成完成！');
        await loadImageChatHistory(sceneId);
        toast.success('图片生成完成！');
        return true;
      } else {
        throw new Error(result.message || '图片生成失败');
      }
    } catch (error) {
      console.error('图片生成失败:', error);
      toast.error('图片生成失败：' + (error as Error).message);
      return false;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  }, [loadImageChatHistory]);

  /**
   * 从聊天记录中提取图片文件列表
   */
  const getImageFiles = useCallback(() => {
    return extractFilesFromChatHistory(imageChatHistory, 'IMAGE');
  }, [imageChatHistory]);

  return {
    // 状态
    imageChatHistory,
    isLoadingImageHistory,
    isGenerating,
    generationStatus,

    // Setters
    setImageChatHistory,
    setIsGenerating,
    setGenerationStatus,

    // 方法
    loadImageChatHistory,
    handleImageGenerate,
    getImageFiles
  };
};
