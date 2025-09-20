import { getCloudbaseApp, getAuthHeader, getCloudbaseAuth } from '../cloudbase';
import { apiInterceptor } from './apiInterceptor';

export interface UserData {
    userId: string;
    user_name: string;
    user_email: string;
    user_plan: 'free' | 'chinese' | 'multilingual';
    user_point: string;
    subscription_expires_at?: string | null;
    subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserData {
    userId: string;
    username: string;
    email?: string;
    phone?: string;
}

export class UserService {
    private static instance: UserService;

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    // 创建用户记录
    async createUser(userData: CreateUserData): Promise<{
        success: boolean;
        data?: UserData;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const headers: any = {};
        
        if (authHeader) {
            headers.authorization = authHeader;
            // 打印完整的auth token信息用于调试
            console.log('🔐 [UserService] 创建用户记录 - 使用认证头:', { 
                authHeader: authHeader.substring(0, 20) + '...',
                fullAuthHeader: authHeader,
                authHeaderLength: authHeader.length,
                hasBearerPrefix: authHeader.startsWith('Bearer ')
            });

            // 检查CloudBase SDK状态（仅用于调试）
            try {
                const authInstance = getCloudbaseAuth();
                const loginState = await authInstance.getLoginState();
                console.log('🔍 [UserService] CloudBase登录状态:', loginState ? '已登录' : '未登录');
            } catch (error) {
                console.warn('⚠️ [UserService] 获取CloudBase状态失败:', error);
            }
        } else {
            console.warn('⚠️ [UserService] 创建用户记录 - 没有找到认证头');
        }

        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'works_manager',
                data: {
                    action: 'createUser',
                    data: userData
                },
                headers
            })
        );

        return (result as any).data?.result || result;
    }

    // 获取用户信息（从payment_manager获取完整信息）
    async getUserInfo(): Promise<{
        success: boolean;
        data?: UserData;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'payment_manager',
                data: {
                    action: 'getUserInfo'
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }
}

// 导出单例实例
export const userService = UserService.getInstance();
