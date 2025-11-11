import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuth();
    const location = useLocation();

    // 在初始化过程中，显示loading或暂不重定向
    if (isInitializing) {
        console.log('🔄 [ProtectedRoute] 正在初始化认证状态...');
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>加载中...</div>
        </div>;
    }

    if (!isAuthenticated) {
        // 重定向到登录页面，并保存当前路径
        console.log('❌ [ProtectedRoute] 未认证，重定向到登录页面');
        return <Navigate to="/app/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 