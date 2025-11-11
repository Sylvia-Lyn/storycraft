/**
 * Shortplay Utility Functions
 * 一键创作相关的工具函数
 */

import type { TimeRange } from '../types/shortplay';

/**
 * 解析时间范围字符串
 * @param timeRange - 格式: "00:00'-00:05'"
 */
export const parseTimeRange = (timeRange: string): TimeRange => {
  const match = timeRange.match(/(\d{2}):(\d{2})'-(\d{2}):(\d{2})'/);
  if (match) {
    return {
      startMinutes: match[1],
      startSeconds: match[2],
      endMinutes: match[3],
      endSeconds: match[4]
    };
  }
  return {
    startMinutes: '00',
    startSeconds: '00',
    endMinutes: '00',
    endSeconds: '05'
  };
};

/**
 * 格式化时间范围
 */
export const formatTimeRange = (
  startMin: string,
  startSec: string,
  endMin: string,
  endSec: string
): string => {
  return `${startMin.padStart(2, '0')}:${startSec.padStart(2, '0')}'-${endMin.padStart(2, '0')}:${endSec.padStart(2, '0')}'`;
};

/**
 * 验证时间格式
 */
export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^\d{1,2}:\d{1,2}$/;
  if (!timeRegex.test(time)) return false;

  const [minutes, seconds] = time.split(':').map(Number);
  return minutes <= 59 && seconds <= 59;
};

/**
 * 格式化时间字符串
 */
export const formatTime = (time: string): string => {
  const timeRegex = /^(\d{1,2}):(\d{1,2})$/;
  const match = time.match(timeRegex);
  if (match) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    if (minutes <= 59 && seconds <= 59) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  return time;
};

/**
 * 处理时间输入
 */
export const handleTimeInput = (value: string, max: number): string => {
  // 只允许数字输入，最多2位
  const numValue = value.replace(/\D/g, '').slice(0, 2);

  if (numValue === '') return '';

  const intValue = parseInt(numValue);
  if (isNaN(intValue)) return '';

  // 如果超过最大值，返回最大值对应的字符串
  if (intValue > max) {
    return max.toString();
  }

  return numValue;
};

/**
 * 将分秒转换为毫秒
 */
export const timeToMilliseconds = (minutes: number, seconds: number): number => {
  return (minutes * 60 + seconds) * 1000;
};

/**
 * 将毫秒转换为分秒
 */
export const millisecondsToTime = (ms: number): { minutes: number; seconds: number } => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
};

/**
 * 验证时间逻辑是否正确
 */
export const validateTimeLogic = (
  startMinutes: string,
  startSeconds: string,
  endMinutes: string,
  endSeconds: string
): { valid: boolean; error?: string } => {
  const startSecs = parseInt(startMinutes) * 60 + parseInt(startSeconds);
  const endSecs = parseInt(endMinutes) * 60 + parseInt(endSeconds);

  if (startSecs >= endSecs) {
    return { valid: false, error: '开始时间必须小于结束时间' };
  }

  return { valid: true };
};

/**
 * 生成唯一ID
 */
export const generateTempId = (): number => {
  return Date.now();
};

/**
 * 检查是否为临时ID（新创建的项目）
 */
export const isTempId = (id: number): boolean => {
  return id > 1000000000000;
};

/**
 * 从聊天记录中提取文件列表
 */
export const extractFilesFromChatHistory = (
  chatHistory: any[],
  fileType: 'IMAGE' | 'VIDEO'
): Array<{
  fileId: string;
  fileName: string;
  fileType: string;
  downloadUrl: string;
  recordIndex: number;
  recordContent: string;
  createTime?: string;
}> => {
  const allFiles: any[] = [];

  // 查找最近的 USER_QUESTION 记录
  const getLatestUserQuestion = (upToIndex: number): string => {
    for (let i = upToIndex; i >= 0; i--) {
      if (chatHistory[i].type === 'USER_QUESTION' && chatHistory[i].content) {
        return chatHistory[i].content;
      }
    }
    return `${fileType === 'IMAGE' ? '图片' : '视频'}内容`;
  };

  chatHistory.forEach((item, itemIndex) => {
    if (item.files && item.files.length > 0) {
      item.files.forEach((file: any) => {
        if (file.fileType === fileType && file.downloadUrl) {
          allFiles.push({
            ...file,
            recordIndex: itemIndex,
            recordContent: getLatestUserQuestion(itemIndex),
            createTime: item.createTime
          });
        }
      });
    } else if (fileType === 'IMAGE' && item.imageUrl) {
      // 兼容旧格式
      allFiles.push({
        downloadUrl: item.imageUrl,
        fileName: '生成的图片',
        fileType: 'IMAGE',
        recordIndex: itemIndex,
        recordContent: getLatestUserQuestion(itemIndex),
        createTime: item.createTime
      });
    }
  });

  return allFiles;
};
