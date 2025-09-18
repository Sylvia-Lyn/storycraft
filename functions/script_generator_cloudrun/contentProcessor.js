/**
 * 小说内容处理模块
 * 负责文本预处理、角色提取、场景分割等功能
 */

/**
 * 处理小说内容
 * @param {string} content 原始小说内容
 * @returns {Object} 处理后的内容对象
 */
async function processNovelContent(content) {
    try {
        // 1. 文本预处理
        const cleanedContent = cleanText(content);
        
        // 2. 分句处理
        const sentences = splitIntoSentences(cleanedContent);
        
        // 3. 角色提取
        const characters = extractCharacters(sentences);
        
        // 4. 场景分割
        const scenes = splitIntoScenes(sentences);
        
        return {
            original_content: content,
            cleaned_content: cleanedContent,
            sentences,
            characters,
            scenes,
            word_count: cleanedContent.length,
            sentence_count: sentences.length
        };
    } catch (error) {
        console.error('内容处理失败:', error);
        throw new Error(`内容处理失败: ${error.message}`);
    }
}

/**
 * 清理文本内容
 * @param {string} text 原始文本
 * @returns {string} 清理后的文本
 */
function cleanText(text) {
    return text
        .trim()
        .replace(/\s+/g, ' ')  // 合并多个空格
        .replace(/\n+/g, '\n') // 合并多个换行
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\n，。！？；：""''（）【】《》、]/g, '') // 保留中文、英文、数字和常用标点
        .trim();
}

/**
 * 将文本分割成句子
 * @param {string} text 文本内容
 * @returns {Array} 句子数组
 */
function splitIntoSentences(text) {
    // 使用正则表达式分割句子
    const sentenceRegex = /[。！？；]+/;
    const sentences = text.split(sentenceRegex)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
    return sentences;
}

/**
 * 提取角色信息
 * @param {Array} sentences 句子数组
 * @returns {Array} 角色数组
 */
function extractCharacters(sentences) {
    const characterMap = new Map();
    
    // 常见的中文姓名模式
    const namePatterns = [
        /[一-龯]{2,4}(?=说|道|想|看|听|走|来|去|是|有|在|的|了|着|过)/g,
        /[一-龯]{2,4}(?=：|:)/g,
        /"[一-龯]{2,4}"/g
    ];
    
    sentences.forEach(sentence => {
        namePatterns.forEach(pattern => {
            const matches = sentence.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const name = match.replace(/[""：:]/g, '');
                    if (name.length >= 2 && name.length <= 4) {
                        if (!characterMap.has(name)) {
                            characterMap.set(name, {
                                name: name,
                                frequency: 0,
                                contexts: []
                            });
                        }
                        const char = characterMap.get(name);
                        char.frequency++;
                        char.contexts.push(sentence.substring(0, 100)); // 保存上下文片段
                    }
                });
            }
        });
    });
    
    // 按出现频率排序，返回前10个角色
    return Array.from(characterMap.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map(char => ({
            name: char.name,
            frequency: char.frequency,
            description: generateCharacterDescription(char)
        }));
}

/**
 * 生成角色描述
 * @param {Object} character 角色对象
 * @returns {string} 角色描述
 */
function generateCharacterDescription(character) {
    const contexts = character.contexts.slice(0, 3).join('；');
    return `在故事中出现${character.frequency}次，相关情节：${contexts}`;
}

/**
 * 将内容分割成场景
 * @param {Array} sentences 句子数组
 * @returns {Array} 场景数组
 */
function splitIntoScenes(sentences) {
    const scenes = [];
    const sentencesPerScene = Math.ceil(sentences.length / 5); // 默认分成5个场景
    
    for (let i = 0; i < sentences.length; i += sentencesPerScene) {
        const sceneSentences = sentences.slice(i, i + sentencesPerScene);
        scenes.push({
            scene_number: Math.floor(i / sentencesPerScene) + 1,
            sentences: sceneSentences,
            content: sceneSentences.join('。') + '。',
            word_count: sceneSentences.join('').length
        });
    }
    
    return scenes;
}

/**
 * 验证输入内容
 * @param {string} content 内容
 * @returns {Object} 验证结果
 */
function validateContent(content) {
    const errors = [];
    
    if (!content || typeof content !== 'string') {
        errors.push('内容不能为空');
    }
    
    if (content && content.length < 10) {
        errors.push('内容长度不能少于10个字符');
    }
    
    if (content && content.length > 100000) {
        errors.push('内容长度不能超过100,000个字符');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    processNovelContent,
    cleanText,
    splitIntoSentences,
    extractCharacters,
    splitIntoScenes,
    validateContent
};
