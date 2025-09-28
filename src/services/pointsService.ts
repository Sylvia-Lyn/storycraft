import { getCloudbaseApp, getAuthHeader } from '../cloudbase';
import { apiInterceptor } from './apiInterceptor';

export interface PointsData {
    userId: string;
    points: number;
    user_name?: string;
}

export interface PointsHistory {
    _id: string;
    userId: string;
    points: number;
    type: 'add' | 'deduct';
    reason: string;
    source: string;
    orderId?: string;
    oldPoints: number;
    newPoints: number;
    createdAt: Date;
}

export interface AddPointsData {
    points: number;
    reason?: string;
    source?: string;
    orderId?: string;
}

export interface DeductPointsData {
    points: number;
    reason?: string;
}

export interface UpdatePointsData {
    points: number;
    reason?: string;
}

export interface PointsHistoryData {
    page?: number;
    limit?: number;
}

export interface DailyLoginRewardData {
    user_plan: 'free' | 'chinese' | 'multilingual';
}

export class PointsService {
    private static instance: PointsService;

    public static getInstance(): PointsService {
        if (!PointsService.instance) {
            PointsService.instance = new PointsService();
        }
        return PointsService.instance;
    }

    // 获取用户积分
    async getUserPoints(): Promise<{
        success: boolean;
        data?: PointsData;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'getUserPoints'
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    // 增加积分
    async addPoints(data: AddPointsData): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'addPoints',
                    data: data
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    // 增加积分并记录历史
    async addPointsWithHistory(data: AddPointsData): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        
        // 调试：打印token信息
        console.log('🔐 [PointsService] addPointsWithHistory - Token调试信息:');
        console.log('  - authHeader:', authHeader);
        console.log('  - authHeader类型:', typeof authHeader);
        console.log('  - authHeader长度:', authHeader?.length);
        console.log('  - 是否包含Bearer:', authHeader?.startsWith('Bearer '));
        console.log('  - 前50个字符:', authHeader?.substring(0, 50));
        
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'addPointsWithHistory',
                    data: data
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    // 扣除积分
    async deductPoints(data: DeductPointsData): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'deductPoints',
                    data: data
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    // 直接设置积分
    async updatePoints(data: UpdatePointsData): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'updatePoints',
                    data: data
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    // 获取积分历史记录
    async getPointsHistory(data?: PointsHistoryData): Promise<{
        success: boolean;
        data?: {
            history: PointsHistory[];
            page: number;
            limit: number;
            total: number;
        };
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'getPointsHistory',
                    data: data || {}
                },
                headers: {
                    authorization: authHeader
                }
            })
        );

        return (result as any).data?.result || result;
    }

    // 每日登录积分奖励
    async dailyLoginReward(data: DailyLoginRewardData): Promise<{
        success: boolean;
        data?: {
            rewarded: boolean;
            points?: number;
            newPoints?: number;
            reason?: string;
        };
        error?: string;
    }> {
        const authHeader = getAuthHeader();
        const result = await apiInterceptor.callFunctionWithInterceptor(() =>
            getCloudbaseApp().callFunction({
                name: 'points_manager',
                data: {
                    action: 'dailyLoginReward',
                    data: data
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
export const pointsService = PointsService.getInstance();
