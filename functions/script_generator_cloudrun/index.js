/**
 * 小说转剧本生成云托管函数
 * 主函数入口 - 适配函数型云托管
 */

// 导入依赖（CloudBase 可选）
let cloudbase, app, db;
let isCloudbaseAvailable = false;

// 导入自定义模块
const contentProcessor = require('./contentProcessor');
const aiService = require('./aiService');

// 主函数入口
exports.main = async (event, context) => {
    const startTime = Date.now();
    let requestId = null;
    
    // 在函数型云托管中，tcb.init 需要在入口函数内部调用，并传入 context 参数
    try {
        cloudbase = require('@cloudbase/node-sdk');
        console.log('成功导入 @cloudbase/node-sdk');

        // 初始化云开发（在函数型云托管中需要传入 context 参数）
        app = cloudbase.init({
            context: context,  // 关键修改：传入 context 参数
            env: 'stroycraft-1ghmi4ojd3b4a20b'
        });

        db = app.database();
        isCloudbaseAvailable = true;
        console.log('剧本生成云托管函数初始化完成（CloudBase 可用）');
    } catch (error) {
        // 在HTTP触发场景下，CloudBase SDK 不是必须的，出错时继续运行
        console.warn('CloudBase SDK 不可用，将在无 CloudBase 环境下运行。原因:', error?.message || error);
    }
    
    // 统一事件格式
    let normalizedEvent = {};
    try {
        if (!event) {
            normalizedEvent = {};
        } else if (typeof event === 'string') {
            try {
                normalizedEvent = JSON.parse(event);
            } catch (_) {
                normalizedEvent = { rawBody: event };
            }
        } else if (typeof event === 'object') {
            normalizedEvent = { ...event };
        }
        // 如果 body 是字符串，尝试解析
        if (typeof normalizedEvent.body === 'string') {
            try {
                const parsedBody = JSON.parse(normalizedEvent.body);
                normalizedEvent = { ...normalizedEvent, ...parsedBody };
            } catch (_) {
                // 保留原样
            }
        }
    } catch (e) {
        console.warn('事件标准化失败:', e?.message || e);
    }
    
    // 添加调试信息
    console.log('原始 event:', JSON.stringify(event, null, 2));
    console.log('标准化后 event:', JSON.stringify(normalizedEvent, null, 2));
    
    const requestPath = normalizedEvent.path || normalizedEvent.requestContext?.path || normalizedEvent.httpPath || '';
    const httpMethod = (normalizedEvent.httpMethod || normalizedEvent.method || '').toUpperCase();
    
    console.log('请求路径:', requestPath);
    console.log('HTTP方法:', httpMethod);
    
    // 早期健康检查 - 如果没有任何内容，直接返回健康状态
    if (!normalizedEvent.novel_content && !normalizedEvent.body && httpMethod === 'GET') {
        console.log('检测到GET请求且无内容，执行早期健康检查');
        return await exports.health(normalizedEvent, context);
    }
    
    // 强制健康检查 - 如果路径包含health，直接返回
    if (requestPath && requestPath.includes('health')) {
        console.log('检测到health路径，强制执行健康检查');
        return await exports.health(normalizedEvent, context);
    }
    
    // 健康检查路由（兼容多种格式）
    try {
        const queryParams = normalizedEvent.queryStringParameters || normalizedEvent.query || {};
        console.log('查询参数:', queryParams);
        
        // 更宽松的健康检查条件
        const isHealthCheck = (
            // 检查路径包含health
            (requestPath && requestPath.includes('health')) ||
            // 检查查询参数
            (queryParams && (queryParams.health === '1' || queryParams.health === 'true')) ||
            // 检查HTTP方法（GET请求且没有novel_content）
            (httpMethod === 'GET' && !normalizedEvent.novel_content) ||
            // 检查原始事件路径
            (event && typeof event === 'object' && event.path && event.path.includes('health')) ||
            // 检查是否有health字段
            (normalizedEvent.health === true || normalizedEvent.health === '1' || normalizedEvent.health === 'true') ||
            // 检查URL路径（更宽松的匹配）
            (requestPath === '/health' || requestPath === '/health/' || requestPath.endsWith('/health'))
        );
        
        console.log('是否健康检查:', isHealthCheck);
        
        if (isHealthCheck) {
            console.log('执行健康检查');
            const healthResult = await exports.health(normalizedEvent, context);
            console.log('健康检查结果:', JSON.stringify(healthResult, null, 2));
            return healthResult;
        }
    } catch (e) {
        console.warn('健康检查路由判断出错:', e?.message || e);
    }
    
    try {
        // 生成请求ID
        requestId = aiService.generateRequestId();
        console.log(`[${requestId}] 开始处理请求`);
        
        // 1. 解析请求参数
        const { novel_content, options = {}, headers } = normalizedEvent;
        
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
        
        // 2.5. 内容长度限制
        const MAX_CONTENT_LENGTH = 50000;
        if (novel_content && novel_content.length > MAX_CONTENT_LENGTH) {
            return {
                success: false,
                error: `内容长度不能超过${MAX_CONTENT_LENGTH}字符`,
                code: 'CONTENT_TOO_LONG',
                request_id: requestId
            };
        }
        
        // 3. 设置默认选项（已移除API密钥验证）
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
    console.log('健康检查被调用');
    console.log('健康检查 event:', JSON.stringify(event, null, 2));
    console.log('健康检查 context:', JSON.stringify(context, null, 2));
    
    return {
        success: true,
        message: 'Script Generator CloudRun API is healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        deployment_type: 'cloudrun',
        debug_info: {
            event: event,
            context: context,
            cloudbase_available: isCloudbaseAvailable
        }
    };
};