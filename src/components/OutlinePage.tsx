import Navigation from './Navigation';
import OutlineContent from './OutlineContent';
import AnnouncementBar from './AnnouncementBar';

function OutlinePage() {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  
  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 公告栏 */}
      <div className="w-full">
        <AnnouncementBar onTabClick={handleTabChange} />
      </div>

      {/* 导航栏 */}
      <div className="flex w-full pl-10">
        <Navigation 
          tabs={tabs} 
          defaultTab="大纲" 
          onTabChange={handleTabChange} 
        />
      </div>
      
      {/* 使用封装的大纲内容组件 */}
      <div className="flex-1">
        <OutlineContent />
      </div>
    </div>
  );
}

export default OutlinePage; 