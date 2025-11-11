import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ScriptCardProps } from '../types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { apiInterceptor } from '../../../services/apiInterceptor';
import { useAuth } from '../../../contexts/AuthContext';

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
 * 脚本生成 Hook
 * 管理脚本生成相关的所有状态和函数
 */
export const useScriptGeneration = () => {
  // 获取认证信息
  const { token } = useAuth();

  // 生成状态
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // 生成状态
  const [generatedContent, setGeneratedContent] = useState<string>(''); // 生成的内容
  const [generationStatus, setGenerationStatus] = useState<string>(''); // 生成状态文本

  // 剧本卡片数据状态
  const [scriptCards, setScriptCards] = useState<ScriptCardProps[]>([]);

  // 场次内容编辑状态
  const [editingSceneItemId, setEditingSceneItemId] = useState<number | null>(null);
  const [editingSceneContent, setEditingSceneContent] = useState<string>('');
  const [editingSceneType, setEditingSceneType] = useState<number>(0); // 0: 画面, 1: 对话
  const [editingSceneRoleName, setEditingSceneRoleName] = useState<string>(''); // 角色名称
  const [editingSceneStartMinutes, setEditingSceneStartMinutes] = useState<string>('');
  const [editingSceneStartSeconds, setEditingSceneStartSeconds] = useState<string>('');
  const [editingSceneEndMinutes, setEditingSceneEndMinutes] = useState<string>('');
  const [editingSceneEndSeconds, setEditingSceneEndSeconds] = useState<string>('');

  // 删除确认状态
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  /**
   * 剧本生成
   * @param userInput 用户输入
   * @param t 翻译函数
   * @param loadSceneContent 加载场次内容函数
   * @param setScenesData 设置场次数据函数
   * @param setSceneOptions 设置场次选项函数
   * @param setSelectedScene 设置选中场次函数
   */
  const handleGenerate = async (
    userInput: string,
    t: any,
    loadSceneContent: (sceneId: number) => Promise<void>,
    setScenesData: (data: any[]) => void,
    setSceneOptions: (options: string[]) => void,
    setSelectedScene: (scene: string) => void,
    language: string = 'zh-CN'
  ) => {
    if (!userInput.trim()) {
      toast.error(t('shortplayEntry.input.description'));
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('正在创建剧本任务...');

    try {
      // 从localStorage获取token
      // token from useAuth()

      // 映射language值
      const languageMap: Record<string, string> = {
        'zh-CN': '中文',
        'en-US': '英文',
        'ja-JP': '日语',
        'ko-KR': '韩文',
      };
      const mappedLanguage = languageMap[language] || language;

      // 第一步：创建剧本生成任务
      const response = await fetch(`${STORYAI_API_BASE}/series/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
          provider: "",
          language: mappedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      console.log('剧本生成任务创建成功:', result);

      if (result.code !== 0 || !result.data?.seriesId) {
        throw new Error(result.message || '创建任务失败');
      }

      const seriesId = result.data.seriesId;
      setGenerationStatus('剧本生成中，请稍候...');

      // 第二步：轮询获取生成结果
      const pollForResult = async (): Promise<void> => {
        try {
          const detailResponse = await fetch(`${STORYAI_API_BASE}/series/detail?seriesId=${seriesId}`, {
            method: 'GET',
            headers: {
              'X-Prompt-Manager-Token': token || '',
            }
          });

          if (!detailResponse.ok) {
            throw new Error(`获取详情失败: ${detailResponse.status}`);
          }

          const detailResult = await handleApiResponse(detailResponse);
          console.log('轮询结果:', detailResult);

          if (detailResult.code === 0 && detailResult.data) {
            const { generationStatus: status, seriesContent, scenes } = detailResult.data;

            if (status === 'COMPLETED') {
              // 生成完成
              setGenerationStatus('生成完成！');
              setGeneratedContent(seriesContent || '');

              // 更新场次选项
              if (scenes && scenes.length > 0) {
                setScenesData(scenes);
                const sceneOptions = scenes.map((scene: any) => scene.sceneTitle);
                setSceneOptions(sceneOptions);
                setSelectedScene(sceneOptions[0] || '');
                // 自动加载第一个场次的内容
                if (scenes[0]?.id) {
                  loadSceneContent(scenes[0].id);
                }
              }

              setIsGenerating(false);
              toast.success('剧本生成完成！');
              return; // 清空输入
            } else if (status === 'PROCESSING') {
              // 继续轮询
              setGenerationStatus('正在生成剧本内容...');
              setTimeout(pollForResult, 3000); // 3秒后重试
            } else if (status === 'FAILED') {
              // 生成失败
              setIsGenerating(false);
              setGenerationStatus('');
              toast.error('剧本生成失败，请重试');
              console.error('剧本生成失败，状态为 FAILED');
            } else {
              // 其他状态，可能是失败
              setIsGenerating(false);
              setGenerationStatus('');
              toast.error(`生成状态异常: ${status}`);
              console.error(`生成状态异常: ${status}`);
            }
          } else {
            throw new Error(detailResult.message || '获取生成状态失败');
          }
        } catch (pollError) {
          console.error('轮询过程出错:', pollError);
          // 继续重试轮询，不立即失败
          setTimeout(pollForResult, 5000); // 5秒后重试
        }
      };

      // 开始轮询
      setTimeout(pollForResult, 2000); // 2秒后开始第一次轮询
      return userInput; // 不清空输入，等待生成完成

    } catch (error) {
      console.error(t('shortplayEntry.input.generateFailed') + ':', error);
      toast.error(t('shortplayEntry.input.generateFailed') + ': ' + (error as Error).message);
      setIsGenerating(false);
      setGenerationStatus('');
      return userInput;
    }
  };

  /**
   * 图片生成
   */
  const handleImageGenerate = async (userInput: string, sceneId: number | null, t: any) => {
    if (!userInput.trim()) {
      toast.error(t('shortplayEntry.input.description'));
      return;
    }

    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('正在生成图片...');

    try {
      // token from useAuth()

      const response = await fetch(`${STORYAI_API_BASE}/ai/image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          sceneId: sceneId.toString(),
          llmName: "",
          userMessage: userInput.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      console.log('图片生成结果:', result);

      if (result.code === 0) {
        toast.success('图片生成完成！');
        setGenerationStatus('生成完成！');
        return ''; // 清空输入
      } else {
        throw new Error(result.message || '图片生成失败');
      }
    } catch (error) {
      console.error('图片生成失败:', error);
      toast.error('图片生成失败：' + (error as Error).message);
      return userInput;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  /**
   * 音效生成
   */
  const handleBgmGenerate = async (userInput: string, t: any) => {
    if (!userInput.trim()) {
      toast.error(t('shortplayEntry.input.description'));
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('正在生成音效...');

    try {
      // token from useAuth()

      const response = await fetch(`${STORYAI_API_BASE}/ai/bgm/design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          prompt: userInput.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      console.log('音效生成结果:', result);

      if (result.code === 0) {
        toast.success('音效生成完成！');
        setGenerationStatus('生成完成！');
        return ''; // 清空输入
      } else {
        throw new Error(result.message || '音效生成失败');
      }
    } catch (error) {
      console.error('音效生成失败:', error);
      toast.error('音效生成失败：' + (error as Error).message);
      return userInput;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  /**
   * 音色生成
   */
  const handleAudioGenerate = async (userInput: string, t: any, loadAllVoices: () => Promise<void>) => {
    if (!userInput.trim()) {
      toast.error(t('shortplayEntry.input.description'));
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('正在生成音色...');

    try {
      // token from useAuth()

      const response = await fetch(`${STORYAI_API_BASE}/ai/voice/design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          prompt: userInput.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      console.log('音色生成结果:', result);

      if (result.code === 0) {
        // 生成成功，刷新音频列表
        setGenerationStatus('生成完成！');

        // 刷新音频列表（可用音色列表）
        await loadAllVoices();

        toast.success('音色生成完成！');
        return ''; // 清空输入
      } else {
        throw new Error(result.message || '音色生成失败');
      }
    } catch (error) {
      console.error('音色生成失败:', error);
      toast.error('音色生成失败：' + (error as Error).message);
      return userInput;
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  /**
   * 删除剧本卡片
   */
  const handleDeleteScriptCard = (id: string) => {
    setScriptCards(scriptCards.filter(card => card.id !== id));
  };

  /**
   * 显示删除确认
   */
  const handleShowDeleteConfirm = (id: number) => {
    setDeleteConfirmId(id);
  };

  /**
   * 确认删除
   */
  const handleConfirmDelete = async (sceneId: number | null, loadSceneContent: (sceneId: number) => Promise<void>) => {
    if (deleteConfirmId === null) return;

    try {
      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          id: deleteConfirmId
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success('删除成功！');
        // 刷新场次内容
        if (sceneId) {
          await loadSceneContent(sceneId);
        }
      } else {
        throw new Error(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败：' + (error as Error).message);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  /**
   * 取消删除
   */
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  /**
   * 剧本拖拽处理
   */
  const handleScriptDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setScriptCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * 编辑场次项
   */
  const handleEditSceneItem = (item: any) => {
    setEditingSceneItemId(item.id);
    setEditingSceneType(item.type);
    setEditingSceneContent(item.content || '');
    setEditingSceneRoleName(item.roleName || '');

    // 解析时间
    const startMinutes = Math.floor(item.startTime / 60000);
    const startSeconds = Math.floor((item.startTime % 60000) / 1000);
    const endMinutes = Math.floor(item.endTime / 60000);
    const endSeconds = Math.floor((item.endTime % 60000) / 1000);

    setEditingSceneStartMinutes(startMinutes.toString());
    setEditingSceneStartSeconds(startSeconds.toString());
    setEditingSceneEndMinutes(endMinutes.toString());
    setEditingSceneEndSeconds(endSeconds.toString());
  };

  /**
   * 保存场次项
   */
  const handleSaveSceneItem = async (sceneContent: any[], setSceneContent: (data: any[]) => void) => {
    if (editingSceneItemId === null) return;

    try {
      const startTime = (parseInt(editingSceneStartMinutes) * 60 + parseInt(editingSceneStartSeconds)) * 1000;
      const endTime = (parseInt(editingSceneEndMinutes) * 60 + parseInt(editingSceneEndSeconds)) * 1000;

      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          id: editingSceneItemId,
          type: editingSceneType,
          content: editingSceneContent,
          roleName: editingSceneRoleName,
          startTime: startTime,
          endTime: endTime
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success('更新成功！');

        // 更新本地数据
        const updatedContent = sceneContent.map(item => {
          if (item.id === editingSceneItemId) {
            return {
              ...item,
              type: editingSceneType,
              content: editingSceneContent,
              roleName: editingSceneRoleName,
              startTime: startTime,
              endTime: endTime
            };
          }
          return item;
        });
        setSceneContent(updatedContent);
      } else {
        throw new Error(result.message || '更新失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败：' + (error as Error).message);
    } finally {
      setEditingSceneItemId(null);
    }
  };

  /**
   * 取消编辑场次项
   */
  const handleCancelEditSceneItem = () => {
    setEditingSceneItemId(null);
    setEditingSceneContent('');
    setEditingSceneType(0);
    setEditingSceneRoleName('');
    setEditingSceneStartMinutes('');
    setEditingSceneStartSeconds('');
    setEditingSceneEndMinutes('');
    setEditingSceneEndSeconds('');
  };

  /**
   * 开始添加新项
   */
  const handleStartAddNewItem = () => {
    // 这里可以实现添加新项的逻辑
    console.log('开始添加新项');
  };

  /**
   * 创建新项
   */
  const handleCreateNewItem = async (type: number, sceneId: number | null, sceneContent: any[], loadSceneContent: (sceneId: number) => Promise<void>) => {
    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    try {
      // token from useAuth()

      // 计算下一个orderNum
      const orderNum = sceneContent.length + 1;

      const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          sceneId: sceneId,
          type: type,
          content: '',
          roleName: '',
          orderNum: orderNum,
          startTime: 0,
          endTime: 5000
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success('添加成功！');
        // 刷新场次内容
        await loadSceneContent(sceneId);
      } else {
        throw new Error(result.message || '添加失败');
      }
    } catch (error) {
      console.error('添加失败:', error);
      toast.error('添加失败：' + (error as Error).message);
    }
  };

  return {
    // 状态
    isGenerating,
    generatedContent,
    generationStatus,
    scriptCards,
    editingSceneItemId,
    editingSceneContent,
    editingSceneType,
    editingSceneRoleName,
    editingSceneStartMinutes,
    editingSceneStartSeconds,
    editingSceneEndMinutes,
    editingSceneEndSeconds,
    deleteConfirmId,

    // 方法
    setIsGenerating,
    setGeneratedContent,
    setGenerationStatus,
    setEditingSceneType,
    setEditingSceneContent,
    setEditingSceneRoleName,
    setEditingSceneStartMinutes,
    setEditingSceneStartSeconds,
    setEditingSceneEndMinutes,
    setEditingSceneEndSeconds,
    handleGenerate,
    handleImageGenerate,
    handleBgmGenerate,
    handleAudioGenerate,
    handleDeleteScriptCard,
    handleShowDeleteConfirm,
    handleConfirmDelete,
    handleCancelDelete,
    handleScriptDragEnd,
    handleEditSceneItem,
    handleSaveSceneItem,
    handleCancelEditSceneItem,
    handleStartAddNewItem,
    handleCreateNewItem,
  };
};
