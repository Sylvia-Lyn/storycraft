/**
 * AI服务模块
 * 负责调用AI模型生成大纲、角色设定和分幕剧本
 */

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';

// 导入工具函数
const { retry } = require('./utils');

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
        const response = await retry(() => callAI(prompt, model, language), 2, 2000);
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
        const response = await retry(() => callAI(prompt, model, language), 2, 2000);
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
        const response = await retry(() => callAI(prompt, model, language), 2, 2000);
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
        }),
        signal: AbortSignal.timeout(120000) // 120 seconds timeout for AI calls
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
        }),
        signal: AbortSignal.timeout(120000) // 120 seconds timeout for AI calls
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
            
            // 尝试直接解析
            try {
                return JSON.parse(jsonText);
            } catch (parseError) {
                console.warn(`直接解析${type}失败，尝试修复JSON:`, parseError.message);
                
                // 尝试修复JSON
                const fixedJson = fixJsonString(jsonText);
                if (fixedJson) {
                    try {
                        return JSON.parse(fixedJson);
                    } catch (fixError) {
                        console.warn(`修复后的JSON仍然无法解析:`, fixError.message);
                    }
                }
                
                // 如果修复失败，尝试提取有效内容
                const extractedContent = extractValidContent(jsonText, type);
                if (extractedContent) {
                    return extractedContent;
                }
                
                // 最后返回错误信息
                return {
                    error: parseError.message,
                    raw_response: jsonText,
                    type: type
                };
            }
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
 * 修复JSON字符串中的常见问题
 * @param {string} jsonString 原始JSON字符串
 * @returns {string|null} 修复后的JSON字符串
 */
function fixJsonString(jsonString) {
    try {
        let fixed = jsonString;
        
        // 1. 移除BOM标记
        fixed = fixed.replace(/^\uFEFF/, '');
        
        // 2. 修复常见的JSON问题
        // 移除控制字符（除了必要的换行符和制表符）
        fixed = fixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // 3. 修复不正确的引号
        // 将中文引号替换为英文引号
        fixed = fixed.replace(/[""]/g, '"');
        fixed = fixed.replace(/['']/g, "'");
        
        // 修复字符串内部的中文引号（需要转义）
        // 处理字符串值中的中文引号，将其转义
        fixed = fixed.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"');
        
        // 更全面的中文引号处理
        // 处理字符串值中的中文引号，将其转义为英文引号
        fixed = fixed.replace(/"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"');
        fixed = fixed.replace(/"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"');
        
        // 4. 修复可能的编码问题
        // 移除或替换可能导致解析错误的字符
        fixed = fixed.replace(/[\u200B-\u200D\uFEFF]/g, ''); // 零宽字符
        
        // 5. 尝试修复不完整的JSON
        // 如果JSON以逗号结尾，移除它
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        
        // 6. 修复可能的字符串转义问题
        // 确保字符串中的引号被正确转义
        fixed = fixed.replace(/(?<!\\)"(?=.*")/g, '\\"');
        
        return fixed;
    } catch (error) {
        console.error('修复JSON时出错:', error);
        return null;
    }
}

/**
 * 从损坏的JSON中提取有效内容
 * @param {string} jsonString 原始JSON字符串
 * @param {string} type 内容类型
 * @returns {Object|Array|null} 提取的内容
 */
function extractValidContent(jsonString, type) {
    try {
        // 根据类型尝试不同的提取策略
        if (type === 'characters') {
            return extractCharactersFromText(jsonString);
        } else if (type === 'outline') {
            return extractOutlineFromText(jsonString);
        } else if (type === 'scenes') {
            return extractScenesFromText(jsonString);
        }
        
        return null;
    } catch (error) {
        console.error(`提取${type}内容时出错:`, error);
        return null;
    }
}

/**
 * 从文本中提取角色信息
 * @param {string} text 包含角色信息的文本
 * @returns {Array|null} 角色数组
 */
function extractCharactersFromText(text) {
    try {
        const characters = [];
        
        // 尝试使用正则表达式提取角色信息
        const characterMatches = text.match(/\{[^}]*"name"[^}]*\}/g);
        
        if (characterMatches) {
            for (const match of characterMatches) {
                try {
                    // 尝试解析单个角色对象
                    const character = JSON.parse(match);
                    if (character.name) {
                        characters.push(character);
                    }
                } catch (e) {
                    // 如果单个角色解析失败，尝试手动提取关键信息
                    const nameMatch = match.match(/"name"\s*:\s*"([^"]+)"/);
                    const descMatch = match.match(/"description"\s*:\s*"([^"]+)"/);
                    
                    if (nameMatch) {
                        characters.push({
                            name: nameMatch[1],
                            description: descMatch ? descMatch[1] : '角色描述提取失败',
                            personality: '性格特点提取失败',
                            background: '背景故事提取失败',
                            role: '角色类型提取失败',
                            motivation: '角色动机提取失败',
                            relationships: '角色关系提取失败'
                        });
                    }
                }
            }
        }
        
        return characters.length > 0 ? characters : null;
    } catch (error) {
        console.error('提取角色信息时出错:', error);
        return null;
    }
}

/**
 * 从文本中提取大纲信息
 * @param {string} text 包含大纲信息的文本
 * @returns {Object|null} 大纲对象
 */
function extractOutlineFromText(text) {
    try {
        const outline = {};
        
        // 尝试提取各个字段
        const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
        const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/);
        const themeMatch = text.match(/"theme"\s*:\s*"([^"]+)"/);
        const genreMatch = text.match(/"genre"\s*:\s*"([^"]+)"/);
        
        if (titleMatch) outline.title = titleMatch[1];
        if (summaryMatch) outline.summary = summaryMatch[1];
        if (themeMatch) outline.theme = themeMatch[1];
        if (genreMatch) outline.genre = genreMatch[1];
        
        // 设置默认值
        outline.structure = outline.structure || '故事结构提取失败';
        outline.tone = outline.tone || '整体基调提取失败';
        
        return Object.keys(outline).length > 0 ? outline : null;
    } catch (error) {
        console.error('提取大纲信息时出错:', error);
        return null;
    }
}

/**
 * 从文本中提取场景信息
 * @param {string} text 包含场景信息的文本
 * @returns {Array|null} 场景数组
 */
function extractScenesFromText(text) {
    try {
        const scenes = [];
        
        // 尝试使用正则表达式提取场景信息
        const sceneMatches = text.match(/\{[^}]*"scene_number"[^}]*\}/g);
        
        if (sceneMatches) {
            for (const match of sceneMatches) {
                try {
                    // 尝试解析单个场景对象
                    const scene = JSON.parse(match);
                    if (scene.scene_number) {
                        scenes.push(scene);
                    }
                } catch (e) {
                    // 如果单个场景解析失败，尝试手动提取关键信息
                    const numberMatch = match.match(/"scene_number"\s*:\s*(\d+)/);
                    const titleMatch = match.match(/"title"\s*:\s*"([^"]+)"/);
                    
                    if (numberMatch) {
                        scenes.push({
                            scene_number: parseInt(numberMatch[1]),
                            title: titleMatch ? titleMatch[1] : '场景标题提取失败',
                            characters: [],
                            setting: {
                                time: '时间提取失败',
                                location: '地点提取失败',
                                atmosphere: '氛围提取失败'
                            },
                            dialogue: [],
                            narrative: '场景描述提取失败',
                            summary: '场景总结提取失败'
                        });
                    }
                }
            }
        }
        
        return scenes.length > 0 ? scenes : null;
    } catch (error) {
        console.error('提取场景信息时出错:', error);
        return null;
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
