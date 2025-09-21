import { buildFullDynamicPrompt, DynamicPromptParams } from '../utils/promptBuilder';
import { generateDeepSeekContent } from './deepseekService';
import { generateGeminiContent } from './geminiService';

export interface AIRequestConfig {
  model: 'deepseek-chat' | 'deepseek-reasoner' | 'deepseek-r1' | 'gemini';
  language?: string;
}

/**
 * 使用动态 prompt 调用 AI 模型
 * @param replacements 替换参数（用户选择的类型、模式、风格和输入内容）
 * @param token 认证 token
 * @param config AI 模型配置
 * @returns AI 生成的响应
 */
export async function callAIWithDynamicPrompt(
  replacements: Partial<DynamicPromptParams>,
  token: string,
  config: AIRequestConfig
): Promise<string> {
  try {
    console.log('开始构建动态 prompt:', replacements);

    // 1. 构建动态 prompt
    const dynamicPrompt = await buildFullDynamicPrompt(replacements, token);
    
    if (!dynamicPrompt) {
      throw new Error('无法构建动态 prompt，请检查输入框模板配置');
    }

    console.log('构建的动态 prompt:', dynamicPrompt);

    // 2. 根据配置的模型调用相应的 AI 服务
    let response: string;

    switch (config.model) {
      case 'deepseek-chat':
      case 'deepseek-reasoner':
      case 'deepseek-r1':
        response = await generateDeepSeekContent(
          dynamicPrompt,
          config.model,
          config.language || 'zh-CN'
        );
        break;
      
      case 'gemini':
        response = await generateGeminiContent(
          dynamicPrompt,
          config.language || 'zh-CN'
        );
        break;
      
      default:
        throw new Error(`不支持的模型: ${config.model}`);
    }

    return response;

  } catch (error) {
    console.error('调用 AI 服务失败:', error);
    throw error;
  }
}

/**
 * 示例：首页输入框的 AI 调用
 * @param userInput 用户输入内容
 * @param selectedType 用户选择的创作类型
 * @param selectedMode 用户选择的创作模式
 * @param selectedStyle 用户选择的题材风格
 * @param token 认证 token
 * @param model AI 模型
 * @returns AI 生成的响应
 */
export async function callHomePageAI(
  userInput: string,
  selectedType: string,
  selectedMode: string,
  selectedStyle: string,
  token: string,
  model: AIRequestConfig['model'] = 'deepseek-r1'
): Promise<string> {
  const replacements: Partial<DynamicPromptParams> = {
    '首页-创作类型': selectedType,
    '首页-创作模式': selectedMode,
    '首页-题材风格': selectedStyle,
    '输入内容': userInput
  };

  return callAIWithDynamicPrompt(replacements, token, { model });
}

/**
 * 示例：官网输入框的 AI 调用（为未来扩展预留）
 * @param userInput 用户输入内容
 * @param token 认证 token
 * @param model AI 模型
 * @returns AI 生成的响应
 */
export async function callWebsiteAI(
  userInput: string,
  token: string,
  model: AIRequestConfig['model'] = 'deepseek-r1'
): Promise<string> {
  // 这里可以扩展为支持官网特定的 prompt 模板
  const replacements: Partial<DynamicPromptParams> = {
    '输入内容': userInput
  };

  return callAIWithDynamicPrompt(replacements, token, { model });
}
