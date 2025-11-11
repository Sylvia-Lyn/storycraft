/**
 * useVoiceManagement Hook
 * 音色管理相关的状态和逻辑
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { VoiceData, AudioType } from '../types/shortplay';
import * as shortplayService from '../services/shortplayService';

export const useVoiceManagement = () => {
  // 音色数据
  const [configuredVoices, setConfiguredVoices] = useState<VoiceData[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceData[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // UI状态
  const [isConfiguredVoicesExpanded, setIsConfiguredVoicesExpanded] = useState(false);
  const [isAvailableVoicesExpanded, setIsAvailableVoicesExpanded] = useState(false);

  // 编辑状态
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
  const [editingVoiceName, setEditingVoiceName] = useState<string>('');

  // 音频类型
  const [audioType, setAudioType] = useState<AudioType>('voice');

  /**
   * 加载音色列表
   */
  const loadVoiceList = useCallback(async (status: number) => {
    try {
      return await shortplayService.getVoiceList(status);
    } catch (error) {
      console.error('获取音色列表失败:', error);
      return [];
    }
  }, []);

  /**
   * 加载所有音色数据
   */
  const loadAllVoices = useCallback(async () => {
    setIsLoadingVoices(true);
    try {
      const [configured, available] = await Promise.all([
        loadVoiceList(1), // 已设置的音色
        loadVoiceList(2)  // 可用的音色
      ]);
      setConfiguredVoices(configured);
      setAvailableVoices(available);
    } catch (error) {
      console.error('加载音色数据失败:', error);
      toast.error('加载音色数据失败');
    } finally {
      setIsLoadingVoices(false);
    }
  }, [loadVoiceList]);

  /**
   * 应用音色到已设置列表
   */
  const handleApplyVoice = useCallback(async (voiceId: string) => {
    try {
      const result = await shortplayService.updateVoice({
        voiceId,
        status: 1
      });

      if (result.code === 0) {
        const updatedConfigured = await loadVoiceList(1);
        setConfiguredVoices(updatedConfigured);
        toast.success('音色应用成功！');
      } else {
        throw new Error(result.message || '应用音色失败');
      }
    } catch (error) {
      console.error('应用音色失败:', error);
      toast.error('应用音色失败：' + (error as Error).message);
    }
  }, [loadVoiceList]);

  /**
   * 开始编辑音色名称
   */
  const handleStartEditVoiceName = useCallback((voiceId: string, currentName: string) => {
    setEditingVoiceId(voiceId);
    setEditingVoiceName(currentName);
  }, []);

  /**
   * 保存音色名称修改
   */
  const handleSaveVoiceName = useCallback(async () => {
    if (!editingVoiceId || !editingVoiceName.trim()) return;

    try {
      const result = await shortplayService.updateVoice({
        voiceId: editingVoiceId,
        voiceName: editingVoiceName.trim()
      });

      if (result.code === 0) {
        await loadAllVoices();
        toast.success('音色名称更新成功！');
      } else {
        throw new Error(result.message || '更新音色名称失败');
      }
    } catch (error) {
      console.error('更新音色名称失败:', error);
      toast.error('更新音色名称失败：' + (error as Error).message);
    } finally {
      setEditingVoiceId(null);
      setEditingVoiceName('');
    }
  }, [editingVoiceId, editingVoiceName, loadAllVoices]);

  /**
   * 取消编辑音色名称
   */
  const handleCancelEditVoiceName = useCallback(() => {
    setEditingVoiceId(null);
    setEditingVoiceName('');
  }, []);

  /**
   * 处理音色选择（绑定到字幕）
   */
  const handleVoiceSelect = useCallback(async (subtitleId: string, voiceId: string) => {
    if (!voiceId) return;

    try {
      const result = await shortplayService.batchBindVoice([
        {
          voiceId,
          subtitleId: parseInt(subtitleId)
        }
      ]);

      if (result.code === 0) {
        toast.success('音色绑定成功！');
      } else {
        throw new Error(result.message || '音色绑定失败');
      }
    } catch (error) {
      console.error('音色绑定失败:', error);
      toast.error('音色绑定失败：' + (error as Error).message);
    }
  }, []);

  /**
   * AI音色设计
   */
  const handleVoiceDesign = useCallback(async (prompt: string) => {
    try {
      const result = await shortplayService.designVoice(prompt);

      if (result.code === 0) {
        await loadAllVoices();
        toast.success('音色生成成功！');
        return true;
      } else {
        throw new Error(result.message || '音色生成失败');
      }
    } catch (error) {
      console.error('音色生成失败:', error);
      toast.error('音色生成失败：' + (error as Error).message);
      return false;
    }
  }, [loadAllVoices]);

  return {
    // 状态
    configuredVoices,
    availableVoices,
    isLoadingVoices,
    isConfiguredVoicesExpanded,
    isAvailableVoicesExpanded,
    editingVoiceId,
    editingVoiceName,
    audioType,

    // Setters
    setConfiguredVoices,
    setAvailableVoices,
    setIsConfiguredVoicesExpanded,
    setIsAvailableVoicesExpanded,
    setEditingVoiceName,
    setAudioType,

    // 方法
    loadAllVoices,
    handleApplyVoice,
    handleStartEditVoiceName,
    handleSaveVoiceName,
    handleCancelEditVoiceName,
    handleVoiceSelect,
    handleVoiceDesign
  };
};
