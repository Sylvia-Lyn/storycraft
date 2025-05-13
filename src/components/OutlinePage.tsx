import Navigation from './Navigation';
import Sidebar from './Sidebar';
import OutlineContent from './OutlineContent';

function OutlinePage() {
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
            defaultTab="大纲" 
            onTabChange={handleTabChange} 
          />
        </div>
        
        {/* 使用封装的大纲内容组件 */}
        <OutlineContent />
      </div>
    </div>
  );
}

export default OutlinePage; 