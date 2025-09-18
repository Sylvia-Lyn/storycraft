import { getCloudbaseApp, getAuthHeader } from '../cloudbase';
import { apiInterceptor } from './apiInterceptor';

export interface Work {
    _id?: string;
    id?: string;
    name: string;
    content?: any;
    type?: 'script' | 'outline' | 'character' | 'web_novel';
    createdAt?: Date;
    updatedAt?: Date;
    isSaved?: boolean;
    userId?: string;
    lastVisitedView?: string;
}

export interface CreateWorkData {
    name: string;
    content?: any;
    type?: 'script' | 'outline' | 'character' | 'web_novel';
}

export interface UpdateWorkData {
    id: string;
    name?: string;
    content?: any;
    type?: 'script' | 'outline' | 'character' | 'web_novel';
}

export interface SaveWorkContentData {
    id: string;
    content: any;
    isAutoSave?: boolean;
}

export class WorksService {
    private static instance: WorksService;

    private constructor() { }

    public static getInstance(): WorksService {
        if (!WorksService.instance) {
            WorksService.instance = new WorksService();
        }
        return WorksService.instance;
    }

    // 辅助方法：调用云函数并传递认证头
    private async callFunctionWithAuth(name: string, data: any) {
        const authHeader = getAuthHeader();
        const headers: any = {};
        
        if (authHeader) {
            headers.authorization = authHeader;
            console.log('使用认证头调用云函数:', { name, authHeader: authHeader.substring(0, 20) + '...' });
        } else {
            console.warn('没有找到认证头，可能影响云函数调用');
        }

        console.log('准备调用云函数:', { name, data, headers });
        
        // 使用API拦截器包装云函数调用
        return await apiInterceptor.callFunctionWithInterceptor(() => 
            getCloudbaseApp().callFunction({
                name,
                data,
                headers
            })
        );
    }

    // 获取用户token
    private async getUserToken(): Promise<string | null> {
        try {
            // 从localStorage获取token
            const token = localStorage.getItem('token');
            return token;
        } catch (error) {
            console.error('获取用户token失败:', error);
            return null;
        }
    }

    // 创建新作品
    async createWork(data: CreateWorkData): Promise<Work> {
        try {
            const result = await this.callFunctionWithAuth('works_manager', {
                action: 'createWork',
                data
            });

            if (!result.success) {
                throw new Error(result.error || '创建作品失败');
            }

            return result.data as Work;
        } catch (error) {
            console.error('创建作品失败:', error);
            throw error;
        }
    }

    // 更新作品
    async updateWork(data: UpdateWorkData): Promise<{ id: string }> {
        try {
            const result = await this.callFunctionWithAuth('works_manager', {
                action: 'updateWork',
                data
            });

            if (!result.success) {
                throw new Error(result.error || '更新作品失败');
            }

            return result.data as { id: string };
        } catch (error) {
            console.error('更新作品失败:', error);
            throw error;
        }
    }

    // 删除作品
    async deleteWork(id: string): Promise<{ id: string }> {
        try {
            const result = await this.callFunctionWithAuth('works_manager', {
                action: 'deleteWork',
                data: { id }
            });

            if (!result.success) {
                throw new Error(result.error || '删除作品失败');
            }

            return result.data as { id: string };
        } catch (error) {
            console.error('删除作品失败:', error);
            throw error;
        }
    }

    // 获取用户的所有作品
    async getWorks(): Promise<Work[]> {
        try {
            const result = await this.callFunctionWithAuth('works_manager', {
                action: 'getWorks'
            });

            if (!result.success) {
                throw new Error(result.error || '获取作品列表失败');
            }

            return result.data as Work[];
        } catch (error) {
            console.error('获取作品列表失败:', error);
            throw error;
        }
    }

    // 获取单个作品详情
    async getWork(id: string): Promise<Work> {
        try {
            const result = await this.callFunctionWithAuth('works_manager', {
                action: 'getWork',
                data: { id }
            });

            return result.data as Work;
        } catch (error) {
            console.error('获取作品详情失败:', error);
            throw error;
        }
    }

    // 保存作品内容
    async saveWorkContent(data: SaveWorkContentData): Promise<{ id: string; isAutoSave: boolean }> {
        try {
            console.log('worksService.saveWorkContent 调用:', data);
            const result = await this.callFunctionWithAuth('works_manager', {
                action: 'saveWorkContent',
                data
            });

            console.log('worksService.saveWorkContent 云函数返回:', result);
            console.log('云函数返回的完整结果:', JSON.stringify(result, null, 2));

            if (!result.success) {
                console.error('云函数保存失败，错误详情:', result);
                throw new Error(result.error || '保存作品内容失败');
            }

            return result.data as { id: string; isAutoSave: boolean };
        } catch (error) {
            console.error('保存作品内容失败:', error);
            throw error;
        }
    }

    // 检查作品是否存在
    async workExists(id: string): Promise<boolean> {
        try {
            await this.getWork(id);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default WorksService.getInstance(); 