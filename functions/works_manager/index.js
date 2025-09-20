// 尝试不同的导入方式
let cloudbase, app, db, auth;

try {
    cloudbase = require('@cloudbase/node-sdk');
    console.log('成功导入 @cloudbase/node-sdk');
    
    // 初始化云开发
    app = cloudbase.init({
        env: 'stroycraft-1ghmi4ojd3b4a20b'
    });
    console.log('成功初始化云开发应用');
    
    db = app.database();
    auth = app.auth();
    console.log('云函数初始化完成，数据库和认证对象已创建');
} catch (error) {
    console.error('云函数初始化失败:', error);
    throw error;
}

// 作品集合名称
const WORKS_COLLECTION = 'works';
const USERS_COLLECTION = 'users';

// 主函数入口
exports.main = async (event, context) => {
    const { action, data } = event;

    try {
        // 验证用户身份 - 支持Web应用
        let userId = null;

        // 首先尝试从请求头获取用户信息（Web应用）
        if (event.headers && event.headers.authorization) {
            try {
                const token = event.headers.authorization.replace('Bearer ', '');
                const userInfo = await auth.getUserInfo({ token });
                if (userInfo && userInfo.uid) {
                    userId = userInfo.uid;
                    console.log('从请求头成功获取用户信息:', userId);
                }
            } catch (error) {
                console.log('从请求头获取用户信息失败:', error.message);
                // 如果是token过期错误，返回更明确的错误信息
                if (error.message && (
                    error.message.includes('token') || 
                    error.message.includes('expired') || 
                    error.message.includes('invalid') ||
                    error.message.includes('unauthorized')
                )) {
                    return {
                        success: false,
                        error: '登录已过期，请重新登录',
                        code: 401
                    };
                }
            }
        }

        // 如果请求头方式失败，尝试获取微信小程序上下文
        if (!userId) {
            try {
                const wxContext = cloudbase.getWXContext();
                if (wxContext && wxContext.OPENID) {
                    userId = wxContext.OPENID;
                }
            } catch (error) {
                console.log('非微信小程序环境，尝试获取Web用户信息');
            }
        }

        // 如果微信小程序方式失败，尝试获取Web用户信息
        if (!userId) {
            try {
                const userInfo = await auth.getUserInfo();
                if (userInfo && userInfo.uid) {
                    userId = userInfo.uid;
                }
            } catch (error) {
                console.log('获取Web用户信息失败:', error);
            }
        }

        // 如果仍然没有用户ID，返回错误
        if (!userId) {
            return {
                success: false,
                error: '用户未登录，请先登录'
            };
        }

        console.log('当前用户ID:', userId);

        switch (action) {
            case 'createWork':
                return await createWork(userId, data);
            case 'updateWork':
                return await updateWork(userId, data);
            case 'deleteWork':
                return await deleteWork(userId, data);
            case 'getWorks':
                return await getWorks(userId);
            case 'getWork':
                return await getWork(userId, data);
            case 'saveWorkContent':
                return await saveWorkContent(userId, data);
            case 'createUser':
                return await createUser(data);
            default:
                return {
                    success: false,
                    error: '未知操作'
                };
        }
    } catch (error) {
        console.error('云函数执行错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// 创建新作品
async function createWork(userId, data) {
    const { name, content = '', type = 'script' } = data;

    if (!name || !name.trim()) {
        return {
            success: false,
            error: '作品名称不能为空'
        };
    }

    try {
        const workData = {
            userId,
            name: name.trim(),
            content,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
            isSaved: true
        };

        const result = await db.collection(WORKS_COLLECTION).add(workData);

        return {
            success: true,
            data: {
                id: result.id,
                ...workData
            }
        };
    } catch (error) {
        console.error('创建作品失败:', error);
        return {
            success: false,
            error: '创建作品失败'
        };
    }
}

// 更新作品
async function updateWork(userId, data) {
    const { id, name, content, type } = data;

    if (!id) {
        return {
            success: false,
            error: '作品ID不能为空'
        };
    }

    try {
        const updateData = {
            updatedAt: new Date()
        };

        if (name !== undefined) updateData.name = name.trim();
        if (content !== undefined) updateData.content = content;
        if (type !== undefined) updateData.type = type;

        const result = await db.collection(WORKS_COLLECTION)
            .where({
                _id: id,
                userId: userId
            })
            .update(updateData);

        if (result.updated === 0) {
            return {
                success: false,
                error: '作品不存在或无权限修改'
            };
        }

        return {
            success: true,
            data: { id }
        };
    } catch (error) {
        console.error('更新作品失败:', error);
        return {
            success: false,
            error: '更新作品失败'
        };
    }
}

// 删除作品
async function deleteWork(userId, data) {
    const { id } = data;

    if (!id) {
        return {
            success: false,
            error: '作品ID不能为空'
        };
    }

    try {
        const result = await db.collection(WORKS_COLLECTION)
            .where({
                _id: id,
                userId: userId
            })
            .remove();

        if (result.deleted === 0) {
            return {
                success: false,
                error: '作品不存在或无权限删除'
            };
        }

        return {
            success: true,
            data: { id }
        };
    } catch (error) {
        console.error('删除作品失败:', error);
        return {
            success: false,
            error: '删除作品失败'
        };
    }
}

// 获取用户的所有作品
async function getWorks(userId) {
    try {
        const result = await db.collection(WORKS_COLLECTION)
            .where({
                userId: userId
            })
            .orderBy('updatedAt', 'desc')
            .get();

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('获取作品列表失败:', error);
        return {
            success: false,
            error: '获取作品列表失败'
        };
    }
}

// 获取单个作品详情
async function getWork(userId, data) {
    const { id } = data;

    if (!id) {
        return {
            success: false,
            error: '作品ID不能为空'
        };
    }

    try {
        const result = await db.collection(WORKS_COLLECTION)
            .where({
                _id: id,
                userId: userId
            })
            .get();

        if (result.data.length === 0) {
            return {
                success: false,
                error: '作品不存在'
            };
        }

        return {
            success: true,
            data: result.data[0]
        };
    } catch (error) {
        console.error('获取作品详情失败:', error);
        return {
            success: false,
            error: '获取作品详情失败'
        };
    }
}

// 保存作品内容（用于自动保存或手动保存）
async function saveWorkContent(userId, data) {
    console.log('saveWorkContent 接收到的参数:', { userId, data });
    
    const { id, content, isAutoSave = false } = data;
    
    console.log('解构后的参数:', { id, content, isAutoSave });

    if (!id) {
        return {
            success: false,
            error: '作品ID不能为空'
        };
    }

    try {
        console.log('查询条件:', { _id: id, userId: userId });
        
        // 先查询一下记录是否存在
        const existingRecord = await db.collection(WORKS_COLLECTION)
            .where({
                _id: id,
                userId: userId
            })
            .get();
            
        console.log('查询到的记录数量:', existingRecord.data.length);
        if (existingRecord.data.length > 0) {
            console.log('现有记录内容:', JSON.stringify(existingRecord.data[0], null, 2));
        }
        
        // 将 EditorJS 内容转换为纯文本字符串
        let contentText = '';
        if (content && content.blocks && Array.isArray(content.blocks)) {
            // 提取所有文本内容
            contentText = content.blocks
                .map(block => {
                    if (block.type === 'paragraph' && block.data && block.data.text) {
                        return block.data.text;
                    }
                    return '';
                })
                .filter(text => text.trim() !== '')
                .join('\n');
        }
        
        console.log('原始 EditorJS 内容:', JSON.stringify(content, null, 2));
        console.log('提取的文本内容:', contentText);
        
        // 使用 update 操作，只更新 content 字段为字符串类型
        const updateData = {
            content: contentText, // 存储为字符串而不是对象
            updatedAt: new Date(),
            isSaved: true
        };
        
        console.log('准备更新的字段:', JSON.stringify(updateData, null, 2));
        console.log('现有记录的完整内容:', JSON.stringify(existingRecord.data[0], null, 2));
        
        const result = await db.collection(WORKS_COLLECTION)
            .where({
                _id: id,
                userId: userId
            })
            .update(updateData);
            
        console.log('update 操作结果:', result);
        
        // 检查更新是否成功
        if (result.updated === 0) {
            console.error('没有记录被更新，可能记录不存在或无权限');
            return {
                success: false,
                error: '作品不存在或无权限修改'
            };
        }
        
        // 验证更新后的记录
        const updatedRecord = await db.collection(WORKS_COLLECTION)
            .where({
                _id: id,
                userId: userId
            })
            .get();
            
        if (updatedRecord.data.length > 0) {
            console.log('更新后的完整记录:', JSON.stringify(updatedRecord.data[0], null, 2));
        }

        return {
            success: true,
            data: {
                id,
                isAutoSave
            }
        };
    } catch (error) {
        console.error('保存作品内容失败:', error);
        return {
            success: false,
            error: '保存作品内容失败'
        };
    }
}

// 创建用户记录
async function createUser(data) {
    const { userId, username, email, phone } = data;

    if (!userId) {
        return {
            success: false,
            error: '用户ID不能为空'
        };
    }

    try {
        // 检查用户是否已存在
        const existingUser = await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (existingUser.data.length > 0) {
            return {
                success: false,
                error: '用户已存在'
            };
        }

        // 创建用户记录
        const userData = {
            userId: userId,
            user_name: username || '用户',
            user_email: email || '',
            user_plan: 'free',
            user_point: '0',
            subscription_expires_at: null,
            subscription_status: 'free',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection(USERS_COLLECTION).add(userData);

        return {
            success: true,
            data: {
                id: result.id,
                ...userData
            }
        };
    } catch (error) {
        console.error('创建用户记录失败:', error);
        return {
            success: false,
            error: '创建用户记录失败'
        };
    }
} 