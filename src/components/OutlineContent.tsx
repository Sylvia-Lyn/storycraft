import { useState } from 'react';
import { Icon } from '@iconify/react';

function OutlineContent() {
  return (
    <div className="flex flex-1 overflow-hidden">
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
                </select>
                <Icon 
                  icon="ri:arrow-down-s-line"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI生成内容区 */}
        <div className="flex-1 overflow-auto space-y-4">
          {/* 生成内容框1 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800">
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </p>
          </div>
          
          {/* 生成内容框2 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800">
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </p>
          </div>
          
          {/* 生成内容框3 */}
          <div className="border border-gray-200 rounded-md p-4 overflow-y-auto max-h-[150px]">
            <p className="text-gray-800">
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
              placeholder="大纲不好？告诉我如何优化，如：xxxxxx" 
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
          <h2 className="text-xl font-bold mb-4">背景内容</h2>
          <div className="border border-gray-200 rounded-md p-4 h-[200px] overflow-y-auto">
            <p className="text-gray-800">
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
              <p className="mb-2">1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
            </div>
            <div>
              <p>2. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
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
              <p className="mb-2 pl-4">1. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxx</p>
              <p className="mb-2 pl-4">2. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxx</p>
              <p className="pl-4">3. xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutlineContent; 