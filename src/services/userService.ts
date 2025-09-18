import { getCloudbaseApp, getAuthHeader } from '../cloudbase';
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
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'works_manager',
                data: {
                    action: 'createUser',
                    data: userData
                }
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
