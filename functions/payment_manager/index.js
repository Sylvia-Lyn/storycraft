// 支付管理云函数
let cloudbase, app, db, auth, stripe;

try {
    cloudbase = require('@cloudbase/node-sdk');
    stripe = require('stripe');
    console.log('成功导入 @cloudbase/node-sdk 和 stripe');
    
    // 初始化云开发
    app = cloudbase.init({
        env: 'stroycraft-1ghmi4ojd3b4a20b'
    });
    console.log('成功初始化云开发应用');
    
    db = app.database();
    auth = app.auth();
    
    // 初始化Stripe
    stripe = stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
    console.log('支付云函数初始化完成，数据库、认证对象和Stripe已创建');
} catch (error) {
    console.error('支付云函数初始化失败:', error);
    throw error;
}

// 集合名称
const ORDERS_COLLECTION = 'orders';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const USERS_COLLECTION = 'users';

// 套餐配置
const PLAN_CONFIGS = {
    chinese: {
        yearly: { price: 849, original: 2388, duration: 365, name: '中文专业版-年' },
        quarterly: { price: 229, original: 597, duration: 90, name: '中文专业版-季' },
        monthly: { price: 89, original: 199, duration: 30, name: '中文专业版-月' }
    },
    multilingual: {
        yearly: { price: 1049, original: 2988, duration: 365, name: '多语言专业版-年' },
        quarterly: { price: 289, original: 747, duration: 90, name: '多语言专业版-季' },
        monthly: { price: 109, original: 249, duration: 30, name: '多语言专业版-月' }
    }
};

// 主函数入口
exports.main = async (event, context) => {
    const { action, data } = event;

    try {
        // 验证用户身份
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

        switch (action) {
            case 'createOrder':
                return await createOrder(userId, data);
            case 'createStripeCheckoutSession':
                return await createStripeCheckoutSession(userId, data);
            case 'handleStripePaymentSuccess':
                return await handleStripePaymentSuccess(userId, data);
            case 'getOrder':
                return await getOrder(userId, data);
            case 'getUserOrders':
                return await getUserOrders(userId);
            case 'handlePaymentCallback':
                return await handlePaymentCallback(data);
            case 'getUserSubscription':
                return await getUserSubscription(userId);
            case 'cancelSubscription':
                return await cancelSubscription(userId, data);
            case 'getUserInfo':
                return await getUserInfo(userId);
            case 'simulatePaymentSuccess':
                return await simulatePaymentSuccess(userId, data);
            default:
                return {
                    success: false,
                    error: '未知操作'
                };
        }
    } catch (error) {
        console.error('支付云函数执行错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// 创建Stripe Checkout Session
async function createStripeCheckoutSession(userId, data) {
    const { orderId, planType, duration, price, planName, successUrl, cancelUrl } = data;

    if (!orderId || !planType || !duration || !price || !planName) {
        return {
            success: false,
            error: '缺少必要的参数'
        };
    }

    try {
        // 创建Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'cny',
                        product_data: {
                            name: planName,
                            description: `${planType === 'chinese' ? '中文专业版' : '多语言专业版'} - ${duration === 'yearly' ? '年付' : duration === 'quarterly' ? '季付' : '月付'}`,
                        },
                        unit_amount: price * 100, // Stripe使用分为单位
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderId: orderId,
                userId: userId,
                planType: planType,
                duration: duration
            },
        });

        console.log('Stripe Checkout Session创建成功:', session.id);

        return {
            success: true,
            sessionId: session.id,
            url: session.url
        };
    } catch (error) {
        console.error('创建Stripe Checkout Session失败:', error);
        return {
            success: false,
            error: '创建支付会话失败: ' + error.message
        };
    }
}

// 处理Stripe支付成功
async function handleStripePaymentSuccess(userId, data) {
    const { sessionId, sessionData } = data;

    if (!sessionId) {
        return {
            success: false,
            error: '会话ID不能为空'
        };
    }

    try {
        // 验证Stripe会话
        let session;
        if (sessionData) {
            session = sessionData;
        } else {
            session = await stripe.checkout.sessions.retrieve(sessionId);
        }

        if (!session || session.payment_status !== 'paid') {
            return {
                success: false,
                error: '支付未完成或支付失败'
            };
        }

        const { orderId, planType, duration } = session.metadata;

        if (!orderId || !planType || !duration) {
            return {
                success: false,
                error: '订单信息不完整'
            };
        }

        // 获取套餐配置
        const planConfig = PLAN_CONFIGS[planType]?.[duration];
        if (!planConfig) {
            return {
                success: false,
                error: '无效的套餐配置'
            };
        }

        // 创建订单数据
        const orderData = {
            orderId,
            userId,
            planType,
            duration,
            planName: planConfig.name,
            price: planConfig.price,
            originalPrice: planConfig.original,
            durationDays: planConfig.duration,
            status: 'paid',
            createdAt: new Date(),
            updatedAt: new Date(),
            paymentMethod: 'stripe',
            paymentData: {
                sessionId: sessionId,
                paymentIntentId: session.payment_intent,
                amount: session.amount_total,
                currency: session.currency,
                customerEmail: session.customer_email
            },
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
        };

        // 保存订单和创建订阅
        await saveOrderAndSubscription(orderData);

        console.log('Stripe支付成功处理完成:', orderId);

        return {
            success: true,
            data: {
                orderId: orderId,
                status: 'paid',
                message: '支付成功，订阅已激活'
            }
        };
    } catch (error) {
        console.error('处理Stripe支付成功失败:', error);
        return {
            success: false,
            error: '处理支付成功失败: ' + error.message
        };
    }
}

// 创建订单
async function createOrder(userId, data) {
    const { planType, duration } = data;

    if (!planType || !duration) {
        return {
            success: false,
            error: '套餐类型和订阅周期不能为空'
        };
    }

    const planConfig = PLAN_CONFIGS[planType]?.[duration];
    if (!planConfig) {
        return {
            success: false,
            error: '无效的套餐配置'
        };
    }

    try {
        // 生成订单号
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 创建订单数据（不保存到数据库）
        const orderData = {
            orderId,
            userId,
            planType,
            duration,
            planName: planConfig.name,
            price: planConfig.price,
            originalPrice: planConfig.original,
            durationDays: planConfig.duration,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            paymentMethod: 'simulated',
            paymentData: null,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        };

        // 生成支付参数
        const paymentParams = {
            orderId,
            amount: planConfig.price,
            description: planConfig.name
        };

        console.log('订单数据生成成功:', orderData);

        return {
            success: true,
            data: {
                ...orderData,
                paymentParams
            }
        };
    } catch (error) {
        console.error('创建订单失败:', error);
        return {
            success: false,
            error: '创建订单失败'
        };
    }
}

// 获取订单详情
async function getOrder(userId, data) {
    const { orderId } = data;

    if (!orderId) {
        return {
            success: false,
            error: '订单ID不能为空'
        };
    }

    try {
        const result = await db.collection(ORDERS_COLLECTION)
            .where({
                _id: orderId,
                userId: userId
            })
            .get();

        if (result.data.length === 0) {
            return {
                success: false,
                error: '订单不存在'
            };
        }

        return {
            success: true,
            data: result.data[0]
        };
    } catch (error) {
        console.error('获取订单详情失败:', error);
        return {
            success: false,
            error: '获取订单详情失败'
        };
    }
}

// 获取用户所有订单
async function getUserOrders(userId) {
    try {
        const result = await db.collection(ORDERS_COLLECTION)
            .where({
                userId: userId
            })
            .orderBy('createdAt', 'desc')
            .get();

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('获取用户订单失败:', error);
        return {
            success: false,
            error: '获取用户订单失败'
        };
    }
}

// 处理支付回调
async function handlePaymentCallback(data) {
    const { orderId, paymentStatus, paymentData } = data;

    if (!orderId || !paymentStatus) {
        return {
            success: false,
            error: '订单ID和支付状态不能为空'
        };
    }

    try {
        // 更新订单状态
        const updateData = {
            status: paymentStatus === 'success' ? 'paid' : 'failed',
            paymentData,
            updatedAt: new Date()
        };

        const orderResult = await db.collection(ORDERS_COLLECTION)
            .where({
                _id: orderId
            })
            .update(updateData);

        if (orderResult.updated === 0) {
            return {
                success: false,
                error: '订单不存在'
            };
        }

        // 如果支付成功，创建或更新用户订阅
        if (paymentStatus === 'success') {
            const orderData = await db.collection(ORDERS_COLLECTION)
                .where({
                    _id: orderId
                })
                .get();

            if (orderData.data.length > 0) {
                const order = orderData.data[0];
                await createOrUpdateSubscription(order);
            }
        }

        return {
            success: true,
            data: {
                orderId,
                status: updateData.status
            }
        };
    } catch (error) {
        console.error('处理支付回调失败:', error);
        return {
            success: false,
            error: '处理支付回调失败'
        };
    }
}

// 创建或更新用户订阅
async function createOrUpdateSubscription(order) {
    const { userId, planType, duration, durationDays } = order;
    
    try {
        // 计算订阅到期时间
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // 检查是否已有订阅
        const existingSubscription = await db.collection(SUBSCRIPTIONS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        const subscriptionData = {
            userId,
            planType,
            duration,
            status: 'active',
            startDate: now,
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (existingSubscription.data.length > 0) {
            // 更新现有订阅
            await db.collection(SUBSCRIPTIONS_COLLECTION)
                .where({
                    userId: userId
                })
                .update(subscriptionData);
        } else {
            // 创建新订阅
            await db.collection(SUBSCRIPTIONS_COLLECTION).add(subscriptionData);
        }

        // 更新用户表中的会员状态
        await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .update({
                user_plan: planType,
                subscription_expires_at: expiresAt,
                updatedAt: new Date()
            });

        console.log('用户订阅创建/更新成功:', userId);
    } catch (error) {
        console.error('创建或更新用户订阅失败:', error);
        throw error;
    }
}

// 获取用户订阅信息
async function getUserSubscription(userId) {
    try {
        const result = await db.collection(SUBSCRIPTIONS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (result.data.length === 0) {
            return {
                success: true,
                data: {
                    status: 'free',
                    planType: 'free',
                    expiresAt: null
                }
            };
        }

        const subscription = result.data[0];
        const now = new Date();
        const isExpired = new Date(subscription.expiresAt) < now;

        return {
            success: true,
            data: {
                ...subscription,
                status: isExpired ? 'expired' : subscription.status
            }
        };
    } catch (error) {
        console.error('获取用户订阅信息失败:', error);
        return {
            success: false,
            error: '获取用户订阅信息失败'
        };
    }
}

// 取消订阅
async function cancelSubscription(userId, data) {
    try {
        const result = await db.collection(SUBSCRIPTIONS_COLLECTION)
            .where({
                userId: userId
            })
            .update({
                status: 'cancelled',
                updatedAt: new Date()
            });

        if (result.updated === 0) {
            return {
                success: false,
                error: '没有找到有效的订阅'
            };
        }

        return {
            success: true,
            data: {
                message: '订阅已取消'
            }
        };
    } catch (error) {
        console.error('取消订阅失败:', error);
        return {
            success: false,
            error: '取消订阅失败'
        };
    }
}

// 获取用户信息（包含订阅状态）
async function getUserInfo(userId) {
    try {
        // 获取用户基本信息
        const userResult = await db.collection(USERS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        let userData = {
            userId: userId,
            user_name: '用户',
            user_email: '',
            user_plan: 'free',
            user_point: '0',
            subscription_expires_at: null,
            subscription_status: 'free'
        };

        // 如果用户记录存在，获取基本信息
        if (userResult.data.length > 0) {
            const user = userResult.data[0];
            userData = {
                ...userData,
                ...user
            };
        }

        // 获取订阅信息
        const subscriptionResult = await db.collection(SUBSCRIPTIONS_COLLECTION)
            .where({
                userId: userId
            })
            .get();

        if (subscriptionResult.data.length > 0) {
            const subscription = subscriptionResult.data[0];
            const now = new Date();
            const expiresAt = new Date(subscription.expiresAt);
            
            // 检查订阅是否过期
            if (expiresAt > now && subscription.status === 'active') {
                userData.user_plan = subscription.planType;
                userData.subscription_expires_at = subscription.expiresAt;
                userData.subscription_status = 'active';
            } else {
                userData.user_plan = 'free';
                userData.subscription_status = 'expired';
            }
        }

        return {
            success: true,
            data: userData
        };
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return {
            success: false,
            error: '获取用户信息失败'
        };
    }
}

// 模拟支付成功（用于测试，不处理真实支付）
async function simulatePaymentSuccess(userId, data) {
    console.log('=== simulatePaymentSuccess 开始 ===');
    console.log('userId:', userId);
    console.log('data:', data);

    // 检查是否传递了完整的订单数据
    if (!data || !data.orderId) {
        return {
            success: false,
            error: '订单数据不能为空'
        };
    }

    try {
        // 模拟支付处理（这里可以添加真实的支付逻辑）
        console.log('模拟支付处理中...');
        
        // 模拟支付成功，更新订单状态
        const orderData = {
            ...data,
            status: 'paid',
            paymentData: { 
                method: 'simulated', 
                timestamp: new Date(),
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            updatedAt: new Date()
        };

        console.log('支付成功，开始保存数据...');

        // 支付成功后，一次性保存所有数据
        await saveOrderAndSubscription(orderData);

        console.log('数据保存完成');

        return {
            success: true,
            data: {
                orderId: orderData.orderId,
                status: 'paid',
                message: '支付成功，订阅已激活'
            }
        };
    } catch (error) {
        console.error('模拟支付成功失败:', error);
        return {
            success: false,
            error: '模拟支付成功失败'
        };
    }
}

// 保存订单和订阅数据
async function saveOrderAndSubscription(orderData) {
    try {
        console.log('开始保存订单和订阅数据...');
        
        // 1. 保存订单到数据库
        console.log('保存订单数据:', orderData);
        const orderResult = await db.collection(ORDERS_COLLECTION).add(orderData);
        console.log('订单保存成功，ID:', orderResult.id);

        // 2. 创建或更新用户订阅
        console.log('创建用户订阅...');
        await createOrUpdateSubscription(orderData);
        console.log('订阅创建成功');

        return {
            success: true,
            orderId: orderResult.id
        };
    } catch (error) {
        console.error('保存订单和订阅数据失败:', error);
        throw error;
    }
}