import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import worksService, { Work } from '../services/worksService';
import { toast } from 'react-hot-toast';
import { useI18n } from './I18nContext';

interface WorksContextType {
    currentWork: Work | null;
    works: Work[];
    isLoading: boolean;
    setCurrentWork: (work: Work | null) => void;
    loadWorks: () => Promise<void>;
    createWork: (name: string, content?: any, type?: string) => Promise<Work>;
    updateWork: (id: string, updates: Partial<Work>) => Promise<void>;
    deleteWork: (id: string) => Promise<void>;
    saveWorkContent: (id: string, content: any, isAutoSave?: boolean) => Promise<void>;
}

const WorksContext = createContext<WorksContextType | undefined>(undefined);

export const useWorks = () => {
    const context = useContext(WorksContext);
    if (context === undefined) {
        throw new Error('useWorks must be used within a WorksProvider');
    }
    return context;
};

interface WorksProviderProps {
    children: ReactNode;
}

export const WorksProvider: React.FC<WorksProviderProps> = ({ children }) => {
    // 添加错误边界处理，防止热重载时的Context错误
    let authContext;
    let i18nContext;
    
    try {
        authContext = useAuth();
    } catch (error) {
        console.warn('WorksProvider: AuthContext not available, using fallback');
        authContext = { isAuthenticated: false };
    }
    
    try {
        i18nContext = useI18n();
    } catch (error) {
        console.warn('WorksProvider: I18nContext not available, using fallback');
        i18nContext = { t: (key: string) => key };
    }
    
    const { isAuthenticated } = authContext;
    const { t } = i18nContext;
    const [currentWork, setCurrentWork] = useState<Work | null>(null);
    const [works, setWorks] = useState<Work[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 加载用户的所有作品
    const loadWorks = async () => {
        console.log('loadWorks 被调用, isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('用户未认证，清空作品列表');
            setWorks([]);
            setCurrentWork(null);
            return;
        }

        try {
            console.log('开始加载作品列表...');
            setIsLoading(true);
            // const worksData = await worksService.getWorks();
            // console.log('作品列表加载成功:', worksData);
            // setWorks(worksData);
            setWorks([]);
        } catch (error) {
            console.error('加载作品列表失败:', error);
            toast.error(t('common.workListLoadFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    // 创建新作品
    const createWork = async (name: string, content?: any, type: string = 'script'): Promise<Work> => {
        try {
            const newWork = await worksService.createWork({
                name,
                content,
                type: type as 'script' | 'outline' | 'character' | 'web_novel'
            });

            // 更新作品列表
            setWorks(prev => [newWork, ...prev]);

            // 自动选中新创建的作品
            setCurrentWork(newWork);

            return newWork;
        } catch (error) {
            console.error('创建作品失败:', error);
            toast.error(t('common.workCreateFailed'));
            throw error;
        }
    };

    // 更新作品
    const updateWork = async (id: string, updates: Partial<Work>) => {
        try {
            await worksService.updateWork({ id, ...updates });

            // 更新本地状态
            setWorks(prev => prev.map(work =>
                (work._id === id || work.id === id) ? { ...work, ...updates } : work
            ));

            // 如果更新的是当前作品，也要更新当前作品状态
            if (currentWork && (currentWork._id === id || currentWork.id === id)) {
                setCurrentWork(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (error) {
            console.error('更新作品失败:', error);
            toast.error(t('common.workUpdateFailed'));
            throw error;
        }
    };

    // 删除作品
    const deleteWork = async (id: string) => {
        try {
            await worksService.deleteWork(id);

            // 更新本地状态
            setWorks(prev => prev.filter(work => work._id !== id && work.id !== id));

            // 如果删除的是当前作品，清空当前作品
            if (currentWork && (currentWork._id === id || currentWork.id === id)) {
                setCurrentWork(null);
            }
        } catch (error) {
            console.error('删除作品失败:', error);
            toast.error(t('common.workDeleteFailed'));
            throw error;
        }
    };

    // 保存作品内容
    const saveWorkContent = async (id: string, content: any, isAutoSave: boolean = false) => {
        try {
            console.log('[WorksContext] 开始保存作品内容:', { id, content, isAutoSave });
            const result = await worksService.saveWorkContent({ id, content, isAutoSave });
            console.log('[WorksContext] 保存作品内容成功:', result);

            // 更新本地状态
            setWorks(prev => {
                const updated = prev.map(work =>
                    (work._id === id || work.id === id) ? { ...work, content, updatedAt: new Date() } : work
                );
                console.log('[WorksContext] 更新作品列表:', updated);
                return updated;
            });

            // 如果保存的是当前作品，也要更新当前作品状态
            if (currentWork && (currentWork._id === id || currentWork.id === id)) {
                const updatedCurrentWork = { ...currentWork, content, updatedAt: new Date() };
                console.log('[WorksContext] 更新当前作品状态:', updatedCurrentWork);
                setCurrentWork(updatedCurrentWork);
            } else {
                console.log('[WorksContext] 保存的不是当前作品，当前作品ID:', currentWork?._id || currentWork?.id);
            }
        } catch (error) {
            console.error('[WorksContext] 保存作品内容失败:', error);
            // 不在这里显示错误提示，让调用方处理
            throw error;
        }
    };

    // 当认证状态改变时，自动加载作品列表
    useEffect(() => {
        console.log('WorksContext useEffect触发 - isAuthenticated:', isAuthenticated);
        if (isAuthenticated) {
            console.log('认证状态为true，调用loadWorks');
            loadWorks();
        } else {
            console.log('认证状态为false，清空作品列表');
            setWorks([]);
            setCurrentWork(null);
        }
    }, [isAuthenticated]);

    const value: WorksContextType = {
        currentWork,
        works,
        isLoading,
        setCurrentWork,
        loadWorks,
        createWork,
        updateWork,
        deleteWork,
        saveWorkContent,
    };

    return (
        <WorksContext.Provider value={value}>
            {children}
        </WorksContext.Provider>
    );
}; 