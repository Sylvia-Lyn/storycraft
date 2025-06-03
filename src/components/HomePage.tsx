import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navigation from './Navigation'

function HomePage() {
  // 使用与其他页面相同的标签
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本']
  
  // 处理标签变化的函数
  const handleTabChange = (tab: string) => {
    console.log(`选择了标签: ${tab}`)
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧侧边栏 */}
      <Sidebar />
      
      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full px-4">
          {/* 欢迎文本 */}
          <h1 className="text-3xl text-center font-normal text-gray-800 mb-16">
            Hello，选择一个方式，开始您的创作吧
          </h1>
          
          {/* 导航组件 */}
          <div className="mb-16">
            <Navigation 
              tabs={tabs} 
              defaultTab="大纲" 
              onTabChange={handleTabChange} 
            />
          </div>
          
          {/* 快速操作按钮 */}
          <div className="flex flex-col gap-4">
            <a 
              href="https://writer.storyverse.pro/index" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white py-3 px-6 rounded-md text-center flex items-center justify-center gap-2"
            >
              <span>一键生成剧本内容</span>
              <span className="text-lg">›</span>
            </a>
            
            <Link 
              to="/" 
              className="border border-gray-300 bg-white py-3 px-6 rounded-md text-center"
            >
              导入我的作品
            </Link>
            
            <Link 
              to="/" 
              className="border border-gray-300 bg-white py-3 px-6 rounded-md text-center"
            >
              上传我的素材
            </Link>
            
            <Link 
              to="/" 
              className="border border-gray-300 bg-white py-3 px-6 rounded-md text-center flex items-center justify-center gap-2"
            >
              <span>不喜欢这个方式？新建工作流</span>
              <span className="text-lg">›</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 