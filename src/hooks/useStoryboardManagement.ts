/**
 * useStoryboardManagement Hook
 * 分镜板管理相关的状态和逻辑
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { StoryboardItem } from '../types/shortplay';
import * as shortplayService from '../services/shortplayService';

export const useStoryboardManagement = () => {
  // 分镜板数据
  const [storyboardItems, setStoryboardItems] = useState<StoryboardItem[]>([]);
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState(false);

  // 时间编辑状态
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editingStartMinutes, setEditingStartMinutes] = useState('');
  const [editingStartSeconds, setEditingStartSeconds] = useState('');
  const [editingEndMinutes, setEditingEndMinutes] = useState('');
  const [editingEndSeconds, setEditingEndSeconds] = useState('');

  /**
   * 加载分镜板列表
   */
  const loadStoryboardList = useCallback(async (sceneId: number) => {
    if (!sceneId) {
      console.log('No scene selected, skipping storyboard list load');
      setIsLoadingStoryboard(false);
      return;
    }

    setIsLoadingStoryboard(true);
    try {
      const result = await shortplayService.getStoryboardList(sceneId);

      if (result.code === 0 && result.data) {
        setStoryboardItems(result.data || []);
      } else {
        console.log('LoadStoryboardList - API returned error:', result);
        setStoryboardItems([]);
      }
    } catch (error) {
      console.error('加载分镜板列表失败:', error);
      setStoryboardItems([]);
      toast.error('加载分镜板失败');
    } finally {
      setIsLoadingStoryboard(false);
    }
  }, []);

  /**
   * 创建分镜板
   */
  const handleCreateStoryboard = useCallback(async (sceneId: number, fileId: string, fileName: string) => {
    if (!sceneId) {
      toast.error('请先选择场次');
      return;
    }

    try {
      const storyboardOrder = storyboardItems.length + 1;

      const result = await shortplayService.createStoryboard({
        sceneId,
        storyboardOrder,
        fileId
      });

      if (result.code === 0) {
        toast.success(`已应用图片: ${fileName}`);
        await loadStoryboardList(sceneId);
      } else {
        throw new Error(result.message || '应用图片失败');
      }
    } catch (error) {
      console.error('创建分镜板失败:', error);
      toast.error('应用图片失败：' + (error as Error).message);
    }
  }, [storyboardItems.length, loadStoryboardList]);

  /**
   * 删除分镜板
   */
  const handleDeleteStoryboard = useCallback(async (itemId: string, sceneId: number) => {
    try {
      const result = await shortplayService.deleteStoryboard(itemId);

      if (result.code === 0) {
        toast.success('分镜板删除成功！');
        await loadStoryboardList(sceneId);
      } else {
        throw new Error(result.message || '删除分镜板失败');
      }
    } catch (error) {
      console.error('删除分镜板失败:', error);
      toast.error('删除失败：' + (error as Error).message);
    }
  }, [loadStoryboardList]);

  /**
   * 开始编辑时间
   */
  const handleStartEditTime = useCallback((itemId: string, timeRange: string) => {
    // 解析时间范围，假设格式为 "00:00'-00:05'"
    const match = timeRange.match(/(\d{2}):(\d{2})'-(\d{2}):(\d{2})'/);
    if (match) {
      setEditingTimeId(itemId);
      setEditingStartMinutes(match[1]);
      setEditingStartSeconds(match[2]);
      setEditingEndMinutes(match[3]);
      setEditingEndSeconds(match[4]);
    }
  }, []);

  /**
   * 保存时间编辑
   */
  const handleSaveTimeEdit = useCallback(async (itemId: string, sceneId: number) => {
    if (!editingStartMinutes || !editingStartSeconds || !editingEndMinutes || !editingEndSeconds) {
      return;
    }

    try {
      const startMinutes = parseInt(editingStartMinutes);
      const startSeconds = parseInt(editingStartSeconds);
      const endMinutes = parseInt(editingEndMinutes);
      const endSeconds = parseInt(editingEndSeconds);

      const startTimeMs = (startMinutes * 60 + startSeconds) * 1000;
      const endTimeMs = (endMinutes * 60 + endSeconds) * 1000;

      const result = await shortplayService.updateStoryboard({
        id: parseInt(itemId),
        startTime: startTimeMs,
        endTime: endTimeMs
      });

      if (result.code === 0) {
        toast.success('时间更新成功！');
        await loadStoryboardList(sceneId);
      } else {
        throw new Error(result.message || '更新时间失败');
      }
    } catch (error) {
      console.error('更新分镜板时间失败:', error);
      toast.error('时间更新失败：' + (error as Error).message);
    } finally {
      setEditingTimeId(null);
      setEditingStartMinutes('');
      setEditingStartSeconds('');
      setEditingEndMinutes('');
      setEditingEndSeconds('');
    }
  }, [editingStartMinutes, editingStartSeconds, editingEndMinutes, editingEndSeconds, loadStoryboardList]);

  /**
   * 取消时间编辑
   */
  const handleCancelTimeEdit = useCallback(() => {
    setEditingTimeId(null);
    setEditingStartMinutes('');
    setEditingStartSeconds('');
    setEditingEndMinutes('');
    setEditingEndSeconds('');
  }, []);

  /**
   * 处理拖拽排序
   */
  const handleDragEnd = useCallback(async (event: DragEndEvent, sceneId: number) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldItems = storyboardItems;
      const oldIndex = oldItems.findIndex((item) => item.id.toString() === active.id);
      const newIndex = oldItems.findIndex((item) => item.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // 先更新本地状态
        const newItems = arrayMove(oldItems, oldIndex, newIndex);
        setStoryboardItems(newItems);

        // 调用API更新分镜板排序
        try {
          const movedItem = oldItems[oldIndex];
          const newStoryboardOrder = newIndex + 1;

          const result = await shortplayService.updateStoryboard({
            id: parseInt(movedItem.id.toString()),
            storyboardOrder: newStoryboardOrder
          });

          if (result.code === 0) {
            toast.success('分镜板排序已更新！');
          } else {
            throw new Error(result.message || '更新排序失败');
          }
        } catch (error) {
          console.error('更新分镜板排序失败:', error);
          // API调用失败时，恢复原来的排序
          setStoryboardItems(oldItems);
          toast.error('排序更新失败：' + (error as Error).message);
        }
      }
    }
  }, [storyboardItems]);

  return {
    // 状态
    storyboardItems,
    isLoadingStoryboard,
    editingTimeId,
    editingStartMinutes,
    editingStartSeconds,
    editingEndMinutes,
    editingEndSeconds,

    // Setters
    setStoryboardItems,
    setEditingStartMinutes,
    setEditingStartSeconds,
    setEditingEndMinutes,
    setEditingEndSeconds,

    // 方法
    loadStoryboardList,
    handleCreateStoryboard,
    handleDeleteStoryboard,
    handleStartEditTime,
    handleSaveTimeEdit,
    handleCancelTimeEdit,
    handleDragEnd
  };
};
