/**
 * Gemini API服务
 * 负责与Google Gemini API通信
 */

import config from '../config';

// Gemini API配置
const GEMINI_API_KEY = config.GEMINI_API_KEY;
const API_BASE_URL = config.GEMINI_API_BASE;
const GEMINI_MODEL = "gemini-pro"; // 使用Gemini Pro模型

/**
 * 生成Gemini AI内容
 * @param prompt 用户输入的提示
 * @returns 生成的文本内容
 */
export async function generateGeminiContent(prompt: string): Promise<string> {
  try {
    const API_URL = `${API_BASE_URL}/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 根据Gemini API的响应格式提取内容
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('无法从API响应中提取内容');
    }
  } catch (error) {
    console.error("Gemini API调用失败:", error);
    return "抱歉，在生成内容时发生错误。请稍后再试。";
  }
}

/**
 * 检查Gemini API是否可用
 * @returns API状态
 */
export async function checkGeminiApiStatus(): Promise<boolean> {
  try {
    // 简单的API状态检查
    const API_URL = `${API_BASE_URL}/v1beta/models/${GEMINI_MODEL}?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(API_URL, {
      method: 'GET'
    });
    
    return response.ok;
  } catch (error) {
    console.error("Gemini API状态检查失败:", error);
    return false;
  }
}

/**
 * 使用Gemini生成场景内容
 * @param sceneDescription 场景描述
 * @returns 生成的场景内容
 */
export async function generateSceneContent(sceneDescription: string): Promise<string> {
  const prompt = `请根据以下场景描述，生成一段详细的场景内容：\n\n${sceneDescription}`;
  return generateGeminiContent(prompt);
}

/**
 * 使用Gemini润色文本内容
 * @param content 需要润色的内容
 * @returns 润色后的内容
 */
export async function polishContent(content: string): Promise<string> {
  const prompt = `请对以下文本内容进行润色，使其更加生动、流畅，同时保持原意：\n\n${content}`;
  return generateGeminiContent(prompt);
}
