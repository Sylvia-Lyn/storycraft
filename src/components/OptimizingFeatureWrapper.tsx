import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface OptimizingFeatureWrapperProps {
  children: React.ReactNode;
  targetPaths: string[];
  redirectTo: string;
}

/**
 * 功能优化中包装组件
 * 当用户尝试访问指定路径时，显示"功能正在优化中"的弹窗，并重定向到指定页面
 */
const OptimizingFeatureWrapper: React.FC<OptimizingFeatureWrapperProps> = ({ 
  children, 
  targetPaths, 
  redirectTo 
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // 检查当前路径是否是目标路径之一
  const isTargetPath = targetPaths.some(path => {
    // 处理路径格式，适配HashRouter
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const normalizedCurrentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
    
    return normalizedCurrentPath === normalizedPath || 
           normalizedCurrentPath.startsWith(`${normalizedPath}/`);
  });
  
  // 当检测到目标路径时，显示弹窗并重定向
  useEffect(() => {
    if (isTargetPath) {
      // 显示弹窗
      setShowPopup(true);
      
      // 设置定时器，3秒后关闭弹窗
      const popupTimer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      
      // 立即重定向到指定页面
      navigate(`/${redirectTo}`, { replace: true });
      
      return () => clearTimeout(popupTimer);
    }
  }, [isTargetPath, navigate, redirectTo]);
  
  // 渲染弹窗和子组件
  return (
    <>
      {/* 功能正在优化中弹窗 */}
      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white px-6 py-4 rounded-md shadow-lg z-50 transition-opacity duration-300">
          <div className="text-center">
            <div className="text-lg font-medium mb-1">功能正在优化中</div>
            <div className="text-sm text-gray-300">我们正在努力完善此功能，敬请期待</div>
          </div>
        </div>
      )}
      
      {/* 渲染子组件 */}
      {children}
    </>
  );
};

export default OptimizingFeatureWrapper;
