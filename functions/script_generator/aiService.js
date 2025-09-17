/**
 * AI服务模块
 * 负责调用AI模型生成大纲、角色设定和分幕剧本
 */

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';

/**
 * 生成剧本大纲
 * @param {Object} processedContent 处理后的内容
 * @param {string} model AI模型
 * @param {string} language 语言
 * @returns {Object} 大纲对象
 */
async function generateOutline(processedContent, model, language) {
    const prompt = `
请基于以下小说内容生成剧本大纲：

小说内容：
${processedContent.cleaned_content}

要求：
1. 提取核心主题和情感线
2. 确定剧本类型（爱情、悬疑、喜剧、古风等）
3. 概括主要情节发展
4. 分析故事结构和节奏
5. 用中文回答

请以JSON格式返回：
{
  "title": "剧本标题",
  "summary": "剧本大纲（200-300字）",
  "theme": "主题",
  "genre": "类型",
  "structure": "故事结构",
  "tone": "整体基调"
}
`;

    try {
        const response = await callAI(prompt, model, language);
        return parseAIResponse(response, 'outline');
    } catch (error) {
        console.error('生成大纲失败:', error);
        throw new Error(`生成大纲失败: ${error.message}`);
    }
}

/**
 * 生成角色设定
 * @param {Object} processedContent 处理后的内容
 * @param {string} model AI模型
 * @param {string} language 语言
 * @returns {Array} 角色数组
 */
async function generateCharacterProfiles(processedContent, model, language) {
    const extractedCharacters = processedContent.characters.map(c => c.name).join('、');
    
    const prompt = `
请基于以下小说内容和提取的角色信息生成详细的角色设定：

小说内容：
${processedContent.cleaned_content}

提取的角色：
${extractedCharacters}

要求：
1. 为每个主要角色创建详细档案
2. 分析角色性格、背景、动机
3. 确定角色关系和冲突
4. 用中文回答

请以JSON格式返回角色数组：
[
  {
    "name": "角色名",
    "description": "角色描述（50-100字）",
    "personality": "性格特点",
    "background": "背景故事",
    "role": "主角/配角/反派",
    "motivation": "角色动机",
    "relationships": "与其他角色的关系"
  }
]
`;

    try {
        const response = await callAI(prompt, model, language);
        return parseAIResponse(response, 'characters');
    } catch (error) {
        console.error('生成角色设定失败:', error);
        throw new Error(`生成角色设定失败: ${error.message}`);
    }
}

/**
 * 生成分幕剧本
 * @param {Object} processedContent 处理后的内容
 * @param {Array} characters 角色数组
 * @param {string} model AI模型
 * @param {string} language 语言
 * @returns {Array} 分幕剧本数组
 */
async function generateScenes(processedContent, characters, model, language) {
    const characterNames = characters.map(c => c.name).join('、');
    
    const prompt = `
请基于以下小说内容、角色设定和场景分割生成分幕剧本：

小说内容：
${processedContent.cleaned_content}

角色设定：
${JSON.stringify(characters, null, 2)}

场景分割：
${JSON.stringify(processedContent.scenes.map(s => ({
    scene_number: s.scene_number,
    content: s.content
})), null, 2)}

要求：
1. 将小说内容转换成剧本格式
2. 每个场景包含：场景设置、角色对话、动作描述
3. 对话要符合角色性格和关系
4. 场景要有明确的时间和地点
5. 保持原故事的核心情节
6. 用中文回答

请以JSON格式返回场景数组：
[
  {
    "scene_number": 1,
    "title": "场景标题",
    "characters": ["角色1", "角色2"],
    "setting": {
      "time": "时间（如：白天/夜晚/黄昏）",
      "location": "地点（如：咖啡厅/公园/家中）",
      "atmosphere": "氛围（如：温馨/紧张/浪漫）"
    },
    "dialogue": [
      {
        "character": "角色名",
        "content": "对话内容",
        "emotion": "情感（如：开心/愤怒/悲伤）"
      }
    ],
    "narrative": "场景描述和动作指导",
    "summary": "场景总结"
  }
]
`;

    try {
        const response = await callAI(prompt, model, language);
        return parseAIResponse(response, 'scenes');
    } catch (error) {
        console.error('生成分幕剧本失败:', error);
        throw new Error(`生成分幕剧本失败: ${error.message}`);
    }
}

/**
 * 调用AI服务
 * @param {string} prompt 提示词
 * @param {string} model 模型名称
 * @param {string} language 语言
 * @returns {string} AI响应
 */
async function callAI(prompt, model, language) {
    if (model === 'gemini') {
        return await callGeminiAPI(prompt, language);
    } else {
        return await callDeepSeekAPI(prompt, language);
    }
}

/**
 * 调用DeepSeek API
 * @param {string} prompt 提示词
 * @param {string} language 语言
 * @returns {string} AI响应
 */
async function callDeepSeekAPI(prompt, language) {
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API密钥未配置');
    }

    const languageInstruction = language === 'zh-CN' ? '请你以中文回答。\n\n' : '';
    const fullPrompt = languageInstruction + prompt;

    const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: fullPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 调用Gemini API
 * @param {string} prompt 提示词
 * @param {string} language 语言
 * @returns {string} AI响应
 */
async function callGeminiAPI(prompt, language) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API密钥未配置');
    }

    const response = await fetch(`${GEMINI_API_BASE}/v1beta/models/gemini-pro:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * 解析AI响应
 * @param {string} response AI响应文本
 * @param {string} type 响应类型
 * @returns {Object|Array} 解析后的数据
 */
function parseAIResponse(response, type) {
    try {
        // 尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // 如果没有找到JSON，返回原始响应
        console.warn(`无法解析${type}的AI响应为JSON，返回原始文本`);
        return {
            raw_response: response,
            type: type
        };
    } catch (error) {
        console.error(`解析${type}响应失败:`, error);
        return {
            raw_response: response,
            type: type,
            error: error.message
        };
    }
}

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
function generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = {
    generateOutline,
    generateCharacterProfiles,
    generateScenes,
    callAI,
    generateRequestId
};
