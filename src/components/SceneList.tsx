import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Sidebar from './Sidebar'

interface Scene {
  id: string;
  title: string;
  description: string;
}

// 分幕列表内容区域组件
function SceneListContent() {
  const [scenes] = useState<Scene[]>([
    { 
      id: '1', 
      title: '分幕一 - 初见', 
      description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' 
    },
    { 
      id: '2', 
      title: '分幕二 - 冲突', 
      description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' 
    },
    { 
      id: '3', 
      title: '分幕三 - 误会', 
      description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' 
    },
    { 
      id: '4', 
      title: '分幕四 - 解决', 
      description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' 
    },
    { 
      id: '5', 
      title: '分幕五 - 结局', 
      description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' 
    }
  ]);

  return (
    <div className="flex-1 overflow-auto p-4 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">分幕列表</h1>
        <p className="text-gray-600">共 {scenes.length} 个分幕</p>
      </div>

      <div className="space-y-4">
        {scenes.map(scene => (
          <Link 
            key={scene.id} 
            to={`/scenes/${scene.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{scene.title}</h2>
              <Icon icon="ri:arrow-right-s-line" className="text-gray-500" />
            </div>
            <p className="text-gray-700 line-clamp-2">{scene.description}</p>
          </Link>
        ))}
      </div>

      <button className="mt-6 bg-black text-white px-4 py-2 rounded-lg flex items-center">
        <Icon icon="ri:add-line" className="mr-1" />
        添加新分幕
      </button>
    </div>
  )
}

// 分幕列表页面主组件
function SceneList() {
  return (
    <div className="flex h-screen bg-white">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 右侧内容区域 */}
      <SceneListContent />

      {/* 右侧空白区域用于图标 */}
      <div className="w-[100px] bg-white flex flex-col items-center pt-8 gap-4">
      </div>
    </div>
  )
}

export default SceneList 