// 用户积分管理云函数
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
    console.log('积分管理云函数初始化完成，数据库和认证对象已创建');
} catch (error) {
    console.error('积分管理云函数初始化失败:', error);
    throw error;
}

// 集合名称
const USERS_COLLECTION = 'users';
const POINTS_HISTORY_COLLECTION = 'points_history';

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
            case 'getUserPoints':
                return await getUserPoints(userId);
            case 'addPoints':
                return await addPoints(userId, data);
            case 'deductPoints':
                return await deductPoints(userId, data);
            case 'updatePoints':
                return await updatePoints(userId, data);
            case 'getPointsHistory':
                return await getPointsHistory(userId, data);
            case 'addPointsWithHistory':
                return await addPointsWithHistory(userId, data);
            case 'dailyLoginReward':
                return await dailyLoginReward(userId, data);
            default:
                return {
                    success: false,
                    error: '未知操作'
                };
        }
    } catch (error) {
        console.error('积分管理云函数执行错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// 获取用户积分
async function getUserPoints(userId) {
    try {
        const result = await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (result.data.length === 0) {
            return {
                success: true,
                data: {
                    userId: userId,
                    points: 0,
                    message: '用户不存在或积分为0'
                }
            };
        }

        const user = result.data[0];
        const points = parseInt(user.user_point) || 0;

        return {
            success: true,
            data: {
                userId: userId,
                points: points,
                user_name: user.user_name || '用户'
            }
        };
    } catch (error) {
        console.error('获取用户积分失败:', error);
        return {
            success: false,
            error: '获取用户积分失败'
        };
    }
}

// 增加积分
async function addPoints(userId, data) {
    const { points, reason } = data;

    if (!points || points <= 0) {
        return {
            success: false,
            error: '积分数量必须大于0'
        };
    }

    try {
        // 获取当前用户信息
        const userResult = await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (userResult.data.length === 0) {
            return {
                success: false,
                error: '用户不存在'
            };
        }

        const user = userResult.data[0];
        const currentPoints = parseInt(user.user_point) || 0;
        const newPoints = currentPoints + points;

        // 更新用户积分
        await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .update({
                user_point: newPoints.toString(),
                updatedAt: new Date()
            });

        console.log(`用户 ${userId} 积分增加 ${points}，从 ${currentPoints} 变为 ${newPoints}`);

        return {
            success: true,
            data: {
                userId: userId,
                oldPoints: currentPoints,
                addedPoints: points,
                newPoints: newPoints,
                reason: reason || '积分增加'
            }
        };
    } catch (error) {
        console.error('增加用户积分失败:', error);
        return {
            success: false,
            error: '增加用户积分失败'
        };
    }
}

// 扣除积分
async function deductPoints(userId, data) {
    const { points, reason } = data;

    if (!points || points <= 0) {
        return {
            success: false,
            error: '积分数量必须大于0'
        };
    }

    try {
        // 获取当前用户信息
        const userResult = await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (userResult.data.length === 0) {
            return {
                success: false,
                error: '用户不存在'
            };
        }

        const user = userResult.data[0];
        const currentPoints = parseInt(user.user_point) || 0;

        if (currentPoints < points) {
            return {
                success: false,
                error: '积分不足，无法扣除'
            };
        }

        const newPoints = currentPoints - points;

        // 更新用户积分
        await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .update({
                user_point: newPoints.toString(),
                updatedAt: new Date()
            });

        console.log(`用户 ${userId} 积分扣除 ${points}，从 ${currentPoints} 变为 ${newPoints}`);

        return {
            success: true,
            data: {
                userId: userId,
                oldPoints: currentPoints,
                deductedPoints: points,
                newPoints: newPoints,
                reason: reason || '积分扣除'
            }
        };
    } catch (error) {
        console.error('扣除用户积分失败:', error);
        return {
            success: false,
            error: '扣除用户积分失败'
        };
    }
}

// 直接设置积分
async function updatePoints(userId, data) {
    const { points, reason } = data;

    if (points < 0) {
        return {
            success: false,
            error: '积分数量不能为负数'
        };
    }

    try {
        // 获取当前用户信息
        const userResult = await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (userResult.data.length === 0) {
            return {
                success: false,
                error: '用户不存在'
            };
        }

        const user = userResult.data[0];
        const oldPoints = parseInt(user.user_point) || 0;

        // 更新用户积分
        await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .update({
                user_point: points.toString(),
                updatedAt: new Date()
            });

        console.log(`用户 ${userId} 积分从 ${oldPoints} 设置为 ${points}`);

        return {
            success: true,
            data: {
                userId: userId,
                oldPoints: oldPoints,
                newPoints: points,
                reason: reason || '积分更新'
            }
        };
    } catch (error) {
        console.error('更新用户积分失败:', error);
        return {
            success: false,
            error: '更新用户积分失败'
        };
    }
}

// 获取积分历史记录
async function getPointsHistory(userId, data) {
    const { page = 1, limit = 20 } = data || {};

    try {
        const result = await db.collection(POINTS_HISTORY_COLLECTION)
            .where({
                userId: userId
            })
            .orderBy('createdAt', 'desc')
            .skip((page - 1) * limit)
            .limit(limit)
            .get();

        return {
            success: true,
            data: {
                history: result.data,
                page: page,
                limit: limit,
                total: result.data.length
            }
        };
    } catch (error) {
        console.error('获取积分历史失败:', error);
        return {
            success: false,
            error: '获取积分历史失败'
        };
    }
}

// 增加积分并记录历史
async function addPointsWithHistory(userId, data) {
    const { points, reason, source, orderId } = data;

    if (!points || points <= 0) {
        return {
            success: false,
            error: '积分数量必须大于0'
        };
    }

    try {
        // 先增加积分
        const addResult = await addPoints(userId, { points, reason });
        
        if (!addResult.success) {
            return addResult;
        }

        // 记录积分历史
        const historyData = {
            userId: userId,
            points: points,
            type: 'add',
            reason: reason || '积分增加',
            source: source || 'system',
            orderId: orderId || null,
            oldPoints: addResult.data.oldPoints,
            newPoints: addResult.data.newPoints,
            createdAt: new Date()
        };

        await db.collection(POINTS_HISTORY_COLLECTION).add(historyData);

        console.log(`用户 ${userId} 积分增加 ${points} 并记录历史`);

        return {
            success: true,
            data: {
                ...addResult.data,
                historyId: historyData._id
            }
        };
    } catch (error) {
        console.error('增加积分并记录历史失败:', error);
        return {
            success: false,
            error: '增加积分并记录历史失败'
        };
    }
}

// 每日登录积分奖励
async function dailyLoginReward(userId, data) {
    const { user_plan } = data || {};

    try {
        // 检查用户是否有VIP套餐
        if (!user_plan || user_plan === 'free') {
            return {
                success: true,
                data: {
                    rewarded: false,
                    reason: '免费用户不享受每日登录积分奖励'
                }
            };
        }

        // 检查今天是否已经领取过每日登录奖励
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayRewardCheck = await db.collection(POINTS_HISTORY_COLLECTION)
            .where({
                userId: userId,
                source: 'daily_login',
                createdAt: db.command.gte(todayStart).and(db.command.lt(todayEnd))
            })
            .get();

        if (todayRewardCheck.data.length > 0) {
            return {
                success: true,
                data: {
                    rewarded: false,
                    reason: '今天已经领取过每日登录积分奖励'
                }
            };
        }

        // 根据套餐类型给予积分奖励
        const pointsReward = 10000; // 1万积分

        // 增加积分并记录历史
        const result = await addPointsWithHistory(userId, {
            points: pointsReward,
            reason: `每日登录奖励 - ${user_plan}套餐`,
            source: 'daily_login'
        });

        if (result.success) {
            console.log(`用户 ${userId} 获得每日登录积分奖励 ${pointsReward}`);
            return {
                success: true,
                data: {
                    rewarded: true,
                    points: pointsReward,
                    newPoints: result.data.newPoints,
                    reason: `每日登录奖励 - ${user_plan}套餐`
                }
            };
        } else {
            return result;
        }
    } catch (error) {
        console.error('每日登录积分奖励失败:', error);
        return {
            success: false,
            error: '每日登录积分奖励失败'
        };
    }
}
