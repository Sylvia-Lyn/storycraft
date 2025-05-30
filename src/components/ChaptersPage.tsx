
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import CharacterSelector from './CharacterSelector';
import ChapterTable from './ChapterTable';

function ChaptersPage() {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  
  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
  };
  
  const handleCharacterSelect = (character: { id: string; name: string }) => {
    console.log('Selected character:', character);
  };
  
  return (
    <div className="w-full h-screen flex">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden pl-5 py-5">
        {/* 顶部控制区 */}
        <div className="flex items-center w-full px-10 mb-6">
          <Navigation 
            tabs={tabs} 
            defaultTab="章节" 
            onTabChange={handleTabChange} 
          />
          <div className="ml-8">
            <CharacterSelector onSelect={handleCharacterSelect} />
          </div>
        </div>
        
        {/* 章节表格 */}
        <div className="flex-1 px-10 overflow-auto">
          <ChapterTable />
        </div>
      </div>
    </div>
  );
}

export default ChaptersPage; 