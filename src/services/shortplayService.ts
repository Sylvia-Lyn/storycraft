/**
 * Shortplay API Service
 * 一键创作相关的API调用服务
 */

import { apiInterceptor } from './apiInterceptor';

const STORYAI_API_BASE = '/storyai';

// 在内存中保存userId（从AuthContext中设置，不持久化）
let currentUserId: string | number = '';

/**
 * 设置当前用户的userId（登录时调用）
 */
export const setCurrentUserId = (userId: string | number) => {
  currentUserId = userId;
  console.log('🔑 [shortplayService] userId已设置:', userId);
};

/**
 * 清除当前用户的userId（登出时调用）
 */
export const clearCurrentUserId = () => {
  currentUserId = '';
  console.log('🔑 [shortplayService] userId已清除');
};

const getUserId = (): string => {
  return String(currentUserId) || '';
};

/**
 * 处理API响应，检查code字段中的错误
 * @param response HTTP响应对象
 * @returns 解析后的JSON数据
 * @throws 如果code === 401，触发未授权回调并抛出错误
 */
const handleApiResponse = async (response: Response): Promise<any> => {
  // 首先检查HTTP状态码
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const data = await response.json();

  // 检查响应体中的code字段（后端自定义的错误码）
  if (data.code === 401) {
    console.error('🔴 [shortplayService] API返回401未登录错误，触发登出和重定向');
    // 调用apiInterceptor的公开方法来触发未授权处理
    apiInterceptor.triggerUnauthorized();
    throw new Error('用户未登录，已重定向到登录页面');
  }

  // 其他非0的code也应该作为错误处理
  if (data.code !== 0 && data.code !== undefined) {
    throw new Error(data.message || `API Error: ${data.code}`);
  }

  return data;
};

// ============ 剧本相关 API ============

/**
 * 创建剧本生成任务
 */
export const createSeries = async (userInput: string, language: string = 'zh-CN') => {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  // 映射language值
  const languageMap: Record<string, string> = {
    'zh-CN': '中文',
    'en-US': '英文',
    'ja-JP': '日语',
    'ko-KR': '韩文',
  };
  const mappedLanguage = languageMap[language] || language;

  const response = await fetch(`${STORYAI_API_BASE}/series/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      userInput: userInput.trim(),
      provider: "",
      language: mappedLanguage
    }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 获取剧本详情
 */
export const getSeriesDetail = async (seriesId?: string) => {
  const userId = getUserId();
  const url = seriesId
    ? `${STORYAI_API_BASE}/series/detail?seriesId=${seriesId}`
    : `${STORYAI_API_BASE}/series/detail?userId=${userId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      },
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ 场次相关 API ============

/**
 * 获取场次内容
 */
export const getSceneContent = async (sceneId: number) => {
  const response = await fetch(`${STORYAI_API_BASE}/scene/content?sceneId=${sceneId}`, {
    method: 'GET',
    headers: {
      },
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 更新场次信息
 */
export const updateScene = async (sceneId: number, sceneTitle: string) => {
  const response = await fetch(`${STORYAI_API_BASE}/scene`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: sceneId,
      sceneTitle
    }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 创建场次内容
 */
export const createSceneContent = async (data: {
  sceneId: number;
  type: number;
  content: string;
  roleName?: string;
  startTime: string;
  endTime: string;
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 更新场次内容
 */
export const updateSceneContent = async (data: {
  id: number;
  type?: number;
  content?: string;
  roleName?: string;
  startTime?: string;
  endTime?: string;
  orderNum?: number;
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/scene/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 删除场次内容
 */
export const deleteSceneContent = async (id: number) => {
  const response = await fetch(`${STORYAI_API_BASE}/scene/content/${id}`, {
    method: 'DELETE',
    headers: {
      },
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ 音色相关 API ============

/**
 * 获取音色列表
 */
export const getVoiceList = async (status: number) => {
  const userId = getUserId();
  if (!userId) return [];

  const response = await fetch(`${STORYAI_API_BASE}/voice/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      status
    }),
    credentials: 'include' as RequestCredentials
  });

  const result = await handleApiResponse(response);
  return result.data ? result.data : [];
};

/**
 * 更新音色
 */
export const updateVoice = async (data: {
  voiceId: string;
  status?: number;
  voiceName?: string;
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/voice/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 批量绑定音色
 */
export const batchBindVoice = async (bindings: Array<{
  voiceId: string;
  subtitleId: number;
}>) => {
  const response = await fetch(`${STORYAI_API_BASE}/ai/voice/batch-bind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bindings }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * AI音色设计
 */
export const designVoice = async (prompt: string) => {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch(`${STORYAI_API_BASE}/ai/voice/design`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      userId
    }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ BGM相关 API ============

/**
 * 获取BGM列表
 */
export const getBgmList = async () => {
  const userId = getUserId();
  if (!userId) return [];

  const response = await fetch(`${STORYAI_API_BASE}/bgm/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId
    }),
    credentials: 'include' as RequestCredentials
  });

  const result = await handleApiResponse(response);
  return result.data ? result.data : [];
};

/**
 * AI生成BGM
 */
export const generateBgm = async (userInput: string, style: string) => {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch(`${STORYAI_API_BASE}/ai/bgm/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: parseInt(userId),
      style,
      userInput: userInput.trim()
    }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ 图片相关 API ============

/**
 * AI生成图片
 */
export const generateImage = async (sceneId: number, userInput: string) => {
  const response = await fetch(`${STORYAI_API_BASE}/ai/image/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sceneId,
      userInput: userInput.trim()
    }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 查询聊天记录
 */
export const queryChatHistory = async (data: {
  sceneId: string;
  chatScene: 'IMAGE' | 'VIDEO';
  type: string;
  pageNum: number;
  pageSize: number;
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/chat-history/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ 分镜板相关 API ============

/**
 * 获取分镜板列表
 */
export const getStoryboardList = async (sceneId: number) => {
  const response = await fetch(`${STORYAI_API_BASE}/storyboard/list?sceneId=${sceneId}`, {
    method: 'GET',
    headers: {
      },
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 创建分镜板
 */
export const createStoryboard = async (data: {
  sceneId: number;
  storyboardOrder: number;
  fileId: string;
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/storyboard/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 更新分镜板
 */
export const updateStoryboard = async (data: {
  id: number;
  storyboardOrder?: number;
  startTime?: number;
  endTime?: number;
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/storyboard/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 删除分镜板
 */
export const deleteStoryboard = async (id: string) => {
  const response = await fetch(`${STORYAI_API_BASE}/storyboard/${id}`, {
    method: 'DELETE',
    headers: {
      },
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ 视频相关 API ============

/**
 * AI生成视频
 */
export const generateVideo = async (data: {
  sceneId: string;
  llmName: string;
  userMessage: string;
  useImageGeneration: boolean;
  images: string[];
  resolution: string;           // 分辨率
  ratio: string;               // 宽高比 (16:9/4:3/1:1/3:4/9:16/21:9/keep_ratio/adaptive)
  durationMillis: number;      // 持续时间(毫秒，最长90000)
}) => {
  const response = await fetch(`${STORYAI_API_BASE}/ai/video/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

/**
 * 查询视频生成进度
 */
export const getVideoProgress = async (fileId: number) => {
  const response = await fetch(`${STORYAI_API_BASE}/ai/video/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId }),
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};

// ============ 文件上传 API ============

/**
 * 上传文件
 */
export const uploadFile = async (file: File) => {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const fileName = encodeURIComponent(file.name);
  const uploadUrl = `${STORYAI_API_BASE}/file/upload?userId=${userId}&fileName=${fileName}`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    credentials: 'include' as RequestCredentials
  });

  return handleApiResponse(response);
};
