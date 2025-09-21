import { callPromptApi } from './apiUtils';

export interface PromptReplacementConfig {
  location: string;
  option: string;
}

export interface DynamicPromptParams {
  '首页-创作类型': string;
  '首页-创作模式': string;
  '首页-题材风格': string;
  '输入内容': string;
}

// 默认值配置
const DEFAULT_VALUES = {
  '首页-创作类型': '通用创作',
  '首页-创作模式': '标准模式',
  '首页-题材风格': '通用风格',
  '输入内容': ''
};

/**
 * 构建动态 prompt
 * @param templatePrompt 模板 prompt（包含占位符）
 * @param replacements 替换参数
 * @param token 认证 token
 * @returns 构建完成的 prompt
 */
export async function buildDynamicPrompt(
  templatePrompt: string,
  replacements: Partial<DynamicPromptParams>,
  token: string
): Promise<string> {
  let finalPrompt = templatePrompt;

  // 替换用户输入内容（直接替换，不需要查询数据库）
  if (replacements['输入内容']) {
    finalPrompt = finalPrompt.replace(/\[输入内容\]/g, replacements['输入内容']);
  }

  // 替换其他需要从数据库查询的占位符
  const placeholders = ['首页-创作类型', '首页-创作模式', '首页-题材风格'];
  
  for (const placeholder of placeholders) {
    const option = replacements[placeholder as keyof DynamicPromptParams];
    let content = '';
    
    if (option) {
      try {
        // 从数据库获取对应配置的 content
        content = await getPromptContent(placeholder, option, token) || '';
      } catch (error) {
        console.error(`获取 ${placeholder} 配置失败:`, error);
        content = '';
      }
    }
    
    // 如果没有获取到内容，尝试获取默认配置
    if (!content) {
      try {
        // 尝试从数据库获取该位置的默认配置
        const defaultContent = await getDefaultPromptContent(placeholder, token);
        if (defaultContent) {
          console.warn(`${placeholder} 指定配置缺失，使用该位置的默认配置`);
          content = defaultContent;
        } else {
          // 如果数据库也没有配置，使用硬编码默认值
          const defaultValue = DEFAULT_VALUES[placeholder as keyof typeof DEFAULT_VALUES];
          console.warn(`${placeholder} 配置完全缺失，使用硬编码默认值: ${defaultValue}`);
          content = defaultValue;
        }
      } catch (error) {
        console.error(`获取 ${placeholder} 默认配置失败:`, error);
        const defaultValue = DEFAULT_VALUES[placeholder as keyof typeof DEFAULT_VALUES];
        console.warn(`使用硬编码默认值: ${defaultValue}`);
        content = defaultValue;
      }
    }
    
    // 替换占位符
    const placeholderRegex = new RegExp(`\\[${placeholder}\\]`, 'g');
    finalPrompt = finalPrompt.replace(placeholderRegex, content);
  }

  return finalPrompt;
}

/**
 * 从数据库获取指定位置和选项的 prompt content
 * @param location 位置
 * @param option 选项
 * @param token 认证 token
 * @returns prompt content
 */
async function getPromptContent(location: string, option: string, token: string): Promise<string | null> {
  try {
    const result = await callPromptApi('list', {
      category: 'prompt-config',
      location: location,
      option: option
    }, token);

    if (result.success && result.data && result.data.length > 0) {
      // 返回第一个匹配项的 content
      return result.data[0].content || '';
    }

    return null;
  } catch (error) {
    console.error(`查询 prompt 失败 (location: ${location}, option: ${option}):`, error);
    return null;
  }
}

/**
 * 获取默认配置内容
 * @param location 位置
 * @param token 认证 token
 * @returns 默认配置的 content
 */
async function getDefaultPromptContent(location: string, token: string): Promise<string | null> {
  try {
    // 尝试获取该位置的第一个可用配置作为默认值
    const result = await callPromptApi('list', {
      category: 'prompt-config',
      location: location
    }, token);

    if (result.success && result.data && result.data.length > 0) {
      // 返回第一个配置的 content
      return result.data[0].content || '';
    }

    return null;
  } catch (error) {
    console.error(`获取默认配置失败 (location: ${location}):`, error);
    return null;
  }
}

/**
 * 获取输入框模板 prompt
 * @param token 认证 token
 * @returns 模板 prompt
 */
export async function getInputBoxTemplate(token: string): Promise<string | null> {
  console.log('[promptBuilder] 🔍 getInputBoxTemplate 开始调用');
  console.log('[promptBuilder] 🔍 查询参数:', { 
    category: 'prompt-config', 
    location: '首页-输入框',
    tokenExists: !!token 
  });
  
  try {
    const result = await callPromptApi('list', {
      category: 'prompt-config',
      location: '首页-输入框'
    }, token);

    console.log('[promptBuilder] 🔍 API 调用结果:', result);

    if (result.success && result.data && result.data.length > 0) {
      const content = result.data[0].content || '';
      console.log('[promptBuilder] ✅ 找到输入框模板');
      console.log('[promptBuilder] 🔍 模板内容:', content);
      return content;
    }

    console.log('[promptBuilder] ❌ 未找到输入框模板数据');
    console.log('[promptBuilder] 🔍 返回的数据:', result.data);
    return null;
  } catch (error) {
    console.error('[promptBuilder] ❌ 获取输入框模板失败:', error);
    console.error('[promptBuilder] 🔍 错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
}

/**
 * 构建完整的动态 prompt（包含获取模板）
 * @param replacements 替换参数
 * @param token 认证 token
 * @returns 构建完成的 prompt
 */
export async function buildFullDynamicPrompt(
  replacements: Partial<DynamicPromptParams>,
  token: string
): Promise<string | null> {
  console.log('[promptBuilder] 🔍 buildFullDynamicPrompt 开始调用');
  console.log('[promptBuilder] 🔍 参数:', { replacements, tokenExists: !!token });
  
  try {
    // 1. 获取输入框模板
    console.log('[promptBuilder] 🔍 开始获取输入框模板');
    const template = await getInputBoxTemplate(token);
    console.log('[promptBuilder] 🔍 输入框模板获取结果:', template);
    
    if (!template) {
      console.error('[promptBuilder] ❌ 未找到输入框模板');
      return null;
    }

    // 2. 构建动态 prompt
    console.log('[promptBuilder] 🔍 开始构建动态 prompt');
    const finalPrompt = await buildDynamicPrompt(template, replacements, token);
    console.log('[promptBuilder] 🔍 最终构建的 prompt:', finalPrompt);
    
    return finalPrompt;
  } catch (error) {
    console.error('[promptBuilder] ❌ 构建动态 prompt 失败:', error);
    console.error('[promptBuilder] 🔍 错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
}

/**
 * 检查配置完整性
 * @param replacements 替换参数
 * @param token 认证 token
 * @returns 配置检查结果
 */
export async function checkPromptConfigIntegrity(
  replacements: Partial<DynamicPromptParams>,
  token: string
): Promise<{
  missing: string[];
  warnings: string[];
  suggestions: string[];
}> {
  const missing: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const placeholders = ['首页-创作类型', '首页-创作模式', '首页-题材风格'];
  
  for (const placeholder of placeholders) {
    const option = replacements[placeholder as keyof DynamicPromptParams];
    
    if (!option) {
      missing.push(placeholder);
      suggestions.push(`请在 PromptConfigPage 中配置 ${placeholder}`);
      continue;
    }

    try {
      const content = await getPromptContent(placeholder, option, token);
      if (!content) {
        warnings.push(`${placeholder} 的选项 "${option}" 未找到配置`);
        suggestions.push(`请在 PromptConfigPage 中为 ${placeholder} 添加选项 "${option}" 的配置`);
      }
    } catch (error) {
      warnings.push(`${placeholder} 配置检查失败`);
    }
  }

  return { missing, warnings, suggestions };
}
