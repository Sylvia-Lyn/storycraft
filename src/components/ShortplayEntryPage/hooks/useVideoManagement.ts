import { useAuth } from '../../../contexts/AuthContext';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// API 基础路径
const STORYAI_API_BASE = '/storyai';

/**
 * 处理API响应，检查401未授权错误
 */
const handleApiResponse = async (response: Response) => {
  const data = await response.json();

  // 检查是否为401未授权错误
  if (data.code === 401) {
    console.log('检测到401未授权错误，触发重定向到登陆页面');
    toast.error('用户未登录，请重新登陆');
    window.location.href = '/#/app/login';
    throw new Error('用户未登录');
  }

  return data;
};

/**
 * 视频管理 Hook
 * 管理视频相关的所有状态和函数
 */
export const useVideoManagement = () => {
  const { token } = useAuth();
  // 视频数据状态
  const [videoItems, setVideoItems] = useState([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 视频聊天记录数据状态
  const [videoChatHistory, setVideoChatHistory] = useState<any[]>([]);
  const [isLoadingVideoHistory, setIsLoadingVideoHistory] = useState<boolean>(false);

  // 视频生成状态
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [videoGenerationFileId, setVideoGenerationFileId] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false);

  // 上传的图片列表（用于视频生成）
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  // 播放状态
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(75); // 进度百分比
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * 加载视频聊天记录
   * @param sceneId 场次ID
   */
  const loadVideoChatHistory = async (sceneId: number | null) => {
    if (!sceneId) {
      console.log('No scene selected, skipping video chat history load');
      setIsLoadingVideoHistory(false);
      return;
    }

    setIsLoadingVideoHistory(true);
    try {
      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/chat-history/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          sceneId: sceneId.toString(),
          chatScene: "VIDEO",
          type: "AI_ANSWER",
          pageNum: 1,
          pageSize: 24
        })
      });

      if (response.ok) {
        const result = await handleApiResponse(response);
        if (result.code === 0 && result.data) {
          setVideoChatHistory(result.data.records || result.data || []);
        } else {
          setVideoChatHistory([]);
        }
      } else {
        console.error('LoadVideoChatHistory - HTTP error:', response.status);
        setVideoChatHistory([]);
      }
    } catch (error) {
      console.error('加载视频聊天记录失败:', error);
      setVideoChatHistory([]);
    } finally {
      setIsLoadingVideoHistory(false);
    }
  };

  /**
   * 视频预览
   * @param sceneId 场次ID
   */
  const handleVideoPreview = async (sceneId: number | null) => {
    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/multimedia/video/preview?sceneId=${sceneId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        }
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success('视频预览生成成功！');
        // 可以在这里处理返回的预览视频URL
        if (result.data?.videoUrl) {
          // 打开预览视频
          window.open(result.data.videoUrl, '_blank');
        }
      } else {
        throw new Error(result.message || '视频预览生成失败');
      }
    } catch (error) {
      console.error('视频预览失败:', error);
      toast.error('视频预览失败：' + (error as Error).message);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  /**
   * 视频生成
   * @param userInput 用户输入
   * @param sceneId 场次ID
   * @param setIsGenerating 设置生成状态
   * @param setGenerationStatus 设置生成状态文本
   */
  const handleVideoGenerate = async (
    userInput: string,
    sceneId: number | null,
    setIsGenerating: (val: boolean) => void,
    setGenerationStatus: (val: string) => void
  ) => {
    if (!userInput.trim()) {
      toast.error('请输入生成内容');
      return;
    }

    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    setIsGenerating(true);
    setIsVideoGenerating(true);
    setGenerationStatus('正在生成视频...');

    try {
      // token from useAuth()

      // 构建请求参数
      const requestBody = {
        sceneId: sceneId.toString(),
        llmName: "", // 固定为空字符串
        userMessage: userInput.trim(),
        useImageGeneration: uploadedImages.length > 0,
        images: uploadedImages.map(img => img.fileId) // 使用fileId而不是fileUrl
      };

      console.log('视频生成请求参数:', requestBody);

      const response = await fetch(`${STORYAI_API_BASE}/ai/video/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`视频生成请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      console.log('视频生成响应:', result);

      if (result.code === 0 && result.data) {
        const fileId = result.data.toString();
        setVideoGenerationFileId(fileId);

        toast.success('视频生成任务已开始！');
        setGenerationStatus('视频生成中，请稍候...');

        // 开始轮询进度
        await pollVideoProgress(fileId, setIsGenerating, setGenerationStatus, sceneId);
      } else {
        throw new Error(result.message || '视频生成失败');
      }
    } catch (error) {
      console.error('视频生成失败:', error);
      toast.error('视频生成失败：' + (error as Error).message);
      setGenerationStatus('');
      setIsGenerating(false);
      setIsVideoGenerating(false);
    }
  };

  /**
   * 轮询视频生成进度
   */
  const pollVideoProgress = async (
    fileId: string,
    setIsGenerating: (val: boolean) => void,
    setGenerationStatus: (val: string) => void,
    sceneId: number | null
  ) => {
    const maxPolls = 60; // 最多轮询60次 (5分钟)
    let pollCount = 0;

    const poll = async () => {
      try {
        pollCount++;
        console.log(`轮询视频进度，第 ${pollCount} 次`, fileId);

        // token from useAuth()
        const response = await fetch(`${STORYAI_API_BASE}/ai/video/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Prompt-Manager-Token': token || '',
          },
          body: JSON.stringify({ fileId: parseInt(fileId) })
        });

        if (!response.ok) {
          throw new Error(`进度查询失败: ${response.status}`);
        }

        const result = await handleApiResponse(response);
        console.log('视频进度响应:', result);

        if (result.code === 0 && result.data) {
          const status = result.data.status;

          if (status === 'COMPLETED') {
            // 生成成功
            toast.success('视频生成完成！');
            setGenerationStatus('');
            setIsGenerating(false);
            setIsVideoGenerating(false);
            setVideoGenerationFileId(null);

            // 刷新视频聊天记录
            await loadVideoChatHistory(sceneId);
          } else if (status === 'FAILED') {
            // 生成失败
            throw new Error(result.data.errorMessage || '视频生成失败');
          } else if (status === 'PROCESSING' || status === 'PENDING') {
            // 继续轮询
            if (pollCount < maxPolls) {
              setTimeout(poll, 5000); // 5秒后再次轮询
            } else {
              throw new Error('视频生成超时，请稍后查看');
            }
          }
        } else {
          throw new Error(result.message || '无法获取视频生成进度');
        }
      } catch (error) {
        console.error('轮询视频进度失败:', error);
        toast.error('视频生成失败：' + (error as Error).message);
        setGenerationStatus('');
        setIsGenerating(false);
        setIsVideoGenerating(false);
        setVideoGenerationFileId(null);
      }
    };

    // 开始轮询
    setTimeout(poll, 2000); // 2秒后开始第一次轮询
  };

  /**
   * 视频拖拽处理
   */
  const handleVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setVideoItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * 多文件上传处理（用于视频生成）
   * @param files 文件列表
   */
  const handleMultipleFileUpload = async (files: File[]) => {
    try {
      // token from useAuth()
      const uploadedFiles: any[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${STORYAI_API_BASE}/multimedia/image/upload`, {
          method: 'POST',
          headers: {
            'X-Prompt-Manager-Token': token || '',
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`上传失败: ${response.status}`);
        }

        const result = await handleApiResponse(response);
        if (result.code === 0 && result.data) {
          uploadedFiles.push({
            fileId: result.data.attachmentId,
            fileUrl: result.data.fileUrl,
            fileName: file.name
          });
        }
      }

      setUploadedImages(prev => [...prev, ...uploadedFiles]);
      toast.success(`成功上传 ${files.length} 个文件！`);
      return uploadedFiles;
    } catch (error) {
      console.error('上传文件失败:', error);
      toast.error('上传失败：' + (error as Error).message);
      return [];
    }
  };

  /**
   * 移除已上传的图片
   */
  const handleRemoveUploadedImage = (fileId: string) => {
    setUploadedImages(prev => prev.filter(img => img.fileId !== fileId));
  };

  /**
   * 视频加载完成
   */
  const handleVideoLoaded = () => {
    console.log('Video loaded');
  };

  /**
   * 进度条拖拽移动
   */
  const handleProgressMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, newProgress)));
  };

  /**
   * 鼠标按下
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressMove(event);
  };

  /**
   * 鼠标移动
   */
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressMove(event);
    }
  };

  /**
   * 鼠标释放
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * 鼠标离开
   */
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return {
    // 状态
    videoItems,
    videoRef,
    videoChatHistory,
    isLoadingVideoHistory,
    isVideoGenerating,
    videoGenerationFileId,
    isGeneratingPreview,
    uploadedImages,
    isPlaying,
    progress,
    isDragging,

    // 方法
    setVideoItems,
    setUploadedImages,
    setIsPlaying,
    setProgress,
    loadVideoChatHistory,
    handleVideoPreview,
    handleVideoGenerate,
    handleVideoDragEnd,
    handleMultipleFileUpload,
    handleRemoveUploadedImage,
    handleVideoLoaded,
    handleProgressMove,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
