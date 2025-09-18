/**
 * 小说转剧本生成云函数
 * 主函数入口
 */

// 导入依赖（CloudBase 可选）
let cloudbase, app, db;
let isCloudbaseAvailable = false;

try {
    cloudbase = require('@cloudbase/node-sdk');
    console.log('成功导入 @cloudbase/node-sdk');

    // 初始化云开发（如需使用数据库等能力）
    app = cloudbase.init({
        env: 'stroycraft-1ghmi4ojd3b4a20b'
    });

    db = app.database();
    isCloudbaseAvailable = true;
    console.log('剧本生成云函数初始化完成（CloudBase 可用）');
} catch (error) {
    // 在HTTP触发场景下，CloudBase SDK 不是必须的，出错时继续运行
    console.warn('CloudBase SDK 不可用，将在无 CloudBase 环境下运行。原因:', error?.message || error);
}

// 导入自定义模块
let contentProcessor, aiService;
try {
    contentProcessor = require('./contentProcessor');
    aiService = require('./aiService');
    console.log('自定义模块导入成功');
} catch (error) {
    console.error('自定义模块导入失败:', error);
    // 如果模块导入失败，提供基本的错误处理
    contentProcessor = {
        validateContent: (content) => ({ valid: true, errors: [] }),
        processNovelContent: async (content) => {
            throw new Error('内容处理模块不可用');
        }
    };
    aiService = {
        generateRequestId: () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generateOutline: async () => { throw new Error('AI服务不可用'); },
        generateCharacterProfiles: async () => { throw new Error('AI服务不可用'); },
        generateScenes: async () => { throw new Error('AI服务不可用'); }
    };
}

// 主函数入口
exports.main = async (event, context) => {
    const startTime = Date.now();
    let requestId = null;
    
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
        
        // 处理CloudBase标准API格式
        if (normalizedEvent.headers) {
            // 确保headers是对象格式
            if (typeof normalizedEvent.headers === 'string') {
                try {
                    normalizedEvent.headers = JSON.parse(normalizedEvent.headers);
                } catch (_) {
                    // 保留原样
                }
            }
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
    
    const requestPath = normalizedEvent.path || normalizedEvent.requestContext?.path || normalizedEvent.httpPath || '';
    const httpMethod = (normalizedEvent.httpMethod || normalizedEvent.method || '').toUpperCase();
    const isHttp = Boolean(normalizedEvent.httpMethod || normalizedEvent.headers || normalizedEvent.requestContext);

    // CORS 头与响应包装
    const corsHeaders = {
        'Access-Control-Allow-Origin': normalizedEvent.headers?.origin || '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json; charset=utf-8'
    };
    const respond = (payload, statusCode = 200) => {
        if (!isHttp) return payload;
        
        let body;
        try {
            body = typeof payload === 'string' ? payload : JSON.stringify(payload);
            console.log(`[${requestId || 'unknown'}] 响应体大小: ${body.length} 字符`);
        } catch (error) {
            console.error(`[${requestId || 'unknown'}] JSON序列化失败:`, error);
            body = JSON.stringify({
                success: false,
                error: '响应序列化失败',
                code: 'SERIALIZATION_ERROR'
            });
            statusCode = 500;
        }
        
        return {
            statusCode,
            headers: corsHeaders,
            body
        };
    };

    // 预检请求直接返回
    if (isHttp && httpMethod === 'OPTIONS') {
        return respond('', 204);
    }
    
    // 健康检查路由
    if (isHttp && httpMethod === 'GET' && requestPath.includes('/health')) {
        return respond({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            cloudbase_available: isCloudbaseAvailable,
            modules_loaded: {
                contentProcessor: !!contentProcessor,
                aiService: !!aiService
            },
            environment: {
                node_version: process.version,
                platform: process.platform
            }
        });
    }
    
    try {
        // 生成请求ID
        requestId = aiService.generateRequestId();
        console.log(`[${requestId}] 开始处理请求`);
        
        // 1. 解析请求参数
        const { novel_content, options = {}, headers, task_id, action } = normalizedEvent;
        
        // 2. 处理任务状态查询请求
        if (action === 'status' && task_id) {
            return await handleTaskStatusQuery(task_id, requestId, respond);
        }
        
        // 3. 处理新的剧本生成请求
        if (!novel_content) {
            return respond({
                success: false,
                error: '缺少小说内容',
                code: 'MISSING_CONTENT',
                request_id: requestId
            }, 400);
        }
        
        // 4. 验证输入
        const validation = contentProcessor.validateContent(novel_content);
        if (!validation.valid) {
            return respond({
                success: false,
                error: validation.errors.join('; '),
                code: 'VALIDATION_ERROR',
                request_id: requestId
            }, 400);
        }
        
        // 5. 内容长度限制
        const MAX_CONTENT_LENGTH = 50000;
        if (novel_content && novel_content.length > MAX_CONTENT_LENGTH) {
            return respond({
                success: false,
                error: `内容长度不能超过${MAX_CONTENT_LENGTH}字符`,
                code: 'CONTENT_TOO_LONG',
                request_id: requestId
            }, 413);
        }
        
        // 6. 设置默认选项
        const defaultOptions = {
            model: 'deepseek-r1',
            language: 'zh-CN',
            style: '古风情感',
            max_scenes: 5,
            include_dialogue: true
        };
        const finalOptions = { ...defaultOptions, ...options };
        
        console.log(`[${requestId}] 处理选项:`, finalOptions);
        
        // 7. 创建任务记录
        const taskId = `task_${requestId}_${Date.now()}`;
        const taskRecord = {
            task_id: taskId,
            status: 'pending',
            created_at: new Date().toISOString(),
            options: finalOptions,
            novel_content_length: novel_content.length,
            progress: 0,
            message: '任务已创建，等待处理...'
        };
        
        // 8. 保存任务状态到数据库（如果可用）
        if (isCloudbaseAvailable && db) {
            try {
                await saveTaskRecord(taskId, taskRecord, requestId);
                console.log(`[${requestId}] 任务记录已保存: ${taskId}`);
            } catch (dbError) {
                console.warn(`[${requestId}] 保存任务记录失败:`, dbError);
                // 数据库错误不应该阻止任务提交，继续执行
            }
        } else {
            console.log(`[${requestId}] 数据库不可用，跳过任务记录保存`);
        }
        
        // 9. 启动异步处理（不等待完成）
        processScriptAsync(taskId, novel_content, finalOptions, requestId).catch(error => {
            console.error(`[${requestId}] 异步处理失败:`, error);
            // 更新任务状态为失败
            updateTaskStatus(taskId, 'failed', 0, `处理失败: ${error.message}`);
        });
        
        // 10. 立即返回任务ID
        console.log(`[${requestId}] 任务已提交，ID: ${taskId}`);
        return respond({
            success: true,
            task_id: taskId,
            status: 'pending',
            message: '任务已提交，正在处理中...',
            estimated_time: '3-5分钟',
            request_id: requestId
        }, 202); // 202 Accepted

    } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        console.error(`[${requestId}] 请求处理失败:`, error);
        
        // 提供更详细的错误信息
        let errorMessage = error.message || '未知错误';
        let errorCode = 'REQUEST_ERROR';
        
        if (error.message.includes('模块导入失败')) {
            errorCode = 'MODULE_IMPORT_ERROR';
        } else if (error.message.includes('数据库')) {
            errorCode = 'DATABASE_ERROR';
        } else if (error.message.includes('AI服务')) {
            errorCode = 'AI_SERVICE_ERROR';
        }
        
        return respond({
            success: false,
            error: errorMessage,
            code: errorCode,
            processing_time: processingTime,
            request_id: requestId,
            debug_info: {
                cloudbase_available: isCloudbaseAvailable,
                modules_loaded: {
                    contentProcessor: !!contentProcessor,
                    aiService: !!aiService
                }
            }
        }, 500);
    }
};

/**
 * 异步处理剧本生成任务
 * @param {string} taskId 任务ID
 * @param {string} novelContent 小说内容
 * @param {Object} options 选项
 * @param {string} requestId 请求ID
 */
async function processScriptAsync(taskId, novelContent, options, requestId) {
    const startTime = Date.now(); // 记录开始时间
    
    try {
        console.log(`[${requestId}] 开始异步处理任务: ${taskId}`);
        
        // 更新任务状态为处理中
        await updateTaskStatus(taskId, 'processing', 10, '开始处理小说内容...');
        
        // 1. 处理小说内容
        console.log(`[${requestId}] 开始处理小说内容`);
        const processedContent = await contentProcessor.processNovelContent(novelContent);
        console.log(`[${requestId}] 内容处理完成，字数: ${processedContent.word_count}`);
        
        await updateTaskStatus(taskId, 'processing', 30, '内容处理完成，开始生成大纲...');
        
        // 2. 生成剧本
        console.log(`[${requestId}] 开始生成剧本`);
        const script = await generateScriptAsync(processedContent, options, requestId, taskId);
        
        // 3. 计算处理时间
        const processingTime = (Date.now() - startTime) / 1000;
        
        // 4. 更新任务状态为完成
        const result = {
            success: true,
            data: script,
            processing_time: processingTime,
            request_id: requestId,
            metadata: {
                original_word_count: processedContent.word_count,
                sentence_count: processedContent.sentence_count,
                character_count: processedContent.characters.length,
                scene_count: script.scenes.length,
                model_used: options.model
            }
        };
        
        await updateTaskStatus(taskId, 'completed', 100, '剧本生成完成！', result);
        console.log(`[${requestId}] 任务完成: ${taskId}`);
        
    } catch (error) {
        console.error(`[${requestId}] 异步处理失败:`, error);
        await updateTaskStatus(taskId, 'failed', 0, `处理失败: ${error.message}`);
    }
}

/**
 * 异步生成完整剧本（带进度更新）
 * @param {Object} processedContent 处理后的内容
 * @param {Object} options 选项
 * @param {string} requestId 请求ID
 * @param {string} taskId 任务ID
 * @returns {Object} 剧本对象
 */
async function generateScriptAsync(processedContent, options, requestId, taskId) {
    const { model, language } = options;
    
    try {
        // 1. 生成大纲
        console.log(`[${requestId}] 生成大纲`);
        await updateTaskStatus(taskId, 'processing', 50, '正在生成剧本大纲...');
        const outline = await aiService.generateOutline(processedContent, model, language);
        
        // 2. 生成角色设定
        console.log(`[${requestId}] 生成角色设定`);
        await updateTaskStatus(taskId, 'processing', 70, '正在生成角色设定...');
        const characters = await aiService.generateCharacterProfiles(processedContent, model, language);
        
        // 3. 生成分幕剧本
        console.log(`[${requestId}] 生成分幕剧本`);
        await updateTaskStatus(taskId, 'processing', 90, '正在生成分幕剧本...');
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
 * 保存任务记录（带自动创建集合功能）
 * @param {string} taskId 任务ID
 * @param {Object} taskRecord 任务记录
 * @param {string} requestId 请求ID
 */
async function saveTaskRecord(taskId, taskRecord, requestId) {
    try {
        await db.collection('script_tasks').doc(taskId).set(taskRecord);
    } catch (error) {
        if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
            console.log(`[${requestId}] 集合不存在，尝试创建集合...`);
            try {
                // 尝试创建集合（通过添加一个临时文档）
                await db.collection('script_tasks').add({
                    _temp: true,
                    created_at: new Date().toISOString()
                });
                // 删除临时文档
                const tempDocs = await db.collection('script_tasks').where({_temp: true}).get();
                for (const doc of tempDocs.data) {
                    await doc.ref.remove();
                }
                // 重新保存任务记录
                await db.collection('script_tasks').doc(taskId).set(taskRecord);
                console.log(`[${requestId}] 集合创建成功，任务记录已保存`);
            } catch (createError) {
                console.warn(`[${requestId}] 创建集合失败:`, createError);
                throw createError;
            }
        } else {
            throw error;
        }
    }
}

/**
 * 更新任务状态
 * @param {string} taskId 任务ID
 * @param {string} status 状态
 * @param {number} progress 进度百分比
 * @param {string} message 状态消息
 * @param {Object} result 结果数据（可选）
 */
async function updateTaskStatus(taskId, status, progress, message, result = null) {
    const updateData = {
        status,
        progress,
        message,
        updated_at: new Date().toISOString()
    };
    
    if (result) {
        updateData.result = result;
    }
    
    if (isCloudbaseAvailable && db) {
        try {
            await db.collection('script_tasks').doc(taskId).update(updateData);
            console.log(`[${taskId}] 任务状态已更新: ${status} (${progress}%)`);
        } catch (dbError) {
            if (dbError.code === 'DATABASE_COLLECTION_NOT_EXIST') {
                console.warn(`[${taskId}] 集合不存在，跳过状态更新`);
            } else {
                console.warn(`[${taskId}] 更新任务状态失败:`, dbError);
            }
            // 数据库错误不应该阻止任务处理，继续执行
        }
    } else {
        console.log(`[${taskId}] 数据库不可用，跳过状态更新: ${status} (${progress}%)`);
    }
}

/**
 * 处理任务状态查询
 * @param {string} taskId 任务ID
 * @param {string} requestId 请求ID
 * @param {Function} respond 响应函数
 * @returns {Object} 响应对象
 */
async function handleTaskStatusQuery(taskId, requestId, respond) {
    try {
        console.log(`[${requestId}] 查询任务状态: ${taskId}`);
        
        if (!isCloudbaseAvailable || !db) {
            return respond({
                success: false,
                error: '数据库不可用，无法查询任务状态',
                code: 'DATABASE_UNAVAILABLE',
                request_id: requestId
            }, 503);
        }
        
        let taskDoc;
        try {
            console.log(`[${requestId}] 尝试查询任务: ${taskId}`);
            console.log(`[${requestId}] 查询集合: script_tasks`);
            
            // 使用where查询而不是doc查询，因为doc查询可能有问题
            const taskQuery = await db.collection('script_tasks').where({
                task_id: taskId
            }).get();
            
            console.log(`[${requestId}] 查询结果数量: ${taskQuery.data.length}`);
            console.log(`[${requestId}] 完整查询结果:`, JSON.stringify(taskQuery.data, null, 2));
            
            if (taskQuery.data.length > 0) {
                taskDoc = {
                    exists: true,
                    data: () => taskQuery.data[0],
                    id: taskQuery.data[0]._id || taskQuery.data[0].task_id
                };
            } else {
                taskDoc = {
                    exists: false,
                    data: () => null,
                    id: null
                };
            }
        } catch (queryError) {
            if (queryError.code === 'DATABASE_COLLECTION_NOT_EXIST') {
                return respond({
                    success: false,
                    error: '数据库集合不存在，请先提交一个任务',
                    code: 'COLLECTION_NOT_EXIST',
                    request_id: requestId
                }, 404);
            } else {
                throw queryError;
            }
        }
        
        if (!taskDoc.exists) {
            console.log(`[${requestId}] 任务不存在，尝试列出所有任务进行调试...`);
            try {
                const allTasks = await db.collection('script_tasks').limit(5).get();
                console.log(`[${requestId}] 集合中的任务数量: ${allTasks.data.length}`);
                console.log(`[${requestId}] 现有任务ID:`, allTasks.data.map(t => t._id || t.task_id || t.id));
                console.log(`[${requestId}] 完整任务列表:`, JSON.stringify(allTasks.data, null, 2));
            } catch (listError) {
                console.error(`[${requestId}] 列出任务失败:`, listError);
            }
            
            return respond({
                success: false,
                error: '任务不存在',
                code: 'TASK_NOT_FOUND',
                request_id: requestId,
                debug_info: {
                    searched_task_id: taskId,
                    collection_name: 'script_tasks'
                }
            }, 404);
        }
        
        const taskData = taskDoc.data();
        console.log(`[${requestId}] 任务状态: ${taskData.status}`);
        
        return respond({
            success: true,
            task_id: taskId,
            status: taskData.status,
            progress: taskData.progress || 0,
            message: taskData.message || '',
            created_at: taskData.created_at,
            updated_at: taskData.updated_at,
            result: taskData.result || null,
            request_id: requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] 查询任务状态失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'QUERY_ERROR',
            request_id: requestId
        }, 500);
    }
}

/**
 * 生成完整剧本（保留原函数用于兼容）
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

// 健康检查接口已移除

