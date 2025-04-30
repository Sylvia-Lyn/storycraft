import { useState } from 'react'

interface NavigationProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange: (tab: string) => void;
}

function Navigation({ tabs, defaultTab, onTabChange }: NavigationProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0]);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
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