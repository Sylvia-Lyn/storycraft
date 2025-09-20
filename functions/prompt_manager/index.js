/**
 * Prompt管理云函数
 * 提供prompt的增删改查功能
 */

// 导入依赖
let cloudbase, app, db, auth;
let isCloudbaseAvailable = false;

try {
    cloudbase = require('@cloudbase/node-sdk');
    console.log('成功导入 @cloudbase/node-sdk');

    // 初始化云开发 - 在云函数环境中，SDK会自动获取认证信息
    app = cloudbase.init({
        env: 'stroycraft-1ghmi4ojd3b4a20b'
    });

    db = app.database();
    auth = app.auth();
    isCloudbaseAvailable = true;
    console.log('Prompt管理云函数初始化完成（CloudBase 可用）');
} catch (error) {
    console.error('CloudBase SDK 初始化失败:', error?.message || error);
    // 在云函数环境中，如果初始化失败，应该抛出错误而不是继续运行
    throw error;
}

// 主函数入口
exports.main = async (event, context) => {
    const startTime = Date.now();
    let requestId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    const respond = (payload, statusCode = 200) => {
        if (!isHttp) return payload;
        
        let body;
        try {
            body = typeof payload === 'string' ? payload : JSON.stringify(payload);
            console.log(`[${requestId}] 响应体大小: ${body.length} 字符`);
        } catch (error) {
            console.error(`[${requestId}] JSON序列化失败:`, error);
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
        console.log(`[${requestId}] 处理OPTIONS预检请求`);
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: ''
        };
    }
    
    // 健康检查路由
    if (isHttp && httpMethod === 'GET' && requestPath.includes('/health')) {
        return respond({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            cloudbase_available: isCloudbaseAvailable,
            environment: {
                node_version: process.version,
                platform: process.platform
            }
        });
    }
    
    try {
        console.log(`[${requestId}] 开始处理请求: ${httpMethod} ${requestPath}`);
        
        // 检查数据库可用性
        if (!isCloudbaseAvailable || !db) {
            console.error(`[${requestId}] 数据库不可用，CloudBase初始化失败`);
            return respond({
                success: false,
                error: '数据库不可用，请检查云函数配置',
                code: 'DATABASE_UNAVAILABLE',
                request_id: requestId
            }, 503);
        }
        
        // 验证用户身份 - 支持Web应用
        let userId = null;

        console.log(`[${requestId}] 开始用户身份验证`);
        console.log(`[${requestId}] 请求头信息:`, normalizedEvent.headers);

        // 首先尝试从请求头获取用户信息（Web应用）
        if (normalizedEvent.headers && normalizedEvent.headers.authorization) {
            try {
                const authHeader = normalizedEvent.headers.authorization;
                console.log(`[${requestId}] 找到Authorization头:`, authHeader.substring(0, 20) + '...');
                
                // 处理Bearer token格式
                const token = authHeader.startsWith('Bearer ') 
                    ? authHeader.replace('Bearer ', '') 
                    : authHeader;
                
                console.log(`[${requestId}] 提取的token:`, token.substring(0, 20) + '...');
                
                // 尝试使用CloudBase的getUserInfo方法验证token
                const userInfo = await auth.getUserInfo({ token });
                console.log(`[${requestId}] getUserInfo返回:`, userInfo);
                
                if (userInfo && userInfo.uid) {
                    userId = userInfo.uid;
                    console.log(`[${requestId}] 从请求头成功获取用户信息:`, userId);
                } else {
                    console.log(`[${requestId}] token验证成功但未获取到用户ID:`, userInfo);
                }
            } catch (error) {
                console.log(`[${requestId}] 从请求头获取用户信息失败:`, error.message);
                console.log(`[${requestId}] 错误详情:`, error);
                
                // 如果是token过期错误，返回更明确的错误信息
                if (error.message && (
                    error.message.includes('token') || 
                    error.message.includes('expired') || 
                    error.message.includes('invalid') ||
                    error.message.includes('unauthorized')
                )) {
                    return respond({
                        success: false,
                        error: '登录已过期，请重新登录',
                        code: 'TOKEN_EXPIRED',
                        request_id: requestId
                    }, 401);
                }
            }
        } else {
            console.log(`[${requestId}] 未找到Authorization请求头`);
            console.log(`[${requestId}] 可用请求头:`, Object.keys(normalizedEvent.headers || {}));
        }

        // 如果请求头方式失败，尝试获取微信小程序上下文
        if (!userId) {
            try {
                const wxContext = cloudbase.getWXContext();
                if (wxContext && wxContext.OPENID) {
                    userId = wxContext.OPENID;
                    console.log(`[${requestId}] 从微信小程序上下文获取用户信息:`, userId);
                }
            } catch (error) {
                console.log(`[${requestId}] 非微信小程序环境，尝试获取Web用户信息`);
            }
        }

        // 如果微信小程序方式失败，尝试获取Web用户信息
        if (!userId) {
            try {
                const userInfo = await auth.getUserInfo();
                if (userInfo && userInfo.uid) {
                    userId = userInfo.uid;
                    console.log(`[${requestId}] 从Web用户信息获取用户ID:`, userId);
                }
            } catch (error) {
                console.log(`[${requestId}] 获取Web用户信息失败:`, error);
            }
        }

        // 临时解决方案：如果认证失败，使用默认用户ID（用于测试）
        if (!userId) {
            console.log(`[${requestId}] 认证失败，使用默认用户ID进行测试`);
            userId = 'default_user_' + Date.now();
        }

        console.log(`[${requestId}] 当前用户ID:`, userId);
        
        // 路由处理 - 直接从normalizedEvent获取action
        const action = normalizedEvent.action;
        
        switch (action) {
            case 'list':
                return await handleListPrompts(userId, normalizedEvent, requestId, respond);
            case 'get':
                return await handleGetPrompt(userId, normalizedEvent, requestId, respond);
            case 'create':
                return await handleCreatePrompt(userId, normalizedEvent, requestId, respond);
            case 'update':
                return await handleUpdatePrompt(userId, normalizedEvent, requestId, respond);
            case 'delete':
                return await handleDeletePrompt(userId, normalizedEvent, requestId, respond);
            case 'toggle_active':
                return await handleToggleActive(userId, normalizedEvent, requestId, respond);
            default:
                return respond({
                    success: false,
                    error: '无效的操作',
                    code: 'INVALID_ACTION',
                    request_id: requestId
                }, 400);
        }

    } catch (error) {
        const processingTime = (Date.now() - startTime) / 1000;
        console.error(`[${requestId}] 请求处理失败:`, error);
        
        return respond({
            success: false,
            error: error.message || '未知错误',
            code: 'REQUEST_ERROR',
            processing_time: processingTime,
            request_id: requestId
        }, 500);
    }
};

/**
 * 获取prompt列表
 */
async function handleListPrompts(userId, event, requestId, respond) {
    try {
        console.log(`[${requestId}] 获取prompt列表，用户ID: ${userId}`);
        
        const { category, isActive, search, page = 1, limit = 20 } = event;
        
        let query = db.collection('prompts');
        
        // 构建查询条件
        const whereConditions = {};
        if (category) whereConditions.category = category;
        if (isActive !== undefined) whereConditions.isActive = isActive;
        
        if (Object.keys(whereConditions).length > 0) {
            query = query.where(whereConditions);
        }
        
        // 搜索功能
        if (search) {
            // 注意：这里简化处理，实际可能需要全文搜索
            query = query.where({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ]
            });
        }
        
        // 分页
        const offset = (page - 1) * limit;
        const result = await query
            .orderBy('createdAt', 'desc')
            .skip(offset)
            .limit(limit)
            .get();
        
        // 获取总数
        const countResult = await db.collection('prompts')
            .where(whereConditions)
            .count();
        
        console.log(`[${requestId}] 查询到 ${result.data.length} 条记录`);
        
        return respond({
            success: true,
            data: result.data.map(item => ({
                id: item._id,
                ...item
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            },
            request_id: requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] 获取prompt列表失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'LIST_ERROR',
            request_id: requestId
        }, 500);
    }
}

/**
 * 获取单个prompt
 */
async function handleGetPrompt(userId, event, requestId, respond) {
    try {
        const { id } = event;
        
        if (!id) {
            return respond({
                success: false,
                error: '缺少prompt ID',
                code: 'MISSING_ID',
                request_id: requestId
            }, 400);
        }
        
        console.log(`[${requestId}] 获取prompt: ${id}，用户ID: ${userId}`);
        
        const result = await db.collection('prompts').doc(id).get();
        
        if (!result.data) {
            return respond({
                success: false,
                error: 'Prompt不存在',
                code: 'PROMPT_NOT_FOUND',
                request_id: requestId
            }, 404);
        }
        
        return respond({
            success: true,
            data: {
                id: result.data._id,
                ...result.data
            },
            request_id: requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] 获取prompt失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'GET_ERROR',
            request_id: requestId
        }, 500);
    }
}

/**
 * 创建prompt
 */
async function handleCreatePrompt(userId, event, requestId, respond) {
    try {
        const {
            name,
            description,
            category,
            content,
            variables = [],
            model = 'deepseek-r1',
            language = 'zh-CN',
            isActive = true,
            isDefault = false,
            createdBy = 'system',
            tags = []
        } = event;
        
        // 验证必填字段
        if (!name || !description || !category || !content) {
            return respond({
                success: false,
                error: '缺少必填字段：name, description, category, content',
                code: 'MISSING_REQUIRED_FIELDS',
                request_id: requestId
            }, 400);
        }
        
        console.log(`[${requestId}] 创建prompt: ${name}，用户ID: ${userId}`);
        
        // 如果设置为默认prompt，先取消其他默认prompt
        if (isDefault) {
            await db.collection('prompts')
                .where({ 
                    category, 
                    isDefault: true 
                })
                .update({ isDefault: false });
        }
        
        const now = new Date().toISOString();
        const promptData = {
            name,
            description,
            category,
            content,
            variables,
            model,
            language,
            isActive,
            isDefault,
            createdBy,
            tags,
            usageCount: 0,
            createdAt: now,
            updatedAt: now
        };
        
        const result = await db.collection('prompts').add(promptData);
        
        console.log(`[${requestId}] Prompt创建成功: ${result.id}`);
        
        return respond({
            success: true,
            data: {
                id: result.id,
                ...promptData
            },
            request_id: requestId
        }, 201);
        
    } catch (error) {
        console.error(`[${requestId}] 创建prompt失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'CREATE_ERROR',
            request_id: requestId
        }, 500);
    }
}

/**
 * 更新prompt
 */
async function handleUpdatePrompt(userId, event, requestId, respond) {
    try {
        const { id, ...updateData } = event;
        
        if (!id) {
            return respond({
                success: false,
                error: '缺少prompt ID',
                code: 'MISSING_ID',
                request_id: requestId
            }, 400);
        }
        
        console.log(`[${requestId}] 更新prompt: ${id}，用户ID: ${userId}`);
        
        // 检查prompt是否存在
        const existingPrompt = await db.collection('prompts').doc(id).get();
        if (!existingPrompt.data) {
            return respond({
                success: false,
                error: 'Prompt不存在',
                code: 'PROMPT_NOT_FOUND',
                request_id: requestId
            }, 404);
        }
        
        // 如果设置为默认prompt，先取消其他默认prompt
        if (updateData.isDefault && updateData.category) {
            await db.collection('prompts')
                .where({ 
                    category: updateData.category, 
                    isDefault: true 
                })
                .update({ isDefault: false });
        }
        
        const updatePayload = {
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        await db.collection('prompts').doc(id).update(updatePayload);
        
        // 获取更新后的数据
        const updatedPrompt = await db.collection('prompts').doc(id).get();
        
        console.log(`[${requestId}] Prompt更新成功: ${id}`);
        
        return respond({
            success: true,
            data: {
                id: updatedPrompt.data._id,
                ...updatedPrompt.data
            },
            request_id: requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] 更新prompt失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'UPDATE_ERROR',
            request_id: requestId
        }, 500);
    }
}

/**
 * 删除prompt
 */
async function handleDeletePrompt(userId, event, requestId, respond) {
    try {
        const { id } = event;
        
        if (!id) {
            return respond({
                success: false,
                error: '缺少prompt ID',
                code: 'MISSING_ID',
                request_id: requestId
            }, 400);
        }
        
        console.log(`[${requestId}] 删除prompt: ${id}，用户ID: ${userId}`);
        
        // 检查prompt是否存在
        const existingPrompt = await db.collection('prompts').doc(id).get();
        if (!existingPrompt.data) {
            return respond({
                success: false,
                error: 'Prompt不存在',
                code: 'PROMPT_NOT_FOUND',
                request_id: requestId
            }, 404);
        }
        
        await db.collection('prompts').doc(id).remove();
        
        console.log(`[${requestId}] Prompt删除成功: ${id}`);
        
        return respond({
            success: true,
            message: 'Prompt删除成功',
            request_id: requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] 删除prompt失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'DELETE_ERROR',
            request_id: requestId
        }, 500);
    }
}

/**
 * 切换prompt启用状态
 */
async function handleToggleActive(userId, event, requestId, respond) {
    try {
        const { id } = event;
        
        if (!id) {
            return respond({
                success: false,
                error: '缺少prompt ID',
                code: 'MISSING_ID',
                request_id: requestId
            }, 400);
        }
        
        console.log(`[${requestId}] 切换prompt状态: ${id}，用户ID: ${userId}`);
        
        // 获取当前状态
        const existingPrompt = await db.collection('prompts').doc(id).get();
        if (!existingPrompt.data) {
            return respond({
                success: false,
                error: 'Prompt不存在',
                code: 'PROMPT_NOT_FOUND',
                request_id: requestId
            }, 404);
        }
        
        const newActiveState = !existingPrompt.data.isActive;
        
        await db.collection('prompts').doc(id).update({
            isActive: newActiveState,
            updatedAt: new Date().toISOString()
        });
        
        console.log(`[${requestId}] Prompt状态切换成功: ${id} -> ${newActiveState}`);
        
        return respond({
            success: true,
            data: {
                id,
                isActive: newActiveState
            },
            message: `Prompt已${newActiveState ? '启用' : '禁用'}`,
            request_id: requestId
        });
        
    } catch (error) {
        console.error(`[${requestId}] 切换prompt状态失败:`, error);
        return respond({
            success: false,
            error: error.message,
            code: 'TOGGLE_ERROR',
            request_id: requestId
        }, 500);
    }
}