import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiInterceptor } from '../services/apiInterceptor';
import { pointsService } from '../services/pointsService';
import { paymentService } from '../services/paymentService';

interface User {
    user_id: number;
    user_name: string;
    user_email: string;
    user_plan: 'free' | 'chinese' | 'multilingual';
    user_point: string;
    subscription_expires_at?: string | null;
    subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
    userId?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    refreshUserInfo: () => Promise<void>;
    isAuthenticated: boolean;
    checkTokenValidity: () => Promise<boolean>;
    refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 从localStorage恢复用户状态
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        // API拦截器的token过期回调将在TokenExpiryHandler组件中设置
    }, []);

    const login = async (userData: User, userToken: string) => {
        console.log('🔐 [AuthContext] login - Token调试信息:');
        console.log('  - 接收到的userToken:', userToken);
        console.log('  - userToken类型:', typeof userToken);
        console.log('  - userToken长度:', userToken.length);
        console.log('  - 是否包含Bearer:', userToken.startsWith('Bearer '));
        console.log('  - 前50个字符:', userToken.substring(0, 50));
        
        console.log('🔐 [AuthContext] 设置认证状态为true');
        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('  - 已存储到localStorage的token:', localStorage.getItem('token')?.substring(0, 50) + '...');

        // 处理每日登录积分奖励
        try {
            const rewardResult = await pointsService.dailyLoginReward({
                user_plan: userData.user_plan || 'free'
            });

            if (rewardResult.success && rewardResult.data?.rewarded) {
                console.log(`每日登录积分奖励: 获得 ${rewardResult.data.points} 积分`);
                // 可以在这里显示积分奖励通知，但不在AuthContext中直接显示UI
                // 通知可以通过其他方式（如全局状态管理）来处理
            }
        } catch (error) {
            console.error('每日登录积分奖励处理失败:', error);
            // 不影响登录流程，只记录错误
        }
    };

    const logout = () => {
        console.log('🔐 [AuthContext] logout - 设置认证状态为false');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // 刷新用户信息（包括积分）
    const refreshUserInfo = async () => {
        if (!isAuthenticated) {
            return;
        }

        try {
            const result = await paymentService.getUserInfo();
            if (result.success && result.data) {
                const userData = result.data;
                const updatedUser: User = {
                    user_id: userData.user_id || 0,
                    user_name: userData.user_name || '用户',
                    user_email: userData.user_email || '',
                    user_plan: userData.user_plan || 'free',
                    user_point: userData.user_point || '0',
                    subscription_expires_at: userData.subscription_expires_at,
                    subscription_status: userData.subscription_status,
                    userId: userData.userId
                };
                updateUser(updatedUser);
            }
        } catch (error) {
            console.error('刷新用户信息失败:', error);
        }
    };

    // 处理token过期
    const handleTokenExpired = () => {
        console.log('Token已过期，执行自动登出');
        logout();
        // 使用window.location进行页面跳转，避免在Provider中使用useNavigate
        window.location.href = '/#/app/login';
    };

    // 检查token有效性
    const checkTokenValidity = async (): Promise<boolean> => {
        if (!token) {
            return false;
        }

        try {
            // 这里可以调用一个简单的API来验证token
            // 如果token无效，API拦截器会自动处理
            const response = await fetch('/api/validate-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Token验证失败:', error);
            return false;
        }
    };

    // 刷新token（如果支持的话）
    const refreshToken = async (): Promise<boolean> => {
        if (!token) {
            return false;
        }

        try {
            // 尝试刷新token
            // 这里需要根据实际的认证服务来实现
            // 目前云开发可能不支持token刷新，所以返回false
            console.log('Token刷新功能暂未实现');
            return false;
        } catch (error) {
            console.error('Token刷新失败:', error);
            return false;
        }
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        updateUser,
        refreshUserInfo,
        isAuthenticated,
        checkTokenValidity,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 