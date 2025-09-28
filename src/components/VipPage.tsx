import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { paymentService } from '../services/paymentService';
import { stripeService } from '../services/stripeService';
import { pointsService } from '../services/pointsService';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

type PlanType = 'yearly' | 'quarterly' | 'monthly';

// 这个配置将在组件内部动态生成，以支持多语言

// 这个配置将在组件内部动态生成，以支持多语言

const pricingData = {
    yearly: {
        chinese: { price: 849, original: 2388, discount: '3.5折', renew: 1299 },
        multilingual: { price: 1049, original: 2988, discount: '3.5折', renew: 1599 },
    },
    quarterly: {
        chinese: { price: 229, original: 597, discount: '4折', renew: 299 },
        multilingual: { price: 289, original: 747, discount: '4折', renew: 379 },
    },
    monthly: {
        chinese: { price: 89, original: 199, discount: '4.5折', renew: 99 },
        multilingual: { price: 109, original: 249, discount: '4.5折', renew: 129 },
    },
};

const VipPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, refreshUserInfo } = useAuth();
    const { t } = useI18n();
    const [plan, setPlan] = useState<PlanType>('yearly');
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [subscriptionInfo, setSubscriptionInfo] = useState<{
        user_plan: 'free' | 'chinese' | 'multilingual';
        subscription_status: 'free' | 'active' | 'expired' | 'cancelled';
        subscription_expires_at?: string | null;
    } | null>(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const selectedPricing = pricingData[plan];

    // 动态生成多语言配置
    const planConfigs = [
        {
            key: 'quarterly',
            label: t('vip.quarterly'),
            discount: t('vip.discount.quarterly'),
            highlight: 'bg-black text-white',
            tagClass: 'bg-red-500 text-white',
            desc: t('vip.desc.quarterly'),
            trial: t('vip.trial.quarterly'),
        },
        {
            key: 'monthly',
            label: t('vip.monthly'),
            discount: t('vip.discount.monthly'),
            highlight: 'bg-black text-white',
            tagClass: 'bg-red-500 text-white',
            desc: t('vip.desc.monthly'),
            trial: t('vip.trial.monthly'),
        },
        {
            key: 'yearly',
            label: t('vip.yearly'),
            discount: t('vip.discount.yearly'),
            highlight: 'bg-black text-white',
            tagClass: 'bg-red-500 text-white',
            desc: t('vip.desc.yearly'),
            trial: t('vip.trial.yearly'),
        },
    ];

    const planDurations = {
        yearly: t('vip.duration.year'),
        quarterly: t('vip.duration.quarter'),
        monthly: t('vip.duration.month'),
    };

    const planConfig = planConfigs.find(p => p.key === plan)!;

    // 计算积分奖励函数
    const calculatePointsReward = (planType: 'chinese' | 'multilingual', duration: PlanType): number => {
        // 根据VIP页面说明：购买任何套餐都立即赠送1万积分
        // 后续每天第一次登录时再增加1万积分（这个在登录时处理）
        return 10000;
    };

    // 查询用户订阅信息
    useEffect(() => {
        const fetchSubscriptionInfo = async () => {
            if (!isAuthenticated) {
                setSubscriptionLoading(false);
                return;
            }

            try {
                const result = await paymentService.getUserInfo();
                if (result.success && result.data) {
                    setSubscriptionInfo({
                        user_plan: result.data.user_plan || 'free',
                        subscription_status: result.data.subscription_status || 'free',
                        subscription_expires_at: result.data.subscription_expires_at
                    });
                }
            } catch (error) {
                console.error('获取订阅信息失败:', error);
            } finally {
                setSubscriptionLoading(false);
            }
        };

        fetchSubscriptionInfo();
    }, [isAuthenticated]);

    // 获取按钮状态和文本
    const getButtonState = (planType: 'chinese' | 'multilingual') => {
        if (!subscriptionInfo) {
            return { text: t('vip.button.purchase'), disabled: false, action: 'purchase' };
        }

        const { user_plan, subscription_status } = subscriptionInfo;
        
        // 如果订阅已过期或取消，允许购买任何服务
        if (subscription_status !== 'active') {
            return { text: t('vip.button.purchase'), disabled: false, action: 'purchase' };
        }

        // 根据当前订阅状态决定按钮状态
        if (user_plan === 'free') {
            // 免费用户，所有服务都显示"购买"
            return { text: t('vip.button.purchase'), disabled: false, action: 'purchase' };
        } else if (user_plan === 'chinese') {
            // 中文专业版用户
            if (planType === 'chinese') {
                return { text: t('vip.button.subscribed'), disabled: true, action: 'subscribed' };
            } else if (planType === 'multilingual') {
                return { text: t('vip.button.upgrade'), disabled: false, action: 'upgrade' };
            }
        } else if (user_plan === 'multilingual') {
            // 多语言专业版用户，所有服务都显示"已订阅"
            return { text: t('vip.button.subscribed'), disabled: true, action: 'subscribed' };
        }

        return { text: t('vip.button.purchase'), disabled: false, action: 'purchase' };
    };

    // 处理按钮点击
    const handleButtonClick = (planType: 'chinese' | 'multilingual') => {
        const buttonState = getButtonState(planType);
        
        if (buttonState.action === 'subscribed') {
            message.info(t('common.subscribed'));
            return;
        }
        
        // 执行购买或升级
        handlePurchase(planType);
    };

    const FeatureItem: React.FC<{ children: React.ReactNode; checked?: boolean, locked?: boolean }> = ({ children, checked = true, locked = false }) => (
        <li className="flex items-start">
            {locked
                ? <Icon icon="ri:lock-line" className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                : <Icon icon="ri:check-line" className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            }
            <span>{children}</span>
        </li>
    );

    // 处理购买按钮点击
    const handlePurchase = async (planType: 'chinese' | 'multilingual') => {
        if (!isAuthenticated) {
            message.warning(t('common.pleaseLogin'));
            navigate('/app/login');
            return;
        }

        const buttonKey = `${planType}_${plan}`;
        setLoading(prev => ({ ...prev, [buttonKey]: true }));

        try {
            // 临时实现：点击购买立即成功
            message.success(t('common.purchaseSuccess') || '购买成功！');
            
            // 计算积分奖励（根据套餐类型和时长）
            const pointsReward = calculatePointsReward(planType, plan);
            
            // 更新订阅状态为已购买
            setSubscriptionInfo(prev => ({
                user_plan: planType,
                subscription_status: 'active',
                subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 一年后过期
            }));

            // 调用积分更新API
            if (pointsReward > 0) {
                try {
                    const pointsResult = await pointsService.addPointsWithHistory({
                        points: pointsReward,
                        reason: `购买${planType}套餐奖励`,
                        source: 'vip_purchase',
                        orderId: `vip_${planType}_${plan}_${Date.now()}`
                    });

                    if (pointsResult.success) {
                        console.log(`购买${planType}套餐成功，获得${pointsReward}积分奖励`);
                        message.success(`恭喜！您获得了 ${pointsReward} 积分奖励！`);
                        
                        // 刷新用户信息以更新积分显示
                        await refreshUserInfo();
                    } else {
                        console.error('积分更新失败:', pointsResult.error);
                        message.warning('购买成功，但积分更新失败');
                    }
                } catch (error) {
                    console.error('积分更新异常:', error);
                    message.warning('购买成功，但积分更新异常');
                }
            }

            /* 注释掉原有的充值逻辑
            // 1. 创建订单
            const result = await paymentService.createOrder({
                planType,
                duration: plan
            });

            if (result.success && result.data) {
                const orderData = result.data;
                message.success(t('common.orderCreated'));
                
                // 2. 创建Stripe Checkout Session
                const stripeResult = await stripeService.createCheckoutSession({
                    orderId: orderData.orderId,
                    planType: orderData.planType,
                    duration: orderData.duration,
                    price: orderData.price,
                    planName: orderData.planName
                });
                
                if (stripeResult.success && stripeResult.sessionId) {
                    // 3. 重定向到Stripe Checkout
                    const redirectResult = await stripeService.redirectToCheckout(stripeResult.sessionId);
                    
                    if (!redirectResult.success) {
                        message.error(redirectResult.error || '重定向到支付页面失败');
                    }
                    // 如果重定向成功，用户会被带到Stripe支付页面
                } else {
                    message.error(stripeResult.error || '创建支付会话失败');
                }
            } else {
                message.error(result.error || t('common.createOrderFailed'));
            }
            */
        } catch (error) {
            console.error('购买失败:', error);
            message.error(t('common.purchaseFailed'));
        } finally {
            setLoading(prev => ({ ...prev, [buttonKey]: false }));
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center pt-4 pb-8 px-2 bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto">
                {/* 选择套餐类型 */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1.5 rounded-full shadow-sm border flex items-center space-x-2">
                        {planConfigs.map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPlan(p.key as PlanType)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${plan === p.key ? p.highlight : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {p.label} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${p.tagClass}`}>{p.discount}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {/* 免费版 */}
                    <div className="bg-white rounded-2xl p-8 border flex flex-col h-full min-h-[520px]">
                        <h3 className="text-2xl font-semibold mb-2">{t('vip.freePlan')}</h3>
                        <p className="text-4xl font-bold mb-1">0 <span className="text-lg font-normal text-gray-500">元/{planDurations[plan]}</span></p>
                        <p className="text-gray-400 mb-6 text-sm">{t('vip.price.free')}</p>
                        <button className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold text-base cursor-not-allowed">{t('vip.button.subscribed')}</button>
                        <ul className="mt-8 space-y-4 text-gray-600 text-sm flex-1">
                            <FeatureItem>{t('vip.features.free.dailyPoints')}</FeatureItem>
                            <FeatureItem>{t('vip.features.free.aiOutline')}</FeatureItem>
                            <FeatureItem>{t('vip.features.free.aiContinue')}</FeatureItem>
                            <FeatureItem>{t('vip.features.free.aiModels')}</FeatureItem>
                            <FeatureItem>{t('vip.features.free.prompts')}</FeatureItem>
                        </ul>
                    </div>

                    {/* 中文专业版 */}
                    <div className="bg-black text-white rounded-2xl p-8 transform scale-105 shadow-2xl relative flex flex-col h-full min-h-[520px]">
                        <div className="absolute -top-3 right-8 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">{planConfig.desc}</div>
                        <h3 className="text-2xl font-semibold mb-2">{t('vip.chinesePlan')}</h3>
                        <p className="text-4xl font-bold mb-1">{selectedPricing.chinese.price} <span className="text-lg font-normal text-gray-400">元/{planDurations[plan]}</span></p>
                        <p className="mb-2 text-base">
                            <span className="text-gray-400">{t('vip.price.nextRenewal', { period: planDurations[plan] })}: </span>
                            <span className="text-white font-bold">{selectedPricing.chinese.renew}元 {t('vip.price.discount')}</span>
                        </p>
                        <p className="text-gray-400 mb-6 text-sm">{planConfig.trial}</p>
                        <button
                            className={`w-full py-3 rounded-lg font-semibold text-base transition-colors ${
                                getButtonState('chinese').disabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200'
                            }`}
                            onClick={() => handleButtonClick('chinese')}
                            disabled={loading[`chinese_${plan}`] || getButtonState('chinese').disabled}
                        >
                            {loading[`chinese_${plan}`] ? t('vip.button.processing') : getButtonState('chinese').text}
                        </button>
                        <ul className="mt-8 space-y-4 text-sm flex-1">
                            <FeatureItem>{t('vip.features.chinese.dailyPoints')}</FeatureItem>
                            <FeatureItem>{t('vip.features.chinese.generate')}</FeatureItem>
                            <FeatureItem>{t('vip.features.chinese.polish')}</FeatureItem>
                            <FeatureItem>{t('vip.features.chinese.aiModels')}</FeatureItem>
                            <FeatureItem>{t('vip.features.chinese.knowledgeBase')}</FeatureItem>
                            <FeatureItem>{t('vip.features.chinese.prompts')}</FeatureItem>
                            <FeatureItem locked>{t('vip.features.chinese.courses')}</FeatureItem>
                        </ul>
                    </div>

                    {/* 多语言专业版 */}
                    <div className="bg-white rounded-2xl p-8 border flex flex-col h-full min-h-[520px] relative">
                        <div className="absolute -top-3 right-8 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">{planConfig.desc}</div>
                        <h3 className="text-2xl font-semibold mb-2">{t('vip.multilingualPlan')}</h3>
                        <p className="text-4xl font-bold mb-1">{selectedPricing.multilingual.price} <span className="text-lg font-normal text-gray-500">元/{planDurations[plan]}</span></p>
                        <p className="mb-2 text-base">
                            <span className="text-gray-400">{t('vip.price.nextRenewal', { period: planDurations[plan] })}: </span>
                            <span className="text-black font-bold">{selectedPricing.multilingual.renew}元 {t('vip.price.discount')}</span>
                        </p>
                        <p className="text-gray-400 mb-6 text-sm">{planConfig.trial}</p>
                        <button 
                            className={`w-full py-3 rounded-lg font-semibold text-base transition-colors ${
                                getButtonState('multilingual').disabled
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-800 text-white hover:bg-black'
                            }`}
                            onClick={() => handleButtonClick('multilingual')}
                            disabled={loading[`multilingual_${plan}`] || getButtonState('multilingual').disabled}
                        >
                            {loading[`multilingual_${plan}`] ? t('vip.button.processing') : getButtonState('multilingual').text}
                        </button>
                        <ul className="mt-8 space-y-4 text-gray-600 text-sm flex-1">
                            <FeatureItem>{t('vip.features.multilingual.dailyPoints')}</FeatureItem>
                            <FeatureItem>{t('vip.features.multilingual.generate')}</FeatureItem>
                            <FeatureItem>{t('vip.features.multilingual.polish')}</FeatureItem>
                            <FeatureItem>{t('vip.features.multilingual.aiModels')}</FeatureItem>
                            <FeatureItem>{t('vip.features.multilingual.knowledgeBase')}</FeatureItem>
                            <FeatureItem>{t('vip.features.multilingual.prompts')}</FeatureItem>
                            <FeatureItem>{t('vip.features.multilingual.courses')}</FeatureItem>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VipPage;