/**
 * 小说转剧本生成云函数
 * 主函数入口
 */

// 导入依赖
let cloudbase, app, db;

try {
    cloudbase = require('@cloudbase/node-sdk');
    console.log('成功导入 @cloudbase/node-sdk');
    
    // 初始化云开发
    app = cloudbase.init({
        env: 'stroycraft-1ghmi4ojd3b4a20b'
    });
    
    db = app.database();
    console.log('剧本生成云函数初始化完成');
} catch (error) {
    console.error('云函数初始化失败:', error);
    throw error;
}

// 导入自定义模块
const contentProcessor = require('./contentProcessor');
const aiService = require('./aiService');

// 主函数入口
exports.main = async (event, context) => {
    const startTime = Date.now();
    let requestId = null;
    
    try {
        // 生成请求ID
        requestId = aiService.generateRequestId();
        console.log(`[${requestId}] 开始处理请求`);
        
        // 1. 解析请求参数
        const { novel_content, options = {} } = event;
        
        // 2. 验证输入
        const validation = contentProcessor.validateContent(novel_content);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join('; '),
                code: 'VALIDATION_ERROR',
                request_id: requestId
            };
        }
        
        // 3. 验证API密钥（可选）
        const apiKey = event.headers?.authorization?.replace('Bearer ', '');
        if (!apiKey) {
            return {
                success: false,
                error: '缺少API密钥',
                code: 'AUTH_ERROR',
                request_id: requestId
            };
        }
        
        // 4. 设置默认选项
        const defaultOptions = {
            model: 'deepseek-r1',
            language: 'zh-CN',
            style: '古风情感',
            max_scenes: 5,
            include_dialogue: true
        };
        const finalOptions = { ...defaultOptions, ...options };
        
        console.log(`[${requestId}] 处理选项:`, finalOptions);
        
        // 5. 处理小说内容
        console.log(`[${requestId}] 开始处理小说内容`);
        const processedContent = await contentProcessor.processNovelContent(novel_content);
        console.log(`[${requestId}] 内容处理完成，字数: ${processedContent.word_count}`);
        
        // 6. 生成剧本
        console.log(`[${requestId}] 开始生成剧本`);
        const script = await generateScript(processedContent, finalOptions, requestId);
        
        // 7. 计算处理时间
        const processingTime = (Date.now() - startTime) / 1000;
        
        // 8. 返回结果
        console.log(`[${requestId}] 剧本生成完成，耗时: ${processingTime}秒`);
        return {
            success: true,
            data: script,
            processing_time: processingTime,
            request_id: requestId,
            metadata: {
                original_word_count: processedContent.word_count,
                sentence_count: processedContent.sentence_count,
                character_count: processedContent.characters.length,
                scene_count: script.scenes.length,
                model_used: finalOptions.model
            }
        };

    } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        console.error(`[${requestId}] 剧本生成失败:`, error);
        
        return {
            success: false,
            error: error.message,
            code: 'GENERATION_ERROR',
            processing_time: processingTime,
            request_id: requestId
        };
    }
};

/**
 * 生成完整剧本
 * @param {Object} processedContent 处理后的内容
 * @param {Object} options 选项
 * @param {string} requestId 请求ID
 * @returns {Object} 剧本对象
 */
async function generateScript(processedContent, options, requestId) {
    const { model, language } = options;
    
    try {
        // 1. 生成大纲
        console.log(`[${requestId}] 生成大纲`);
        const outline = await aiService.generateOutline(processedContent, model, language);
        
        // 2. 生成角色设定
        console.log(`[${requestId}] 生成角色设定`);
        const characters = await aiService.generateCharacterProfiles(processedContent, model, language);
        
        // 3. 生成分幕剧本
        console.log(`[${requestId}] 生成分幕剧本`);
        const scenes = await aiService.generateScenes(processedContent, characters, model, language);
        
        return {
            outline,
            characters,
            scenes
        };
        
    } catch (error) {
        console.error(`[${requestId}] 剧本生成失败:`, error);
        throw new Error(`剧本生成失败: ${error.message}`);
    }
}

/**
 * 健康检查接口
 * @param {Object} event 事件对象
 * @param {Object} context 上下文对象
 * @returns {Object} 健康状态
 */
exports.health = async (event, context) => {
    return {
        success: true,
        message: 'Script Generator API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
};
