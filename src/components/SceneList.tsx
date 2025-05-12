import { useState } from 'react'
import { Icon } from '@iconify/react'
import Sidebar from './Sidebar'
import Navigation from './Navigation'
import AiInteractionSection from './AiInteractionSection'
import SceneTableSection from './SceneTableSection'
import ViewToggleSwitch from './ViewToggleSwitch'

interface Scene {
  id: string;
  timeline: string;
  template: string;
  plot: string;
  characters: string[];
  coreRelationship: string;
  emotionDevelopment: string;
  characterRelationships: string;
  characterEffect: string;
}

// 示例数据
const demoScenes: Scene[] = [
    { 
      id: '1', 
    timeline: '长熙xx年【背景】',
    template: '多年之后我在你的婚宴之上见到你',
    plot: '花间客在张嘉敏的订婚宴之上见到曾经爱过的花间客（主弦）\n张嘉敏失去了记忆（副弦）\n张嘉敏因为和花间客接触而昏迷（发展）\n张嘉敏对花间客和自己过去的联系产生好奇（结局）',
    characters: ['花间客', '张嘉敏', '永安', '萱儿', '苏飞卿'],
    coreRelationship: '主弦：恐惧，患得患失\n副弦：悲伤，残缺\n发展：自虐的爽结局\n悲剧的扭曲\n隐藏：治愈升华',
    emotionDevelopment: '• 高亮: 主弦的张力很满，副弦一般，后面几个音符时看不出门道。\n• 衔接: 1，更糟糕的是……\n2，在剩下的时间里……',
    characterRelationships: '1. 苏飞卿与父母：传统的将门子弟，父严母慈，备受期待\n2. 苏飞卿与太子：表兄弟关系，互相信任',
    characterEffect: '这些情节共同构建了一个充满政治阴谋、战争威胁和美爱情的故事背景。\n1. 展现了苏飞卿年少轻狂却情重义的性格\n2. 凸显了阿鹰身份的神秘性和复杂性'
    },
    { 
      id: '2', 
    timeline: '长熙二年春',
    template: '背景模板',
    plot: '示例剧情描述',
    characters: ['角色A', '角色B'],
    coreRelationship: '核心情绪示例',
    emotionDevelopment: '情感发展示例',
    characterRelationships: '人物关系示例',
    characterEffect: '人物效果示例'
  }
];

// 分幕列表页面主组件
function SceneList() {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  const [isPlotView, setIsPlotView] = useState(true);
  const [selectedModel, setSelectedModel] = useState('claude35_sonnet2');
  const [userInput, setUserInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // 模拟生成AI建议
  const generateSuggestions = () => {
    if (!userInput.trim()) return;
    
    // 实际项目中应调用API获取建议
    const suggestions = [
      "1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ];
    
    setAiSuggestions(suggestions);
  };

  // 处理输入框回车事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.trim()) {
      generateSuggestions();
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 中间内容区域 */}
      <div className="flex-1 flex flex-col h-full max-w-[calc(100vw-300px)]">
        <div className="flex items-center px-4 pt-4">
          {/* 顶部导航 */}
          <div className="flex-1">
            <Navigation 
              tabs={tabs} 
              defaultTab="分幕" 
              onTabChange={(tab) => console.log(tab)}
            />
          </div>
          
          {/* 剧情视图开关 */}
          <div className="ml-4">
            <ViewToggleSwitch 
              isEnabled={isPlotView}
              onChange={setIsPlotView}
              leftLabel="角色视图"
              rightLabel="剧情视图"
            />
          </div>
        </div>
        
        {/* 表格区域 */}
        <SceneTableSection scenes={demoScenes} />
        
        {/* 底部AI交互区域 */}
        <AiInteractionSection
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          userInput={userInput}
          setUserInput={setUserInput}
          handleKeyDown={handleKeyDown}
          aiSuggestions={aiSuggestions}
          inputPlaceholder="这段内容不好？点击单元格，告诉我如何优化，如：xxxxxx"
        />
      </div>

      {/* 右侧空白区域用于图标 */}
      <div className="w-[100px] bg-white flex flex-col items-center pt-8 gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Icon icon="ri:edit-line" className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Icon icon="ri:add-line" className="w-6 h-6 text-gray-700" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Icon icon="ri:delete-bin-line" className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  )
}

export default SceneList 