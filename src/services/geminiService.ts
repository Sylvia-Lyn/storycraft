/**
 * Gemini API服务
 * 负责与Google Gemini API通信
 */

import config from '../config';

// Gemini API配置
const GEMINI_API_KEY = config.GEMINI_API_KEY;
const API_BASE_URL = config.GEMINI_API_BASE;
const GEMINI_MODEL = "models/gemini-2.5-flash-preview-04-17"; // 使用Gemini 2.5 Flash Preview模型

/**
 * 获取可用的Gemini模型列表
 */
async function listGeminiModels(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/v1beta/models?key=${GEMINI_API_KEY}`);
    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status}`);
    }
    const data = await response.json();
    return data.models.map((model: any) => model.name);
  } catch (error) {
    console.error("获取Gemini模型列表失败:", error);
    return [];
  }
}

/**
 * 选择最适合的Gemini模型
 */
async function selectGeminiModel(): Promise<string> {
  const availableModels = await listGeminiModels();
  console.log("可用的Gemini模型:", availableModels);

  // 优先选择列表中的模型
  const preferredModels = [
    "models/gemini-2.5-flash-preview-04-17",
    "models/gemini-2.5-flash-preview-05-20",
    "models/gemini-2.5-pro-preview-03-25",
    "models/gemini-2.5-pro-preview-05-06"
  ];

  for (const model of preferredModels) {
    if (availableModels.includes(model)) {
      console.log(`选择Gemini模型: ${model}`);
      return model;
    }
  }

  // 如果没有找到首选模型，返回默认模型
  console.log(`使用默认Gemini模型: ${GEMINI_MODEL}`);
  return GEMINI_MODEL;
}

/**
 * 解析错误响应中的重试延迟
 */
function parseRetryDelay(errorText: string): number {
  try {
    const error = JSON.parse(errorText);
    if (error.error?.details) {
      for (const detail of error.error.details) {
        if (detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo") {
          const delayStr = detail.retryDelay;
          // 将 "39s" 转换为毫秒
          return parseInt(delayStr) * 1000;
        }
      }
    }
  } catch (e) {
    console.error("解析重试延迟失败:", e);
  }
  return 5000; // 默认5秒
}

/**
 * 生成Gemini AI内容
 * @param prompt 用户输入的提示
 * @returns 生成的文本内容
 */
export async function generateGeminiContent(prompt: string): Promise<string> {
  let retryCount = 0;
  const MAX_RETRIES = 3;

  while (retryCount < MAX_RETRIES) {
    try {
      // 选择最适合的模型
      const selectedModel = await selectGeminiModel();

      // 使用v1beta版本的API
      const API_URL = `${API_BASE_URL}/v1beta/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;

      console.log(`发送到Gemini API的请求 (尝试 ${retryCount + 1}/${MAX_RETRIES}):`, {
        url: API_URL,
        model: selectedModel,
        prompt: prompt
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,  // 增加输出token限制
            topP: 0.95,
            topK: 40,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API错误响应:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });

        // 如果是配额限制错误，等待指定时间后重试
        if (response.status === 429) {
          const retryDelay = parseRetryDelay(errorText);
          console.log(`配额限制，等待 ${retryDelay / 1000} 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryCount++;
          continue;
        }

        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      console.log("Gemini API响应:", data);

      // 添加更详细的响应结构日志
      if (data.candidates && data.candidates.length > 0) {
        console.log("候选响应:", data.candidates[0]);
        if (data.candidates[0].content) {
          console.log("响应内容:", data.candidates[0].content);
        }
      }

      // 根据Gemini API的响应格式提取内容
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.candidates?.[0]?.text) {
        // 处理可能的替代响应格式
        return data.candidates[0].text;
      } else if (data.text) {
        // 处理直接返回text的情况
        return data.text;
      } else if (data.candidates?.[0]?.content?.role === 'model') {
        // 处理只有role的情况
        console.log("模型返回了空响应，可能是token限制问题");
        throw new Error('模型返回了空响应，请尝试减少输入长度或调整token限制');
      } else {
        console.error("无法从API响应中提取内容，响应结构:", JSON.stringify(data, null, 2));
        throw new Error('无法从API响应中提取内容');
      }
    } catch (error) {
      console.error("Gemini API调用失败:", error);
      retryCount++;

      if (retryCount >= MAX_RETRIES) {
        return "抱歉，在生成内容时发生错误。请稍后再试。";
      }

      // 等待一段时间后重试
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // 指数退避，最大10秒
      console.log(`等待 ${delay / 1000} 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return "抱歉，在生成内容时发生错误。请稍后再试。";
}

/**
 * 检查Gemini API是否可用
 * @returns API状态
 */
export async function checkGeminiApiStatus(): Promise<boolean> {
  try {
    // 检查模型列表API
    const models = await listGeminiModels();
    return models.length > 0;
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
