const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloudbase.init({
    env: 'stroycraft-1ghmi4ojd3b4a20b'
});

const db = app.database();
const auth = app.auth();

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
                }
            } catch (error) {
                console.log('从请求头获取用户信息失败:', error);
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
    const { id, content, isAutoSave = false } = data;

    if (!id) {
        return {
            success: false,
            error: '作品ID不能为空'
        };
    }

    try {
        const updateData = {
            content,
            updatedAt: new Date(),
            isSaved: true
        };

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