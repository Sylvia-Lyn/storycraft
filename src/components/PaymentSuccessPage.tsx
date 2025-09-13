import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { message } from 'antd';
import { stripeService } from '../services/stripeService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, updateUser } = useAuth();
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing'>('processing');
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            const sessionId = searchParams.get('session_id');
            
            if (!sessionId) {
                message.error('支付会话ID缺失');
                setPaymentStatus('failed');
                setLoading(false);
                return;
            }

            try {
                // 验证支付会话并处理支付成功
                const result = await stripeService.verifySession(sessionId);
                
                if (result.success) {
                    setPaymentStatus('success');
                    setPaymentData(result.session);
                    
                    // 刷新用户信息
                    const userInfoResult = await paymentService.getUserInfo();
                    if (userInfoResult.success && userInfoResult.data) {
                        const userData = userInfoResult.data;
                        const updatedUser = {
                            ...user,
                            user_plan: userData.user_plan,
                            subscription_expires_at: userData.subscription_expires_at,
                            subscription_status: userData.subscription_status
                        };
                        
                        // 更新AuthContext中的用户信息
                        if (updateUser) {
                            updateUser(updatedUser);
                        }
                        
                        const planName = userData.user_plan === 'chinese' ? t('common.planNames.chinese') : t('common.planNames.multilingual');
                        message.success(t('common.congratulations', { plan: planName }));
                    }
                } else {
                    setPaymentStatus('failed');
                    message.error(result.error || '支付验证失败');
                }
            } catch (error) {
                console.error('处理支付成功失败:', error);
                setPaymentStatus('failed');
                message.error('支付处理失败，请联系客服');
            } finally {
                setLoading(false);
            }
        };

        handlePaymentSuccess();
    }, [searchParams, user, updateUser, t]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoToVip = () => {
        navigate('/vip');
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">正在处理支付...</h2>
                    <p className="text-gray-500">请稍候，我们正在验证您的支付信息</p>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon="ri:close-line" className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">支付失败</h2>
                    <p className="text-gray-600 mb-6">
                        很抱歉，您的支付未能成功完成。请检查您的支付信息或联系客服获取帮助。
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleGoToVip}
                            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                            重新支付
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            返回首页
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon icon="ri:check-line" className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">支付成功！</h2>
                <p className="text-gray-600 mb-6">
                    恭喜您！您的订阅已成功激活，现在可以享受所有专业版功能了。
                </p>
                
                {paymentData && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-2">订单详情</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>订单号：</span>
                                <span className="font-mono">{paymentData.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>支付状态：</span>
                                <span className="text-green-600 font-semibold">已支付</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="space-y-3">
                    <button
                        onClick={handleGoHome}
                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        开始使用
                    </button>
                    <button
                        onClick={handleGoToVip}
                        className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        查看订阅详情
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
