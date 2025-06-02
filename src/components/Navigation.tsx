import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface NavigationProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange: (tab: string) => void;
}

function Navigation({ tabs, defaultTab, onTabChange }: NavigationProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0]);
  const [showPopup, setShowPopup] = useState(false);
  
  // 尝试获取navigate，如果不在Router上下文中则使用一个空函数
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = (path: string) => {
      console.warn('Navigation attempted outside Router context:', path);
      window.location.href = path; // 降级为直接跳转
    };
  }
  
  // 显示弹窗函数
  const showOptimizingPopup = () => {
    setShowPopup(true);
    // 3秒后自动关闭弹窗
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    
    // 根据不同标签执行不同的路由导航
    if (tab === '分幕') {
      // 显示"功能正在优化中"的弹窗，而不是导航
      showOptimizingPopup();
      // 仍然调用onTabChange以更新UI状态
      onTabChange(tab);
      return;
    } else if (tab === '剧本') {
      navigate('/editor'); // 剧本页面改为/editor路径
    } else if (tab === '大纲') {
      navigate('/outline');
    } else if (tab === '角色') {
      navigate('/characters');
    } else if (tab === '关系') {
      navigate('/relations');
    } else if (tab === '章节') {
      navigate('/chapters');
    }
    
    onTabChange(tab);
  };

  return (
    <>
      {/* Tab Navigation with connecting lines */}
      <div className="flex justify-center items-center mb-6 mt-5 overflow-x-auto">
        {tabs.map((tab, index) => (
          <div key={tab} className="flex items-center flex-shrink-0">
            <button 
              className={`flex items-center justify-center min-w-[54px] px-3 py-1 text-[14px] border ${
                selectedTab === tab 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-gray-300'
              } rounded-md`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
            {index < tabs.length - 1 && (
              <div className="w-3 h-[1px] bg-gray-300 mx-1"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* 功能正在优化中弹窗 */}
      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white px-6 py-4 rounded-md shadow-lg z-50 transition-opacity duration-300">
          <div className="text-center">
            <div className="text-lg font-medium mb-1">功能正在优化中</div>
            <div className="text-sm text-gray-300">我们正在努力完善此功能，敬请期待</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation; 