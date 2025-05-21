import Navigation from './Navigation';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Tabs, Tab, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function CharactersPage() {
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本'];
  const characters = ['女1', '女2', '女3', '女4', '男1', '男2'];
  const [selectedCharacter, setSelectedCharacter] = useState(0); // 使用索引作为选中值
  const [gender, setGender] = useState('女');
  
  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
  };

  const handleCharacterChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedCharacter(newValue);
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
        defaultTab="角色" 
        onTabChange={handleTabChange} 
      />
        </div>
        
        {/* 角色页面主体内容 */}
        <div className="flex flex-col p-4 overflow-y-auto">
          {/* 角色选择区域 - 使用 Material-UI Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={selectedCharacter}
              onChange={handleCharacterChange}
              aria-label="character tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {characters.map((char, index) => (
                <Tab key={index} label={char} />
              ))}
              <Tab icon={<AddIcon />} aria-label="add character" />
            </Tabs>
          </Box>

          {/* 角色属性编辑区 */}
          <div className="space-y-4 mb-8">
            {/* 性别选择 */}
            <div className="flex items-center space-x-6">
              <div className="w-24 text-right">性别</div>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={gender === '女'} 
                    onChange={() => setGender('女')}
                    className="form-radio" 
                  />
                  <span>女</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={gender === '男'} 
                    onChange={() => setGender('男')}
                    className="form-radio" 
                  />
                  <span>男</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={gender === '无性别'} 
                    onChange={() => setGender('无性别')}
                    className="form-radio" 
                  />
                  <span>无性别</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={gender === '双性别版本'} 
                    onChange={() => setGender('双性别版本')}
                    className="form-radio" 
                  />
                  <span>双性别版本</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={gender === '自定义'} 
                    onChange={() => setGender('自定义')}
                    className="form-radio" 
                  />
                  <span>自定义</span>
                </label>
              </div>
            </div>

            {/* 角色人格 */}
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">角色人格</div>
              <div className="flex space-x-2">
                <div className="relative">
                  <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none">
                    <option>MBTI</option>
                  </select>
                  <Icon 
                    icon="ri:arrow-down-s-line"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
                <div className="relative">
                  <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none">
                    <option>ENTJ</option>
                  </select>
                  <Icon 
                    icon="ri:arrow-down-s-line"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* 角色类型 */}
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">角色类型</div>
              <div className="relative">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none">
                  <option>玩家</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* 角色名称 */}
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">角色名称</div>
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="输入角色名称" 
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  
                </button>
              </div>
            </div>

            {/* 角色形象 */}
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">角色形象</div>
              <div className="flex items-center space-x-2">
                <span>角色形象.jpg</span>
                <button className="border border-gray-300 rounded-md p-1">
                  <Icon icon="ri:image-add-line" className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 关键词 */}
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">关键词</div>
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  value="女性成长,爱情被付出" 
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
                />
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 角色判词 */}
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">角色判词</div>
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="输入角色判词" 
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  
                </button>
              </div>
            </div>
          </div>

          {/* 情感线编辑区 */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">情感线</div>
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <span className="text-blue-500">爱情线80% (角色1):</span>
                <span className="text-gray-600">「曾经沧海难为水...」</span>
                <Icon icon="ri:edit-line" className="w-5 h-5 text-gray-500 cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-24">
              <span>和</span>
              <div className="relative">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-1 pr-8 bg-white focus:outline-none">
                  <option>角色1</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
              <span>的</span>
              <div className="relative">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-1 pr-8 bg-white focus:outline-none">
                  <option>事业线</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
              <span>占比</span>
              <div className="relative">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-1 pr-8 bg-white focus:outline-none">
                  <option>80%</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
              <Icon icon="ri:check-line" className="w-5 h-5 text-green-500 cursor-pointer" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">情感原型</div>
              <div className="relative flex-1 max-w-md">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none w-full">
                  <option>「只差一步就能永远在一起」</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* 人物简介 */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 text-right">人物简介</div>
              <div className="relative flex-1">
                <textarea 
                  placeholder="输入人物简介" 
                  className="w-full border border-gray-300 rounded-md px-4 py-2 h-32 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 底部问答区 */}
          <div className="space-y-2 mt-8">
            <div>Q: 您是想要这样的{characters[selectedCharacter]}的角色设定吗？</div>
            <div className="relative">
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10" 
                placeholder="角色不好？告诉我如何优化，如：" 
              />
              <Icon 
                icon="ri:corner-down-right-fill" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 右侧角色详情预览区 */}
      <div className="w-1/3 border-l border-gray-200 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">角色设定</h2>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
              <img 
                src="/placeholder-avatar.png" 
                alt="Character" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果图片加载失败，显示占位符
                  e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22%23CCC%22%20d%3D%22M16%200C7.163%200%200%207.163%200%2016s7.163%2016%2016%2016%2016-7.163%2016-16S24.837%200%2016%200zm0%2029c-2.053%200-4.016-.434-5.782-1.228%203.147-3.59%205.45-6.978%206.932-10.164.698%201.928%201.932%203.562%203.572%204.75L16%2029zm13.372-7.778a13.975%2013.975%200%2001-1.553%201.336C25.678%2018.242%2022.29%2015.98%2019.18%2015.98c-1.293%200-2.562.39-3.565%201.128-2.707-1.18-5.134-2.96-7.225-5.282%201.493-2.422%204.372-4.143%207.61-4.143%204.982%200%209%203.872%209%208.64a8.64%208.64%200%2001-1.228%204.143c1.562.842%203.378%201.638%205.6%202.756z%22%2F%3E%3C%2Fsvg%3E'
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-medium mb-2">1. 赫连英：女，我将永不臣服于失控的命运，自由地追逐繁星。</h3>
        </div>

        <div className="mb-8">
          <h3 className="font-bold mb-2">人物简介</h3>
          <p className="text-gray-700 mb-4">
          大巫预言的“亡国公主”，蜕变为草原人众望所归的“草原之心”，落子果决而心志脱俗，以鹰隼之眼洞察人心，以狼王之勇统御万众，一统北方建立大燕，要江山更要挚爱
          </p>
        </div>

        <div className="mb-8">
          <h3 className="font-bold mb-2">人物小传</h3>
          <p className="text-gray-700 mb-4">
          1. 只差一步就能永远在一起，却永远失去了你；跨越千山只差一步就能说出口的道歉和表白再也说不出来。被欺骗的忠犬至死都在等你回来。救了所有人却救不下自己最爱的人。一生在爱里自私，与爱情背道而驰的薄情人死于殉情。是到最后才知道他的付出远比你更重，是勃然醒悟却无可挽回。先爱上的是对方，放不下的是自己。你的行为决定了你是谁，而不是你的血统决定了你是谁。你每一次都险些要被权力异化，但你总是能够因为他而苏醒过来。你的保护欲差点变成了征服和独占欲，可是他让你明白什么才是你真正应该做的事。慕强的核心是对更好的追求。
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">角色关系</h3>
            <a href="#" className="text-gray-500 text-sm flex items-center">
              修改详情 <Icon icon="ri:arrow-right-s-line" />
            </a>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700">
              1. 苏飞卿：沙漠之狼爱上北国鹰王，中原来的小将军没能护住草原的小公主，京城的邪教头子和小侯爷相爱相杀，最后草原的女王带着宠信的汉臣一统草原逐鹿天下。他是你事业之外唯一的私心。
            </p>
            <p className="text-gray-700">
              2. 雪鹰：赫连英在草原上捉住了一只雪鹰，雪鹰奋力反抗，终有一日逃脱，被苏飞卿一箭射中，掉在地上奄奄一息，却在你去拾取猎物的时候奋力逃脱。后来你每一次打猎的时候，雪鹰都会出现，袭击你，骚扰你，后来你发现了她越来越聪明，便总是给她备着食物，但是她来时便与她打闹，最后雪鹰习惯了与你如影随形，雪鹰至则公主至。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharactersPage; 