import { Icon } from '@iconify/react';

function OutlineContent() {
  return (
    <div className="flex flex-1">
      {/* 左侧内容生成区 */}
      <div className="w-2/5 border-r p-6 flex flex-col">
        {/* 大纲风格选择 */}
        <div className="mb-6">
          <div className="text-lg font-medium mb-2">大纲风格</div>
          <div className="flex space-x-4 mb-4">
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none">
                <option>古风情感</option>
              </select>
              <Icon 
                icon="ri:arrow-down-s-line"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
              />
            </div>
            <div className="py-2">关键设定</div>
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none">
                <option>逆向时空</option>
              </select>
              <Icon 
                icon="ri:arrow-down-s-line"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          {/* 参考案例 */}
          <div className="mb-6">
            <div className="text-lg font-medium mb-2">参考案例</div>
            <div className="relative">
              <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none w-full">
                <option>《古相思曲》- 大纲  《扶剑惊风》- 大纲</option>
              </select>
              <Icon 
                icon="ri:arrow-down-s-line"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          {/* 可选方案 */}
          <div className="mb-6">
            <div className="text-lg font-medium mb-2">可选方案</div>
            <div className="flex items-center space-x-2">
              <Icon icon="ri:ai-generate" className="w-5 h-5" />
              <div className="relative flex-1">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white focus:outline-none w-full">
                  <option>deepseekr1</option>
                  <option>Gemini</option>
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI生成内容区 - 优化后的prompt模板 */}
        <div className="flex-1 overflow-auto space-y-4">
          {/* 当前prompt模板说明 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[180px] bg-gray-50">
            <p className="text-gray-700 text-sm font-medium mb-2">当前使用的prompt模板:</p>
            <p className="text-gray-800 text-sm">
              <span className="block mb-1">(如果"参考案例"不为空)参考「知识库-xxxx」</span>
              <span className="block mb-1">已经生成了生成一份</span>
              <span className="block mb-1">(如果"大纲风格"不为空)「大纲风格」</span>
              <span className="block mb-1">剧本杀情感本的大纲，</span>
              <span className="block mb-1">(如果"关键设定"不为空)要求包含「关键设定1」、「关键设定2」、...、「关键设定n」等设定，</span>
              <span className="block mb-1">大纲内容为：「背景内容」</span>
              <span className="block">根据以下要求优化背景内容，要求符合逻辑、不能有超现实内容，并输出三种可能性的结果：「输入框内容」</span>
            </p>
          </div>
          
          {/* 生成内容框1 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800">
             1. 其中有2男玩家、4女玩家、2男npc，
            </p>
          </div>
          
          {/* 生成内容框2 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800">
              输入:
            </p>
          </div>
          
          {/* 生成内容框3 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800">
             正在生成内容...
            </p>
          </div>
        </div>

        {/* 底部问答区 */}
        <div className="mt-4">
          <div className="mb-2">Q: 您是想要这样的架空历史的大纲内容吗？</div>
          <div className="relative">
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10" 
              placeholder="大纲不好？告诉我如何优化，如：" 
            />
            <Icon 
              icon="ri:corner-down-right-fill" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* 右侧内容展示区 */}
      <div className="w-3/5 p-6 overflow-y-auto">
        {/* 背景内容 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">背景内容</h2>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">点击查看Prompt模板</div>
          </div>
          
          {/* 背景内容prompt模板说明 */}
          <div className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50 text-sm">
            <p className="text-gray-700 font-medium mb-2">背景内容生成的prompt模板:</p>
            <p className="text-gray-800">
              <span className="block mb-1">(如果"参考案例"不为空)参考「知识库-xxxx」</span>
              <span className="block mb-1">生成一份</span>
              <span className="block mb-1">(如果"大纲风格"不为空)「大纲风格」</span>
              <span className="block mb-1">剧本杀情感本的大纲，</span>
              <span className="block mb-1">(如果"关键设定"不为空)要求包含「关键设定1」、「关键设定2」、...、「关键设定n」等设定，</span>
              <span className="block">要求大纲内容符合逻辑、不能有超现实内容</span>
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 h-[200px] overflow-y-auto">
            <p className="text-gray-800">
            正在输入内容...
            </p>
          </div>
        </div>

        {/* 角色设定 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">角色设定</h2>
            <a href="#" className="text-gray-500 text-sm flex items-center">
              修改详情 <Icon icon="ri:arrow-right-s-line" />
            </a>
          </div>
          <div className="border border-gray-200 rounded-md p-4 h-[180px] overflow-y-auto">
            <div className="mb-4">
              <p className="mb-2">其中有2男玩家、4女玩家、2男npc</p>
            </div>
            <div>
              <p>2. 角色设定中包含角色MBTI</p>
              <p>3. 角色设定中包含名称，角色名称要根据角色性别生成「大纲风格」名字</p>
              <p>4. 角色设定中包含角色关键词，参考「知识库-「大纲风格」-关键词」</p>
              <p>5. 角色设定中包含角色判词，参考「知识库-「大纲风格」-角色判词」</p>
              <p>6. 角色设定中包含情感线，比如情感线类型是爱情线、事业线、亲情线</p>
              <p>7. 角色设定中包含情感原型，参考「知识库-「大纲风格」-情感原型」</p>
              <p>8. 角色设定中包含人物简介，参考「知识库-「大纲风格」-人物简介」</p>
            </div>
          </div>
        </div>

        {/* 分章剧情 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">分章剧情</h2>
            <a href="#" className="text-gray-500 text-sm flex items-center">
              修改详情 <Icon icon="ri:arrow-right-s-line" />
            </a>
          </div>
          <div className="border border-gray-200 rounded-md p-4 h-[240px] overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-medium mb-2">第一本:</h3>
              <p className="mb-2 pl-4">1. 主角苏飞卿从小被梦魇缠身，梦见一位金发女子在火海中消失</p>
              <p className="mb-2 pl-4">2. 苏飞卿奉命入京为太子陪读</p>
              <p className="mb-2 pl-4">3. 苏飞卿在燕门关遇到神秘舞女"阿鹰"并坠入爱河</p>
              <p className="mb-2 pl-4">4. 阿鹰最后突然离去，苏飞卿发现密信揭露她可能是细作</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutlineContent; 