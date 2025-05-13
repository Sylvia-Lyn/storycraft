import Navigation from './Navigation';
import Sidebar from './Sidebar';

function ChaptersPage() {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  
  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
  };

  return (
    <div className="w-full h-screen flex">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden pl-5">
        {/* 导航栏 - 向左偏移 */}
        <div className="flex w-full pl-10">
          <Navigation 
            tabs={tabs} 
            defaultTab="章节" 
            onTabChange={handleTabChange} 
          />
        </div>
        
        {/* 章节页面主体内容 */}
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600 p-8 rounded-lg bg-white" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
            此页面正在加班加点更新中
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChaptersPage; 