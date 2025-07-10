import { app } from '../cloudbase';

export interface Work {
    _id?: string;
    id?: string;
    name: string;
    content?: any;
    type?: 'script' | 'outline' | 'character';
    createdAt?: Date;
    updatedAt?: Date;
    isSaved?: boolean;
    userId?: string;
    lastVisitedView?: string;
}

export interface CreateWorkData {
    name: string;
    content?: any;
    type?: 'script' | 'outline' | 'character';
}

export interface UpdateWorkData {
    id: string;
    name?: string;
    content?: any;
    type?: 'script' | 'outline' | 'character';
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
            const result = await app.callFunction({
                name: 'works_manager',
                data: {
                    action: 'createWork',
                    data
                }
            });

            if (!result.result.success) {
                throw new Error(result.result.error || '创建作品失败');
            }

            return result.result.data;
        } catch (error) {
            console.error('创建作品失败:', error);
            throw error;
        }
    }

    // 更新作品
    async updateWork(data: UpdateWorkData): Promise<{ id: string }> {
        try {
            const result = await app.callFunction({
                name: 'works_manager',
                data: {
                    action: 'updateWork',
                    data
                }
            });

            if (!result.result.success) {
                throw new Error(result.result.error || '更新作品失败');
            }

            return result.result.data;
        } catch (error) {
            console.error('更新作品失败:', error);
            throw error;
        }
    }

    // 删除作品
    async deleteWork(id: string): Promise<{ id: string }> {
        try {
            const result = await app.callFunction({
                name: 'works_manager',
                data: {
                    action: 'deleteWork',
                    data: { id }
                }
            });

            if (!result.result.success) {
                throw new Error(result.result.error || '删除作品失败');
            }

            return result.result.data;
        } catch (error) {
            console.error('删除作品失败:', error);
            throw error;
        }
    }

    // 获取用户的所有作品
    async getWorks(): Promise<Work[]> {
        try {
            const result = await app.callFunction({
                name: 'works_manager',
                data: {
                    action: 'getWorks'
                }
            });

            if (!result.result.success) {
                throw new Error(result.result.error || '获取作品列表失败');
            }

            return result.result.data;
        } catch (error) {
            console.error('获取作品列表失败:', error);
            throw error;
        }
    }

    // 获取单个作品详情
    async getWork(id: string): Promise<Work> {
        try {
            const result = await app.callFunction({
                name: 'works_manager',
                data: {
                    action: 'getWork',
                    data: { id }
                }
            });

            return result.result.data;
        } catch (error) {
            console.error('获取作品详情失败:', error);
            throw error;
        }
    }

    // 保存作品内容
    async saveWorkContent(data: SaveWorkContentData): Promise<{ id: string; isAutoSave: boolean }> {
        try {
            const result = await app.callFunction({
                name: 'works_manager',
                data: {
                    action: 'saveWorkContent',
                    data
                }
            });

            if (!result.result.success) {
                throw new Error(result.result.error || '保存作品内容失败');
            }

            return result.result.data;
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