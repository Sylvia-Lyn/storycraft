import { useState } from 'react';
import toast from 'react-hot-toast';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
 * 图片管理 Hook
 * 管理图片和分镜板相关的所有状态和函数
 */
export const useImageManagement = () => {
  // 获取认证信息
  const { token } = useAuth();

  // 图片聊天记录数据状态
  const [imageChatHistory, setImageChatHistory] = useState<any[]>([]);
  const [isLoadingImageHistory, setIsLoadingImageHistory] = useState<boolean>(false);

  // 图片数据状态
  const [imageItems, setImageItems] = useState([]);

  // 图片分镜板数据状态
  const [storyboardItems, setStoryboardItems] = useState<any[]>([]);
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState<boolean>(false);

  // 编辑时间状态
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingStartMinutes, setEditingStartMinutes] = useState<string>('');
  const [editingStartSeconds, setEditingStartSeconds] = useState<string>('');
  const [editingEndMinutes, setEditingEndMinutes] = useState<string>('');
  const [editingEndSeconds, setEditingEndSeconds] = useState<string>('');

  // 删除确认状态
  const [deleteStoryboardId, setDeleteStoryboardId] = useState<string | null>(null);
  const [removeUploadedImageId, setRemoveUploadedImageId] = useState<string | null>(null);

  // 上传状态
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  /**
   * 加载图片聊天记录
   * @param sceneId 场次ID
   */
  const loadImageChatHistory = async (sceneId: number | null) => {
    if (!sceneId) {
      console.log('No scene selected, skipping image chat history load');
      setIsLoadingImageHistory(false);
      return;
    }

    setIsLoadingImageHistory(true);
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
          chatScene: "IMAGE",
          type: "AI_ANSWER",
          pageNum: 1,
          pageSize: 24
        })
      });

      if (response.ok) {
        const result = await handleApiResponse(response);
        if (result.code === 0 && result.data) {
          setImageChatHistory(result.data.records || result.data || []);
        } else {
          setImageChatHistory([]);
        }
      } else {
        console.error('LoadImageChatHistory - HTTP error:', response.status);
        setImageChatHistory([]);
      }
    } catch (error) {
      console.error('加载图片聊天记录失败:', error);
      setImageChatHistory([]);
    } finally {
      setIsLoadingImageHistory(false);
    }
  };

  /**
   * 加载分镜板列表
   * @param sceneId 场次ID
   */
  const loadStoryboardList = async (sceneId: number | null) => {
    if (!sceneId) {
      console.log('No scene selected, skipping storyboard list load');
      setIsLoadingStoryboard(false);
      return;
    }

    setIsLoadingStoryboard(true);
    try {
      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/storyboard/list?sceneId=${sceneId}`, {
        method: 'GET',
        headers: {
          'X-Prompt-Manager-Token': token || '',
        }
      });

      if (response.ok) {
        const result = await handleApiResponse(response);
        if (result.code === 0 && result.data) {
          // 按 storyboardOrder 排序后设置数据
          const sortedData = (result.data || []).sort((a: any, b: any) =>
            (a.storyboardOrder || 0) - (b.storyboardOrder || 0)
          );
          setStoryboardItems(sortedData);
        } else {
          setStoryboardItems([]);
        }
      } else {
        console.error('LoadStoryboardList - HTTP error:', response.status);
        setStoryboardItems([]);
      }
    } catch (error) {
      console.error('加载分镜板列表失败:', error);
      setStoryboardItems([]);
    } finally {
      setIsLoadingStoryboard(false);
    }
  };

  /**
   * 创建分镜板
   * @param fileId 文件ID
   * @param fileName 文件名
   * @param sceneId 场次ID
   */
  const handleCreateStoryboard = async (fileId: string, fileName: string, sceneId: number | null) => {
    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    try {
      // token from useAuth()

      // 计算下一个排序号 (当前列表长度 + 1)
      const storyboardOrder = storyboardItems.length + 1;

      const response = await fetch(`${STORYAI_API_BASE}/storyboard/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          sceneId: sceneId,
          storyboardOrder: storyboardOrder,
          fileId: fileId
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success(`已应用图片: ${fileName}`);
        // 刷新分镜板列表
        await loadStoryboardList(sceneId);
      } else {
        throw new Error(result.message || '应用图片失败');
      }
    } catch (error) {
      console.error('创建分镜板失败:', error);
      toast.error('应用图片失败：' + (error as Error).message);
    }
  };

  /**
   * 删除分镜板
   * @param itemId 分镜板ID
   * @param sceneId 场次ID
   */
  const handleDeleteStoryboard = async (itemId: string, sceneId: number | null) => {
    try {
      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/storyboard/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          storyboardId: parseInt(itemId)
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success('删除成功！');
        // 刷新分镜板列表
        await loadStoryboardList(sceneId);
      } else {
        throw new Error(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除分镜板失败:', error);
      toast.error('删除失败：' + (error as Error).message);
    } finally {
      setDeleteStoryboardId(null);
    }
  };

  /**
   * 显示删除分镜板确认
   */
  const handleShowDeleteStoryboardConfirm = (itemId: string) => {
    setDeleteStoryboardId(itemId);
  };

  /**
   * 确认删除分镜板
   */
  const handleConfirmDeleteStoryboard = async (sceneId: number | null) => {
    if (deleteStoryboardId) {
      await handleDeleteStoryboard(deleteStoryboardId, sceneId);
    }
  };

  /**
   * 图片拖拽处理
   */
  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * 分镜板拖拽处理
   * @param event 拖拽事件
   * @param sceneId 场次ID
   */
  const handleStoryboardDragEnd = async (event: DragEndEvent, sceneId: number | null) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldItems = storyboardItems;
      const oldIndex = oldItems.findIndex((item) => item.storyboardId.toString() === active.id);
      const newIndex = oldItems.findIndex((item) => item.storyboardId.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // 先更新本地状态
        const newItems = arrayMove(oldItems, oldIndex, newIndex);
        setStoryboardItems(newItems);

        // 调用API更新排序
        try {
          // token from useAuth()
          const movedItem = oldItems[oldIndex];

          // 计算新的storyboardOrder：使用新位置的索引+1作为order
          const newOrder = newIndex + 1;

          const response = await fetch(`${STORYAI_API_BASE}/storyboard/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Prompt-Manager-Token': token || '',
            },
            body: JSON.stringify({
              storyboardId: movedItem.storyboardId,
              storyboardOrder: newOrder
            })
          });

          if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
          }

          const result = await handleApiResponse(response);
          if (result.code !== 0) {
            throw new Error(result.message || '更新排序失败');
          }

          console.log('分镜板排序更新成功:', result);
        } catch (error) {
          console.error('更新分镜板排序失败:', error);
          // API调用失败时，恢复原来的排序
          setStoryboardItems(oldItems);
          toast.error('排序更新失败：' + (error as Error).message);
        }
      }
    }
  };

  /**
   * 文件上传处理
   * @param file 文件
   * @param sceneId 场次ID
   */
  const handleFileUpload = async (file: File, sceneId: number | null) => {
    if (!sceneId) {
      toast.error('请先选择场次');
      return null;
    }

    setIsUploading(true);
    setUploadProgress({ current: 1, total: 1 });

    try {
      // token from useAuth()
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
        toast.success('上传成功！');
        return result.data;
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      toast.error('上传失败：' + (error as Error).message);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  /**
   * 多文件上传处理
   * @param files 文件列表
   * @param sceneId 场次ID
   */
  const handleMultipleFileUpload = async (files: File[], sceneId: number | null) => {
    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      // token from useAuth()

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

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
          // 上传成功后，创建分镜板
          await handleCreateStoryboard(result.data.attachmentId, file.name, sceneId);
        } else {
          throw new Error(result.message || '上传失败');
        }
      }

      toast.success(`成功上传 ${files.length} 个文件！`);
    } catch (error) {
      console.error('批量上传文件失败:', error);
      toast.error('批量上传失败：' + (error as Error).message);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  /**
   * 开始编辑时间
   */
  const handleStartEditTime = (itemId: string, timeRange: string) => {
    const parsed = parseTimeRange(timeRange);
    setEditingTimeId(itemId);
    setEditingStartMinutes(parsed.startMinutes);
    setEditingStartSeconds(parsed.startSeconds);
    setEditingEndMinutes(parsed.endMinutes);
    setEditingEndSeconds(parsed.endSeconds);
  };

  /**
   * 保存时间编辑
   */
  const handleSaveTimeEdit = async (itemId: string, sceneId: number | null) => {
    try {
      const startTime = (parseInt(editingStartMinutes) * 60 + parseInt(editingStartSeconds)) * 1000;
      const endTime = (parseInt(editingEndMinutes) * 60 + parseInt(editingEndSeconds)) * 1000;

      // token from useAuth()
      const response = await fetch(`${STORYAI_API_BASE}/storyboard/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Prompt-Manager-Token': token || '',
        },
        body: JSON.stringify({
          storyboardId: parseInt(itemId),
          startTime: startTime,
          endTime: endTime
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const result = await handleApiResponse(response);
      if (result.code === 0) {
        toast.success('时间更新成功！');
        // 刷新分镜板列表
        await loadStoryboardList(sceneId);
      } else {
        throw new Error(result.message || '更新时间失败');
      }
    } catch (error) {
      console.error('更新时间失败:', error);
      toast.error('更新时间失败：' + (error as Error).message);
    } finally {
      setEditingTimeId(null);
    }
  };

  /**
   * 取消时间编辑
   */
  const handleCancelTimeEdit = () => {
    setEditingTimeId(null);
  };

  /**
   * 解析时间范围字符串
   */
  const parseTimeRange = (timeRange: string) => {
    const match = timeRange.match(/(\d+):(\d+)-(\d+):(\d+)/);
    if (match) {
      return {
        startMinutes: match[1],
        startSeconds: match[2],
        endMinutes: match[3],
        endSeconds: match[4]
      };
    }
    return {
      startMinutes: '0',
      startSeconds: '0',
      endMinutes: '0',
      endSeconds: '0'
    };
  };

  return {
    // 状态
    imageChatHistory,
    isLoadingImageHistory,
    imageItems,
    storyboardItems,
    isLoadingStoryboard,
    editingTimeId,
    editingStartMinutes,
    editingStartSeconds,
    editingEndMinutes,
    editingEndSeconds,
    deleteStoryboardId,
    removeUploadedImageId,
    isUploading,
    uploadProgress,

    // 方法
    setImageItems,
    setEditingStartMinutes,
    setEditingStartSeconds,
    setEditingEndMinutes,
    setEditingEndSeconds,
    setDeleteStoryboardId,
    setRemoveUploadedImageId,
    loadImageChatHistory,
    loadStoryboardList,
    handleCreateStoryboard,
    handleDeleteStoryboard,
    handleShowDeleteStoryboardConfirm,
    handleConfirmDeleteStoryboard,
    handleImageDragEnd,
    handleStoryboardDragEnd,
    handleFileUpload,
    handleMultipleFileUpload,
    handleStartEditTime,
    handleSaveTimeEdit,
    handleCancelTimeEdit,
    parseTimeRange,
  };
};
