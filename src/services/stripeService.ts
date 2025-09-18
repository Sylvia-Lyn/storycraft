import { loadStripe, Stripe } from '@stripe/stripe-js';
import config from '../config';
import { getCloudbaseApp, getAuthHeader } from '../cloudbase';

class StripeService {
    private static instance: StripeService;
    private stripePromise: Promise<Stripe | null>;

    private constructor() {
        this.stripePromise = loadStripe(config.STRIPE_PUBLISHABLE_KEY);
    }

    public static getInstance(): StripeService {
        if (!StripeService.instance) {
            StripeService.instance = new StripeService();
        }
        return StripeService.instance;
    }

    /**
     * 创建Stripe Checkout Session
     */
    async createCheckoutSession(orderData: {
        orderId: string;
        planType: 'chinese' | 'multilingual';
        duration: 'yearly' | 'quarterly' | 'monthly';
        price: number;
        planName: string;
    }): Promise<{ success: boolean; sessionId?: string; error?: string }> {
        try {
            const authHeader = getAuthHeader();
            if (!authHeader) {
                return {
                    success: false,
                    error: '用户未登录'
                };
            }

            const result = await getCloudbaseApp().callFunction({
                name: 'payment_manager',
                data: {
                    action: 'createStripeCheckoutSession',
                    data: {
                        orderId: orderData.orderId,
                        planType: orderData.planType,
                        duration: orderData.duration,
                        price: orderData.price,
                        planName: orderData.planName,
                        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                        cancelUrl: `${window.location.origin}/vip`
                    }
                },
                headers: {
                    authorization: authHeader
                }
            });

            const response = result.result;
            
            if (response.success && response.sessionId) {
                return {
                    success: true,
                    sessionId: response.sessionId
                };
            } else {
                return {
                    success: false,
                    error: response.error || '创建支付会话失败'
                };
            }
        } catch (error) {
            console.error('创建Stripe Checkout Session失败:', error);
            return {
                success: false,
                error: '网络错误，请稍后重试'
            };
        }
    }

    /**
     * 重定向到Stripe Checkout
     */
    async redirectToCheckout(sessionId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const stripe = await this.stripePromise;
            if (!stripe) {
                return {
                    success: false,
                    error: 'Stripe初始化失败'
                };
            }

            const { error } = await stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (error) {
                return {
                    success: false,
                    error: error.message || '重定向到支付页面失败'
                };
            }

            return { success: true };
        } catch (error) {
            console.error('重定向到Stripe Checkout失败:', error);
            return {
                success: false,
                error: '重定向失败，请稍后重试'
            };
        }
    }

    /**
     * 验证支付会话并处理支付成功
     */
    async verifySession(sessionId: string): Promise<{ success: boolean; session?: any; error?: string }> {
        try {
            const authHeader = getAuthHeader();
            if (!authHeader) {
                return {
                    success: false,
                    error: '用户未登录'
                };
            }

            const result = await getCloudbaseApp().callFunction({
                name: 'payment_manager',
                data: {
                    action: 'handleStripePaymentSuccess',
                    data: {
                        sessionId: sessionId
                    }
                },
                headers: {
                    authorization: authHeader
                }
            });

            const response = result.result;
            
            if (response.success) {
                return {
                    success: true,
                    session: response.data
                };
            } else {
                return {
                    success: false,
                    error: response.error || '验证支付会话失败'
                };
            }
        } catch (error) {
            console.error('验证支付会话失败:', error);
            return {
                success: false,
                error: '网络错误，请稍后重试'
            };
        }
    }
}

export const stripeService = StripeService.getInstance();
