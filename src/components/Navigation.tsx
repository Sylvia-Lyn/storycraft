import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface NavigationProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange: (tab: string) => void;
}

function Navigation({ tabs, defaultTab, onTabChange }: NavigationProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0]);
  
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

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    
    // 如果点击分幕标签，导航到分幕列表页面
    if (tab === '分幕') {
      navigate('/scenes');
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
    </>
  );
}

export default Navigation; 