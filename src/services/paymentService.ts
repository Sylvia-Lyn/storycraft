import { getCloudbaseApp, getAuthHeader } from '../cloudbase';
import { apiInterceptor } from './apiInterceptor';

export interface OrderData {
    orderId: string;
    userId: string;
    planType: 'chinese' | 'multilingual';
    duration: 'yearly' | 'quarterly' | 'monthly';
    planName: string;
    price: number;
    originalPrice: number;
    durationDays: number;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    createdAt: Date;
    updatedAt: Date;
    paymentMethod: string;
    paymentData: any;
    paymentParams?: {
        timeStamp: string;
        nonceStr: string;
        package: string;
        signType: string;
        paySign: string;
        isTestMode?: boolean;
    };
    expiresAt: Date;
}

export interface SubscriptionData {
    userId: string;
    planType: 'free' | 'chinese' | 'multilingual';
    duration: 'yearly' | 'quarterly' | 'monthly';
    status: 'free' | 'active' | 'expired' | 'cancelled';
    startDate: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderParams {
    planType: 'chinese' | 'multilingual';
    duration: 'yearly' | 'quarterly' | 'monthly';
}

export interface PaymentCallbackParams {
    orderId: string;
    paymentStatus: 'success' | 'failed';
    paymentData?: any;
}

export class PaymentService {
    private static instance: PaymentService;
    private readonly functionName = 'payment_manager';

    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    /**
     * 通用方法：调用云函数并处理token过期
     */
    private async callFunctionWithAuth(action: string, data: any): Promise<any> {
        const authHeader = getAuthHeader();
        if (!authHeader) {
            return {
                success: false,
                error: '用户未登录'
            };
        }

        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: this.functionName,
                data: {
                    action,
                    data
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    /**
     * 创建订单
     */
    async createOrder(params: CreateOrderParams): Promise<{ success: boolean; data?: OrderData; error?: string }> {
        return await this.callFunctionWithAuth('createOrder', params);
    }

    /**
     * 获取订单详情
     */
    async getOrder(orderId: string): Promise<{ success: boolean; data?: OrderData; error?: string }> {
        return await this.callFunctionWithAuth('getOrder', { orderId });
    }

    /**
     * 获取用户所有订单
     */
    async getUserOrders(): Promise<{ success: boolean; data?: OrderData[]; error?: string }> {
        try {
            const authHeader = getAuthHeader();
            if (!authHeader) {
                return {
                    success: false,
                    error: '用户未登录'
                };
            }

            const result = await getCloudbaseApp().callFunction({
                name: this.functionName,
                data: {
                    action: 'getUserOrders'
                },
                headers: {
                    authorization: authHeader
                }
            });

            return result.result;
        } catch (error) {
            console.error('获取用户订单失败:', error);
            return {
                success: false,
                error: error.message || '获取用户订单失败'
            };
        }
    }

    /**
     * 处理支付回调
     */
    async handlePaymentCallback(params: PaymentCallbackParams): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const result = await getCloudbaseApp().callFunction({
                name: this.functionName,
                data: {
                    action: 'handlePaymentCallback',
                    data: params
                }
            });

            return result.result;
        } catch (error) {
            console.error('处理支付回调失败:', error);
            return {
                success: false,
                error: error.message || '处理支付回调失败'
            };
        }
    }

    /**
     * 获取用户订阅信息
     */
    async getUserSubscription(): Promise<{ success: boolean; data?: SubscriptionData; error?: string }> {
        try {
            const authHeader = getAuthHeader();
            if (!authHeader) {
                return {
                    success: false,
                    error: '用户未登录'
                };
            }

            const result = await getCloudbaseApp().callFunction({
                name: this.functionName,
                data: {
                    action: 'getUserSubscription'
                },
                headers: {
                    authorization: authHeader
                }
            });

            return result.result;
        } catch (error) {
            console.error('获取用户订阅信息失败:', error);
            return {
                success: false,
                error: error.message || '获取用户订阅信息失败'
            };
        }
    }

    /**
     * 取消订阅
     */
    async cancelSubscription(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const authHeader = getAuthHeader();
            if (!authHeader) {
                return {
                    success: false,
                    error: '用户未登录'
                };
            }

            const result = await getCloudbaseApp().callFunction({
                name: this.functionName,
                data: {
                    action: 'cancelSubscription'
                },
                headers: {
                    authorization: authHeader
                }
            });

            return result.result;
        } catch (error) {
            console.error('取消订阅失败:', error);
            return {
                success: false,
                error: error.message || '取消订阅失败'
            };
        }
    }

    /**
     * 检查用户是否为会员
     */
    async isVipUser(): Promise<boolean> {
        try {
            const result = await this.getUserSubscription();
            if (result.success && result.data) {
                const subscription = result.data;
                if (subscription.status === 'active') {
                    const now = new Date();
                    const expiresAt = new Date(subscription.expiresAt);
                    return expiresAt > now;
                }
            }
            return false;
        } catch (error) {
            console.error('检查会员状态失败:', error);
            return false;
        }
    }

    /**
     * 获取用户会员等级
     */
    async getUserPlanType(): Promise<'free' | 'chinese' | 'multilingual'> {
        try {
            const result = await this.getUserSubscription();
            if (result.success && result.data) {
                const subscription = result.data;
                if (subscription.status === 'active') {
                    const now = new Date();
                    const expiresAt = new Date(subscription.expiresAt);
                    if (expiresAt > now) {
                        return subscription.planType as 'chinese' | 'multilingual';
                    }
                }
            }
            return 'free';
        } catch (error) {
            console.error('获取用户会员等级失败:', error);
            return 'free';
        }
    }

    // 获取用户完整信息（包含订阅状态）
    async getUserInfo(): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const authHeader = getAuthHeader();
            const result = await getCloudbaseApp().callFunction({
                name: 'payment_manager',
                data: {
                    action: 'getUserInfo'
                },
                headers: {
                    authorization: authHeader
                }
            });

            return result.result;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return {
                success: false,
                error: '获取用户信息失败'
            };
        }
    }

    // 模拟支付成功（用于测试）
    async simulatePaymentSuccess(orderData: any): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const authHeader = getAuthHeader();
            const result = await getCloudbaseApp().callFunction({
                name: 'payment_manager',
                data: {
                    action: 'simulatePaymentSuccess',
                    data: orderData
                },
                headers: {
                    authorization: authHeader
                }
            });

            return result.result;
        } catch (error) {
            console.error('模拟支付成功失败:', error);
            return {
                success: false,
                error: '模拟支付成功失败'
            };
        }
    }
}

// 导出单例实例
export const paymentService = PaymentService.getInstance();