// 脚本生成服务：调用云函数 script_generator
import { ensureCloudbaseLogin } from '../cloudbase';
import { apiInterceptor } from './apiInterceptor';

export type GenerateOptions = {
  model?: 'deepseek-r1' | 'gemini';
  language?: 'zh-CN' | 'en-US' | 'ja-JP';
  style?: string;
  max_scenes?: number;
  include_dialogue?: boolean;
};

export type GenerateResult = {
  outline?: any;
  characters?: any[];
  scenes?: any[];
  data?: {
    outline?: any;
    characters?: any[];
    scenes?: any[];
  };
};

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type TaskInfo = {
  task_id: string;
  status: TaskStatus;
  progress: number;
  message: string;
  created_at?: string;
  updated_at?: string;
  result?: GenerateResult;
  estimated_time?: string;
};

/**
 * 异步提交剧本生成任务
 * @param novelContent 小说内容
 * @param options 生成选项
 * @returns 任务信息
 */
export async function submitScriptGenerationTask(novelContent: string, options: GenerateOptions = {}): Promise<TaskInfo> {
  // 确保已登录
  await ensureCloudbaseLogin();

  const payload = {
    novel_content: novelContent,
    options: {
      model: 'deepseek-r1',
      language: 'zh-CN',
      include_dialogue: true,
      max_scenes: 8,
      ...options
    }
  };

  console.log('[script_generator][submit task]:', {
    novel_content_preview: typeof payload.novel_content === 'string'
      ? `${payload.novel_content.slice(0, 80)}...(${payload.novel_content.length})...${payload.novel_content.slice(-80)}`
      : payload.novel_content,
    options: payload.options
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30秒超时（提交任务应该很快）

    const response = await fetch('https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[script_generator][submit result]:', result);

    if (!result.success) {
      throw new Error(result.error || '任务提交失败');
    }

    return {
      task_id: result.task_id,
      status: result.status,
      progress: 0,
      message: result.message || '任务已提交',
      estimated_time: result.estimated_time
    };

  } catch (error) {
    console.error('[script_generator] 任务提交失败:', error);
    throw new Error(`任务提交失败: ${(error as Error).message}`);
  }
}

/**
 * 查询任务状态
 * @param taskId 任务ID
 * @returns 任务信息
 */
export async function queryTaskStatus(taskId: string): Promise<TaskInfo> {
  try {
    const payload = {
      action: 'status',
      task_id: taskId
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10秒超时

    const response = await fetch('https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[script_generator][status result]:', result);

    if (!result.success) {
      throw new Error(result.error || '查询任务状态失败');
    }

    return {
      task_id: result.task_id,
      status: result.status,
      progress: result.progress || 0,
      message: result.message || '',
      created_at: result.created_at,
      updated_at: result.updated_at,
      result: result.result
    };

  } catch (error) {
    console.error('[script_generator] 查询任务状态失败:', error);
    throw new Error(`查询任务状态失败: ${(error as Error).message}`);
  }
}

/**
 * 智能轮询等待任务完成
 * @param taskId 任务ID
 * @param onProgress 进度回调函数
 * @param maxWaitTime 最大等待时间（毫秒）
 * @returns 任务结果
 */
export async function waitForTaskCompletion(
  taskId: string,
  onProgress?: (taskInfo: TaskInfo) => void,
  maxWaitTime: number = 600000 // 10分钟
): Promise<GenerateResult> {
  const startTime = Date.now();
  let lastProgress = 0;
  let consecutiveNoProgress = 0;
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        // 检查是否超时
        if (Date.now() - startTime > maxWaitTime) {
          reject(new Error('任务等待超时'));
          return;
        }

        const taskInfo = await queryTaskStatus(taskId);
        
        // 调用进度回调
        if (onProgress) {
          onProgress(taskInfo);
        }

        if (taskInfo.status === 'completed') {
          if (taskInfo.result?.data) {
            resolve(taskInfo.result.data);
          } else {
            reject(new Error('任务完成但未返回结果'));
          }
        } else if (taskInfo.status === 'failed') {
          reject(new Error(taskInfo.message || '任务处理失败'));
        } else {
          // 智能轮询间隔策略
          const pollInterval = calculatePollInterval(taskInfo, lastProgress, consecutiveNoProgress);
          
          // 更新进度跟踪
          if (taskInfo.progress === lastProgress) {
            consecutiveNoProgress++;
          } else {
            consecutiveNoProgress = 0;
            lastProgress = taskInfo.progress;
          }
          
          // 继续轮询
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        reject(error);
      }
    };

    // 开始轮询
    poll();
  });
}

/**
 * 计算智能轮询间隔
 * @param taskInfo 任务信息
 * @param lastProgress 上次进度
 * @param consecutiveNoProgress 连续无进度次数
 * @returns 轮询间隔（毫秒）
 */
function calculatePollInterval(
  taskInfo: TaskInfo, 
  lastProgress: number, 
  consecutiveNoProgress: number
): number {
  // 基础间隔
  let interval = 2000; // 2秒
  
  // 根据任务状态调整
  switch (taskInfo.status) {
    case 'pending':
      // 等待状态，轮询频率较低
      interval = 5000; // 5秒
      break;
    case 'processing':
      // 处理中，根据进度调整
      if (taskInfo.progress > 0) {
        // 有进度时，轮询频率适中
        interval = 3000; // 3秒
      } else {
        // 无进度时，轮询频率较低
        interval = 5000; // 5秒
      }
      break;
  }
  
  // 如果连续多次无进度，增加轮询间隔
  if (consecutiveNoProgress > 0) {
    interval = Math.min(interval * (1 + consecutiveNoProgress * 0.5), 15000); // 最多15秒
  }
  
  // 根据进度阶段调整
  if (taskInfo.progress > 80) {
    // 接近完成时，轮询频率提高
    interval = Math.min(interval, 2000);
  }
  
  return Math.max(interval, 1000); // 最少1秒
}

/**
 * 同步生成剧本（保留原函数用于兼容）
 * @deprecated 建议使用 submitScriptGenerationTask + waitForTaskCompletion
 */
export async function generateScriptFromNovel(novelContent: string, options: GenerateOptions = {}): Promise<GenerateResult> {
  // 确保已登录（匿名或已登录态），避免凭证缺失造成的过期报错
  await ensureCloudbaseLogin();

  // 组织并打印即将传入云函数的参数
  const payload = {
    novel_content: novelContent,
    options: {
      model: 'deepseek-r1',
      language: 'zh-CN',
      include_dialogue: true,
      max_scenes: 8,
      ...options
    }
  };
  console.log('[script_generator][input payload]:', {
    // 避免长文本刷屏，仅打印前后各一小段
    novel_content_preview: typeof payload.novel_content === 'string'
      ? `${payload.novel_content.slice(0, 80)}...(${payload.novel_content.length})...${payload.novel_content.slice(-80)}`
      : payload.novel_content,
    options: payload.options
  });

  // 重试机制
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[script_generator] 尝试第 ${attempt} 次调用...`);
      
      // 使用 HTTP 直接调用云函数，绕过 SDK 超时限制
      console.log('[script_generator] 使用 HTTP 直接调用云函数...');
      
      // 创建自定义的AbortController，支持更长的超时时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 600000); // 10分钟超时

      // 使用带数字后缀的URL，可能有有效的SSL证书
      const response = await fetch('https://stroycraft-1ghmi4ojd3b4a20b-1304253469.ap-shanghai.app.tcloudbase.com/script_generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 强制使用HTTP/1.1，避免HTTP/2协议错误
          'Connection': 'close'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
        // 移除keepalive选项，避免与HTTP/2冲突
      });

      // 清除超时定时器
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      console.log('[script_generator] 响应Content-Type:', contentType);
      
      // 获取响应文本，用于调试
      const responseText = await response.text();
      console.log('[script_generator] 响应体长度:', responseText.length);
      console.log('[script_generator] 响应体预览:', responseText.slice(0, 200) + '...');
      
      // 检查响应体大小
      const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB
      if (responseText.length > MAX_RESPONSE_SIZE) {
        console.warn('[script_generator] 响应体过大:', responseText.length, '字符');
        throw new Error(`响应体过大 (${responseText.length} 字符)，请尝试减少输入内容长度`);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[script_generator] JSON解析失败:', parseError);
        console.error('[script_generator] 原始响应:', responseText);
        throw new Error(`响应解析失败: ${parseError.message}`);
      }

      // 调试日志：打印完整返回与关键字段摘要
      try {
        console.log('[script_generator][raw result]:', result as unknown as object);
        const data: any = (result as any)?.data ?? {};
        console.groupCollapsed('[script_generator][summary]');
        console.log('outline:', data?.outline ? '存在' : '缺失');
        console.log('characters:', Array.isArray(data?.characters) ? data.characters.length : 0, '个');
        console.log('scenes:', Array.isArray(data?.scenes) ? data.scenes.length : 0, '个');
        console.groupEnd();
      } catch (e) {
        console.warn('[script_generator] 打印结果摘要失败:', e);
      }

      if (!result.success) {
        throw new Error(result.error || '脚本生成失败');
      }
      
      console.log(`[script_generator] 第 ${attempt} 次调用成功！`);
      return result.data as GenerateResult;
      
    } catch (err) {
      lastError = err as Error;
      console.error(`[script_generator] 第 ${attempt} 次调用失败:`, err);
      
      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待一段时间后重试
      const delay = attempt * 2000; // 2秒、4秒
      console.log(`[script_generator] 等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 重新登录以确保认证状态
      try {
        await ensureCloudbaseLogin();
        console.log('[script_generator] 重新登录成功');
      } catch (loginErr) {
        console.warn('[script_generator] 重新登录失败:', loginErr);
      }
    }
  }
  
  // 所有重试都失败了
  console.error('[script_generator] 所有重试都失败了');
  
  // 提供更详细的错误信息
  if (lastError instanceof Error) {
    if (lastError.message.includes('响应解析失败')) {
      throw new Error(`响应解析失败：服务器返回的数据格式不正确。请检查云函数日志或联系技术支持。原始错误: ${lastError.message}`);
    } else if (lastError.message.includes('响应体过大')) {
      throw new Error(`响应体过大：AI生成的内容过多，请尝试减少输入文本长度或分段处理。原始错误: ${lastError.message}`);
    } else if (lastError.message.includes('CORS')) {
      throw new Error(`CORS 问题：请检查 CloudBase 安全域名配置。原始错误: ${lastError.message}`);
    } else if (lastError.name === 'AbortError') {
      throw new Error(`请求超时：AI处理时间过长，请尝试减少文本长度或稍后重试。原始错误: ${lastError.message}`);
    } else if (lastError.message.includes('Failed to fetch')) {
      throw new Error(`网络连接失败：请检查网络连接或稍后重试。原始错误: ${lastError.message}`);
    } else {
      throw new Error(`脚本生成失败：${lastError.message}`);
    }
  }
  
  throw new Error('脚本生成失败：未知错误');
}

// 将结构化结果转换为可展示的纯文本
export function formatOutlineToText(outline: any): string {
  if (!outline) return '';
  // 兼容不同字段命名
  const title = outline.title || outline.name || outline.subject || '';
  const theme = outline.theme || outline.themes || outline.core_theme || '';
  const genre = outline.genre || outline.category || outline.type || '';
  const structure = outline.structure || outline.plot_structure || outline.framework || '';
  const tone = outline.tone || outline.style || outline.mood || '';
  const summary = outline.summary || outline.overview || outline.description || outline.text || '';

  const parts: string[] = [];
  if (title) parts.push(`标题：${title}`);
  if (theme) parts.push(`主题：${theme}`);
  if (genre) parts.push(`类型：${genre}`);
  if (structure) parts.push(`结构：${structure}`);
  if (tone) parts.push(`基调：${tone}`);
  if (summary) parts.push(`概要：\n${summary}`);

  // 若关键字段都缺失，兜底输出可读的 JSON
  if (parts.length === 0) {
    try {
      return typeof outline === 'string' ? outline : JSON.stringify(outline, null, 2);
    } catch {
      return String(outline);
    }
  }
  return parts.join('\n');
}

export function formatCharactersToText(characters: any[] = []): string {
  if (!Array.isArray(characters)) {
    try { return JSON.stringify(characters, null, 2); } catch { return String(characters); }
  }
  return characters.map((c, idx) => {
    const name = c.name || c.character || c.nickname || '';
    const role = c.role || c.archetype || c.position || '';
    const personality = c.personality || c.traits || c.characteristics || '';
    const background = c.background || c.backstory || c.history || '';
    const motivation = c.motivation || c.goal || c.objective || '';
    const relationships = c.relationships || c.relations || '';
    const description = c.description || c.bio || c.summary || '';
    const lines = [
      `【角色${idx + 1}】${name}`,
      role ? `角色定位：${role}` : '',
      personality ? `性格：${personality}` : '',
      background ? `背景：${background}` : '',
      motivation ? `动机：${motivation}` : '',
      relationships ? `关系：${relationships}` : '',
      description ? `小传：${description}` : ''
    ].filter(Boolean);
    const text = lines.join('\n');
    return text || (typeof c === 'string' ? c : JSON.stringify(c, null, 2));
  }).join('\n\n');
}

export function formatScenesToText(scenes: any[] = []): string {
  if (!Array.isArray(scenes)) {
    try { return JSON.stringify(scenes, null, 2); } catch { return String(scenes); }
  }
  return scenes.map((s, i) => {
    const num = s.scene_number || s.index || s.no || i + 1;
    const title = s.title || s.name || s.heading || '';
    const settingObj = s.setting || s.scene_setting || s.environment || {};
    const time = settingObj.time || settingObj.when || '';
    const location = settingObj.location || settingObj.where || settingObj.place || '';
    const atmosphere = settingObj.atmosphere || settingObj.mood || '';
    const setting = (time || location || atmosphere)
      ? `场景：${time || ''} / ${location || ''} / ${atmosphere || ''}`
      : '';
    const characters = s.characters || s.roles || [];
    const chars = Array.isArray(characters) ? `角色：${characters.map((c: any) => (c.name || c || '')).join('、')}` : '';
    const dialogueArr = s.dialogue || s.dialogues || s.lines || [];
    const dialogue = Array.isArray(dialogueArr) && dialogueArr.length
      ? `对话：\n${dialogueArr.map((d: any) => `- ${(d.character || d.speaker || '')}${d.emotion ? `（${d.emotion}）` : ''}：${d.content || d.text || ''}`).join('\n')}`
      : '';
    const narrative = s.narrative || s.action || s.description || '';
    const summary = s.summary || s.conclusion || '';
    const header = `第${num}幕：${title}`;
    const combined = [header, setting, chars, narrative ? `叙述：${narrative}` : '', dialogue, summary ? `小结：${summary}` : '']
      .filter(Boolean)
      .join('\n');
    return combined || (typeof s === 'string' ? s : JSON.stringify(s, null, 2));
  }).join('\n\n');
}


