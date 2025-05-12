import Navigation from './Navigation';

function CharactersPage() {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  
  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
  };

  return (
    <div className="w-full h-full">
      <Navigation 
        tabs={tabs} 
        defaultTab="角色" 
        onTabChange={handleTabChange} 
      />
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600 p-8 rounded-lg bg-white" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
          此页面正在加班加点更新中
        </div>
      </div>
    </div>
  );
}

export default CharactersPage; 