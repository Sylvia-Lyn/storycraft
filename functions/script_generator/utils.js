/**
 * 工具函数模块
 * 包含错误处理、验证、日志等功能
 */

/**
 * 错误代码定义
 */
const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    CONTENT_PROCESSING_ERROR: 'CONTENT_PROCESSING_ERROR',
    AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
    GENERATION_ERROR: 'GENERATION_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

/**
 * 创建标准错误响应
 * @param {string} message 错误消息
 * @param {string} code 错误代码
 * @param {string} requestId 请求ID
 * @param {number} processingTime 处理时间
 * @returns {Object} 错误响应对象
 */
function createErrorResponse(message, code, requestId, processingTime = 0) {
    return {
        success: false,
        error: message,
        code: code,
        processing_time: processingTime,
        request_id: requestId,
        timestamp: new Date().toISOString()
    };
}

/**
 * 创建成功响应
 * @param {Object} data 响应数据
 * @param {string} requestId 请求ID
 * @param {number} processingTime 处理时间
 * @param {Object} metadata 元数据
 * @returns {Object} 成功响应对象
 */
function createSuccessResponse(data, requestId, processingTime, metadata = {}) {
    return {
        success: true,
        data: data,
        processing_time: processingTime,
        request_id: requestId,
        timestamp: new Date().toISOString(),
        metadata: metadata
    };
}

/**
 * 验证API密钥
 * @param {string} apiKey API密钥
 * @returns {boolean} 是否有效
 */
function validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    
    // 简单的API密钥格式验证
    // 实际项目中应该从数据库或配置中验证
    return apiKey.length >= 10 && apiKey.startsWith('sk_');
}

/**
 * 验证请求参数
 * @param {Object} params 请求参数
 * @returns {Object} 验证结果
 */
function validateRequestParams(params) {
    const errors = [];
    
    if (!params.novel_content) {
        errors.push('缺少novel_content参数');
    } else if (typeof params.novel_content !== 'string') {
        errors.push('novel_content必须是字符串类型');
    } else if (params.novel_content.length < 100) {
        errors.push('novel_content长度不能少于100个字符');
    } else if (params.novel_content.length > 100000) {
        errors.push('novel_content长度不能超过100,000个字符');
    }
    
    // 验证选项参数
    if (params.options) {
        if (typeof params.options !== 'object') {
            errors.push('options必须是对象类型');
        } else {
            const { model, language, max_scenes } = params.options;
            
            if (model && !['deepseek-r1', 'gemini'].includes(model)) {
                errors.push('model必须是deepseek-r1或gemini');
            }
            
            if (language && !['zh-CN', 'en-US', 'ja-JP'].includes(language)) {
                errors.push('language必须是zh-CN、en-US或ja-JP');
            }
            
            if (max_scenes && (typeof max_scenes !== 'number' || max_scenes < 1 || max_scenes > 20)) {
                errors.push('max_scenes必须是1-20之间的数字');
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 记录请求日志
 * @param {string} requestId 请求ID
 * @param {string} action 操作
 * @param {Object} data 数据
 */
function logRequest(requestId, action, data = {}) {
    console.log(`[${requestId}] ${action}:`, JSON.stringify(data, null, 2));
}

/**
 * 记录错误日志
 * @param {string} requestId 请求ID
 * @param {string} action 操作
 * @param {Error} error 错误对象
 */
function logError(requestId, action, error) {
    console.error(`[${requestId}] ${action} 失败:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}

/**
 * 重试机制
 * @param {Function} fn 要重试的函数
 * @param {number} maxRetries 最大重试次数
 * @param {number} delay 重试延迟（毫秒）
 * @returns {Promise} 重试结果
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                console.log(`重试第${i + 1}次，${delay}ms后重试`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // 指数退避
            }
        }
    }
    
    throw lastError;
}

/**
 * 超时控制
 * @param {Promise} promise 要控制的Promise
 * @param {number} timeout 超时时间（毫秒）
 * @returns {Promise} 带超时的Promise
 */
function withTimeout(promise, timeout = 30000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`操作超时，超过${timeout}ms`));
            }, timeout);
        })
    ]);
}

/**
 * 清理敏感信息
 * @param {Object} obj 要清理的对象
 * @returns {Object} 清理后的对象
 */
function sanitizeObject(obj) {
    const sensitiveKeys = ['api_key', 'token', 'password', 'secret'];
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '***';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    
    return sanitized;
}

/**
 * 生成随机字符串
 * @param {number} length 长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 格式化处理时间
 * @param {number} milliseconds 毫秒数
 * @returns {string} 格式化后的时间
 */
function formatProcessingTime(milliseconds) {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    } else {
        return `${(milliseconds / 1000).toFixed(2)}s`;
    }
}

module.exports = {
    ERROR_CODES,
    createErrorResponse,
    createSuccessResponse,
    validateApiKey,
    validateRequestParams,
    logRequest,
    logError,
    retry,
    withTimeout,
    sanitizeObject,
    generateRandomString,
    formatProcessingTime
};
