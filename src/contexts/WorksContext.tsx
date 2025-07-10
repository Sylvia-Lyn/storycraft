import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import worksService, { Work } from '../services/worksService';
import { toast } from 'react-hot-toast';

interface WorksContextType {
    currentWork: Work | null;
    works: Work[];
    isLoading: boolean;
    setCurrentWork: (work: Work | null) => void;
    loadWorks: () => Promise<void>;
    createWork: (name: string, content?: any) => Promise<Work>;
    updateWork: (id: string, updates: Partial<Work>) => Promise<void>;
    deleteWork: (id: string) => Promise<void>;
    saveWorkContent: (id: string, content: any) => Promise<void>;
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
    const { isAuthenticated } = useAuth();
    const [currentWork, setCurrentWork] = useState<Work | null>(null);
    const [works, setWorks] = useState<Work[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 加载用户的所有作品
    const loadWorks = async () => {
        if (!isAuthenticated) {
            setWorks([]);
            setCurrentWork(null);
            return;
        }

        try {
            setIsLoading(true);
            const worksData = await worksService.getWorks();
            setWorks(worksData);
        } catch (error) {
            console.error('加载作品列表失败:', error);
            toast.error('加载作品列表失败');
        } finally {
            setIsLoading(false);
        }
    };

    // 创建新作品
    const createWork = async (name: string, content?: any): Promise<Work> => {
        try {
            const newWork = await worksService.createWork({
                name,
                content,
                type: 'script'
            });

            // 更新作品列表
            setWorks(prev => [newWork, ...prev]);

            // 自动选中新创建的作品
            setCurrentWork(newWork);

            return newWork;
        } catch (error) {
            console.error('创建作品失败:', error);
            toast.error('创建作品失败');
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
            toast.error('更新作品失败');
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
            toast.error('删除作品失败');
            throw error;
        }
    };

    // 保存作品内容
    const saveWorkContent = async (id: string, content: any) => {
        try {
            await worksService.saveWorkContent({ id, content });

            // 更新本地状态
            setWorks(prev => prev.map(work =>
                (work._id === id || work.id === id) ? { ...work, content, updatedAt: new Date() } : work
            ));

            // 如果保存的是当前作品，也要更新当前作品状态
            if (currentWork && (currentWork._id === id || currentWork.id === id)) {
                setCurrentWork(prev => prev ? { ...prev, content, updatedAt: new Date() } : null);
            }
        } catch (error) {
            console.error('保存作品内容失败:', error);
            toast.error('保存作品内容失败');
            throw error;
        }
    };

    // 当认证状态改变时，自动加载作品列表
    useEffect(() => {
        if (isAuthenticated) {
            loadWorks();
        } else {
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