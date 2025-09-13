/**
 * Token过期处理组件
 * 监听全局的token过期事件并处理自动跳转
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiInterceptor } from '../services/apiInterceptor';

interface TokenExpiryHandlerProps {
    children: React.ReactNode;
}

const TokenExpiryHandler: React.FC<TokenExpiryHandlerProps> = ({ children }) => {
    const navigate = useNavigate();
    const { logout, refreshToken } = useAuth();

    useEffect(() => {
        // 设置API拦截器的token过期回调
        const handleTokenExpired = () => {
            console.log('Token过期处理组件：检测到token过期');
            logout();
            navigate('/login', { replace: true });
        };

        // 设置API拦截器的token刷新回调
        const handleTokenRefresh = async (): Promise<boolean> => {
            console.log('Token过期处理组件：尝试刷新token');
            return await refreshToken();
        };

        apiInterceptor.setTokenExpiredCallback(handleTokenExpired);
        apiInterceptor.setTokenRefreshCallback(handleTokenRefresh);

        // 清理函数
        return () => {
            apiInterceptor.setTokenExpiredCallback(() => {});
            apiInterceptor.setTokenRefreshCallback(() => Promise.resolve(false));
        };
    }, [navigate, logout, refreshToken]);

    return <>{children}</>;
};

export default TokenExpiryHandler;
