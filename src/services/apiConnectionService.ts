/**
 * API连接检查服务
 * 负责在调用AI模型API之前检查连接状态
 */

import { checkDeepSeekApiStatus } from './deepseekService';
import { checkGeminiApiStatus } from './geminiService';

export interface ConnectionCheckResult {
  isConnected: boolean;
  error?: string;
  model: string;
}

/**
 * 检查指定模型的API连接状态
 * @param model 模型名称
 * @returns 连接检查结果
 */
export async function checkApiConnection(model: string): Promise<ConnectionCheckResult> {
  console.log(`[API连接检查] 开始检查模型 ${model} 的连接状态`);
  
  try {
    let isConnected: boolean;
    
    switch (model) {
      case 'gemini':
      case 'Gemini':
        console.log('[API连接检查] 检查Gemini API连接...');
        isConnected = await checkGeminiApiStatus();
        break;
        
      case 'deepseek-r1':
      case 'deepseek-chat':
      case 'deepseek-reasoner':
      case 'DeepSeek':
        console.log('[API连接检查] 检查DeepSeek API连接...');
        isConnected = await checkDeepSeekApiStatus();
        break;
        
      default:
        console.warn(`[API连接检查] 未知的模型: ${model}`);
        return {
          isConnected: false,
          error: `不支持的模型: ${model}`,
          model
        };
    }
    
    console.log(`[API连接检查] ${model} 连接状态: ${isConnected ? '正常' : '失败'}`);
    
    return {
      isConnected,
      error: isConnected ? undefined : `${model} API服务不可用`,
      model
    };
    
  } catch (error) {
    console.error(`[API连接检查] 检查 ${model} 连接时发生错误:`, error);
    
    // 检查是否是网络错误
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        isConnected: false,
        error: '网络错误',
        model
      };
    }
    
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : '连接检查失败',
      model
    };
  }
}

/**
 * 批量检查多个模型的连接状态
 * @param models 模型列表
 * @returns 连接检查结果列表
 */
export async function checkMultipleApiConnections(models: string[]): Promise<ConnectionCheckResult[]> {
  console.log(`[API连接检查] 批量检查模型连接: ${models.join(', ')}`);
  
  const results = await Promise.all(
    models.map(model => checkApiConnection(model))
  );
  
  const connectedModels = results.filter(r => r.isConnected).map(r => r.model);
  const failedModels = results.filter(r => !r.isConnected).map(r => r.model);
  
  console.log(`[API连接检查] 批量检查完成 - 可用: ${connectedModels.join(', ')}, 不可用: ${failedModels.join(', ')}`);
  
  return results;
}

/**
 * 检查是否有任何可用的AI模型
 * @param models 模型列表
 * @returns 是否有可用模型
 */
export async function hasAnyAvailableModel(models: string[]): Promise<boolean> {
  const results = await checkMultipleApiConnections(models);
  return results.some(result => result.isConnected);
}
