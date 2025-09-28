import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { message, Button, Card, Spin, Alert } from 'antd';
import { paymentService, OrderData } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, refreshUserInfo } = useAuth();
    const { t } = useI18n();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const orderId = searchParams.get('orderId');

    useEffect(() => {
        if (!isAuthenticated) {
            message.warning(t('common.pleaseLoginFirst'));
            navigate('/app/login');
            return;
        }

        if (!orderId) {
            setError('订单ID不能为空');
            setLoading(false);
            return;
        }

        loadOrder();
    }, [orderId, isAuthenticated, navigate]);

    const loadOrder = async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            const result = await paymentService.getOrder(orderId);
            
            if (result.success && result.data) {
                setOrder(result.data);
                
                // 检查订单状态
                if (result.data.status === 'paid') {
                    message.success(t('common.orderPaidSuccess'));
                    navigate('/app/vip');
                } else if (result.data.status === 'expired') {
                    setError('订单已过期，请重新下单');
                } else if (result.data.status === 'cancelled') {
                    setError('订单已取消');
                }
            } else {
                setError(result.error || '获取订单信息失败');
            }
        } catch (error) {
            console.error('加载订单失败:', error);
            setError('加载订单失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!order) return;

        setPaying(true);
        try {
            // 检查是否有微信支付参数
            if (order.paymentParams && !order.paymentParams.isTestMode) {
                // 调用微信支付
                await callWechatPay(order.paymentParams);
            } else {
                // 测试模式或没有支付参数，使用模拟支付
                message.info(t('common.redirectingToPayment'));
                
                setTimeout(async () => {
                    try {
                        const result = await paymentService.handlePaymentCallback({
                            orderId: order.orderId,
                            paymentStatus: 'success',
                            paymentData: {
                                transactionId: `TXN_${Date.now()}`,
                                paymentTime: new Date().toISOString()
                            }
                        });

                        if (result.success) {
                            message.success(t('common.paymentSuccess'));
                            navigate('/app/vip');
                        } else {
                            message.error(result.error || t('common.paymentProcessFailed'));
                        }
                    } catch (error) {
                        console.error('支付回调处理失败:', error);
                        message.error(t('common.paymentProcessFailedContact'));
                    } finally {
                        setPaying(false);
                    }
                }, 2000);
            }

        } catch (error) {
            console.error('支付失败:', error);
            message.error(t('common.paymentFailedRetry'));
            setPaying(false);
        }
    };

    // 调用微信支付
    const callWechatPay = async (payParams: any) => {
        try {
            // 检查是否在微信环境中
            if (typeof window !== 'undefined' && (window as any).wx) {
                const wx = (window as any).wx;
                
                wx.chooseWXPay({
                    timestamp: payParams.timeStamp,
                    nonceStr: payParams.nonceStr,
                    package: payParams.package,
                    signType: payParams.signType,
                    paySign: payParams.paySign,
                    success: async (res: any) => {
                        console.log('微信支付成功:', res);
                        // 支付成功，调用回调处理
                        const result = await paymentService.handlePaymentCallback({
                            orderId: order!.orderId,
                            paymentStatus: 'success',
                            paymentData: {
                                transactionId: res.transaction_id,
                                paymentTime: new Date().toISOString()
                            }
                        });

                        if (result.success) {
                            message.success(t('common.paymentSuccess'));
                            
                            // 刷新用户信息以更新积分显示
                            await refreshUserInfo();
                            
                            navigate('/app/vip');
                        } else {
                            message.error(result.error || t('common.paymentProcessFailed'));
                        }
                        setPaying(false);
                    },
                    fail: (res: any) => {
                        console.error('微信支付失败:', res);
                        message.error(t('common.paymentFailedRetry'));
                        setPaying(false);
                    },
                    cancel: () => {
                        console.log('用户取消支付');
                        message.info(t('common.paymentCancelled'));
                        setPaying(false);
                    }
                });
            } else {
                // 非微信环境，使用模拟支付
                message.warning(t('common.wechatPaymentNotSupported'));
                setTimeout(async () => {
                    try {
                        const result = await paymentService.handlePaymentCallback({
                            orderId: order!.orderId,
                            paymentStatus: 'success',
                            paymentData: {
                                transactionId: `TXN_${Date.now()}`,
                                paymentTime: new Date().toISOString()
                            }
                        });

                        if (result.success) {
                            message.success(t('common.paymentSuccess'));
                            navigate('/app/vip');
                        } else {
                            message.error(result.error || t('common.paymentProcessFailed'));
                        }
                    } catch (error) {
                        console.error('支付回调处理失败:', error);
                        message.error(t('common.paymentProcessFailedContact'));
                    } finally {
                        setPaying(false);
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('微信支付调用失败:', error);
            message.error(t('common.paymentCallFailed'));
            setPaying(false);
        }
    };

    const handleCancel = () => {
        navigate('/app/vip');
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <div className="text-center">
                        <Icon icon="ri:error-warning-line" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">订单异常</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button type="primary" onClick={() => navigate('/app/vip')}>
                            返回会员中心
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Alert message="订单不存在" type="error" />
            </div>
        );
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('zh-CN');
    };

    const getDurationText = (duration: string) => {
        const durationMap: { [key: string]: string } = {
            yearly: '年',
            quarterly: '季',
            monthly: '月'
        };
        return durationMap[duration] || duration;
    };

    const getPlanTypeText = (planType: string) => {
        const planTypeMap: { [key: string]: string } = {
            chinese: '中文专业版',
            multilingual: '多语言专业版'
        };
        return planTypeMap[planType] || planType;
    };

    return (
        <div className="h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-2xl">
                <Card className="shadow-lg">
                    <div className="text-center mb-6">
                        <Icon icon="ri:shopping-cart-line" className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-gray-800">确认订单</h1>
                        <p className="text-gray-600">请确认订单信息并完成支付</p>
                    </div>

                    {/* 订单信息 */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">订单详情</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">订单号：</span>
                                <span className="font-mono text-sm">{order.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">套餐类型：</span>
                                <span className="font-semibold">{getPlanTypeText(order.planType)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">订阅周期：</span>
                                <span>{getDurationText(order.duration)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">原价：</span>
                                <span className="line-through text-gray-500">¥{order.originalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">优惠价：</span>
                                <span className="text-red-500 font-bold text-lg">¥{order.price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">创建时间：</span>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">订单状态：</span>
                                <span className={`px-2 py-1 rounded text-sm ${
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.status === 'pending' ? '待支付' :
                                     order.status === 'paid' ? '已支付' : '已取消'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 支付方式 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">支付方式</h3>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <Icon icon="ri:wechat-pay-line" className="w-8 h-8 text-green-500 mr-3" />
                                <div>
                                    <div className="font-semibold">微信支付</div>
                                    <div className="text-sm text-gray-600">推荐使用微信支付</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 支付按钮 */}
                    <div className="flex space-x-4">
                        <Button 
                            size="large" 
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            取消订单
                        </Button>
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={handlePayment}
                            loading={paying}
                            disabled={order.status !== 'pending'}
                            className="flex-1"
                        >
                            {paying ? '支付中...' : `立即支付 ¥${order.price}`}
                        </Button>
                    </div>

                    {/* 温馨提示 */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start">
                            <Icon icon="ri:information-line" className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <p className="font-semibold mb-1">温馨提示：</p>
                                <ul className="space-y-1">
                                    <li>• 支付成功后，会员权益将立即生效</li>
                                    <li>• 支持7天无理由退款</li>
                                    <li>• 如有问题请联系客服</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PaymentPage;
