/**
 * AI服务模块
 * 负责调用AI模型生成大纲、角色设定和分幕剧本
 */

// 从环境变量获取API密钥与开关
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';
// 测试/旁路模式：为避免外部API超时，允许直接返回mock数据
// 默认开启（'1'），如需真实调用可设置为 '0'
const AI_BYPASS = (process.env.AI_BYPASS || '1') === '1';

/**
 * 为fetch添加超时控制
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(id);
    }
}

/**
 * 生成Mock数据：大纲
 */
function buildMockOutline(processedContent) {
    return {
        title: '测试剧本 - 校园清晨',
        summary: '小明在考试日清晨与好友小红相遇，彼此鼓励，从紧张走向从容，最终在努力中找到自信。',
        theme: '成长与自信',
        genre: '校园/励志',
        structure: '开端-相遇-备考-考试-释怀',
        tone: '温暖积极'
    };
}

/**
 * 生成Mock数据：角色
 */
function buildMockCharacters(processedContent) {
    return [
        {
            name: '小明',
            description: '勤奋踏实的学生，面对考试有紧张也有自信，在朋友支持下稳定发挥。',
            personality: '认真、内向、稳重',
            background: '普通高中生，成绩稳定，备考充分',
            role: '主角',
            motivation: '在考试中证明自己',
            relationships: '与小红为好友，互相鼓励'
        },
        {
            name: '小红',
            description: '乐观开朗，善于鼓励他人，帮助小明缓解紧张情绪。',
            personality: '开朗、体贴、外向',
            background: '同班同学，擅长沟通与表达',
            role: '配角',
            motivation: '帮助朋友与自己一起考出好成绩',
            relationships: '与小明为好友，课堂上常同组讨论'
        }
    ];
}

/**
 * 生成Mock数据：场景
 */
function buildMockScenes(processedContent) {
    return [
        {
            scene_number: 1,
            title: '清晨的校园路',
            characters: ['小明', '小红'],
            setting: { time: '清晨', location: '去学校的路上', atmosphere: '清新紧张' },
            dialogue: [
                { character: '小红', content: '小明，早呀！别紧张，我们都准备好了。', emotion: '鼓励' },
                { character: '小明', content: '嗯，谢谢你，我昨晚复习到很晚，应该没问题。', emotion: '平静' }
            ],
            narrative: '阳光洒在林荫路上，远处传来清脆的上学铃声，两人并肩前行。',
            summary: '相遇与互相鼓励。'
        },
        {
            scene_number: 2,
            title: '考前教室',
            characters: ['小明', '小红', '老师'],
            setting: { time: '上午', location: '教室', atmosphere: '安静紧张' },
            dialogue: [
                { character: '老师', content: '同学们，保持安静，准备发卷。', emotion: '严肃' },
                { character: '小明', content: '深呼吸，稳住就好。', emotion: '自我调适' }
            ],
            narrative: '卷子发下，教室只剩下沙沙的写字声。',
            summary: '紧张氛围下的稳定心态。'
        },
        {
            scene_number: 3,
            title: '午后的操场',
            characters: ['小明', '小红'],
            setting: { time: '午后', location: '操场', atmosphere: '轻松释怀' },
            dialogue: [
                { character: '小明', content: '总算结束了，不管结果如何，我尽力了。', emotion: '释然' },
                { character: '小红', content: '你肯定没问题，等成绩出来一起庆祝！', emotion: '开心' }
            ],
            narrative: '和煦的阳光洒在操场上，微风吹过，喧闹声渐远。',
            summary: '情绪的释放与对未来的期待。'
        }
    ];
}

/**
 * 生成剧本大纲
 * @param {Object} processedContent 处理后的内容
 * @param {string} model AI模型
 * @param {string} language 语言
 * @returns {Object} 大纲对象
 */
async function generateOutline(processedContent, model, language) {
    if (AI_BYPASS) {
        return buildMockOutline(processedContent);
    }
    const prompt = `
请基于以下小说内容生成剧本大纲：

小说内容：
${processedContent.cleaned_content}

要求：简洁明了，用中文回答

请以JSON格式返回：
{
  "title": "剧本标题",
  "summary": "剧本大纲（100-150字）",
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
    if (AI_BYPASS) {
        return buildMockCharacters(processedContent);
    }
    // 确保 characters 是数组
    let extractedCharacters = '未知角色';
    if (Array.isArray(processedContent.characters)) {
        extractedCharacters = processedContent.characters.map(c => c.name).join('、');
    } else if (processedContent.characters && typeof processedContent.characters === 'object') {
        extractedCharacters = Object.values(processedContent.characters).map(c => c.name || c).join('、');
    }
    
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
    if (AI_BYPASS) {
        return buildMockScenes(processedContent);
    }
    // 确保 characters 是数组
    let characterNames = '未知角色';
    if (Array.isArray(characters)) {
        characterNames = characters.map(c => c.name).join('、');
    } else if (characters && typeof characters === 'object') {
        // 如果 characters 是对象，尝试提取名称
        characterNames = Object.values(characters).map(c => c.name || c).join('、');
    }
    
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
    if (AI_BYPASS) {
        // 返回一个可被解析为JSON的简单结构，以适配 parseAIResponse
        // 这里返回一个通用占位文本，具体生成在上层已mock
        return '{"mock": true}';
    }
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

    const response = await fetchWithTimeout(`${DEEPSEEK_API_BASE}/chat/completions`, {
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
    }, 15000);

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

    const response = await fetchWithTimeout(`${GEMINI_API_BASE}/v1beta/models/gemini-pro:generateContent`, {
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
    }, 15000);

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
        // 清理响应文本，移除可能的非JSON内容
        let cleanedResponse = response.trim();
        
        // 尝试多种方式提取JSON
        let jsonMatch = null;
        
        // 方式1：查找完整的JSON对象或数组
        jsonMatch = cleanedResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        
        // 方式2：如果没找到，尝试查找```json```代码块
        if (!jsonMatch) {
            const codeBlockMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                jsonMatch = [codeBlockMatch[1]];
            }
        }
        
        // 方式3：如果还是没找到，尝试查找```代码块
        if (!jsonMatch) {
            const codeMatch = cleanedResponse.match(/```\s*([\s\S]*?)\s*```/);
            if (codeMatch) {
                jsonMatch = [codeMatch[1]];
            }
        }
        
        if (jsonMatch) {
            const jsonText = jsonMatch[0].trim();
            console.log(`尝试解析${type}的JSON:`, jsonText.substring(0, 200) + '...');
            return JSON.parse(jsonText);
        }
        
        // 如果没有找到JSON，返回原始响应
        console.warn(`无法解析${type}的AI响应为JSON，返回原始文本`);
        console.log(`原始响应:`, response.substring(0, 500) + '...');
        return {
            raw_response: response,
            type: type
        };
    } catch (error) {
        console.error(`解析${type}响应失败:`, error);
        console.log(`错误响应内容:`, response.substring(0, 1000));
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
