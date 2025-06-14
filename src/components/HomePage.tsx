import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Navigation from './Navigation'

function HomePage() {
  // 使用与其他页面相同的标签
  const tabs = ['大纲', '角色', '关系', '章节', '分幕', '剧本']

  // 处理标签变化的函数
  const handleTabChange = (tab: string) => {
    console.log(`选择了标签: ${tab}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4 py-16">
        <div className="max-w-2xl w-full">
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
              isHomePage={true}
            />
          </div>

          {/* 快速操作按钮 */}
          <div className="flex flex-col gap-4">
            <Link
              to="/story-settings"
              className="bg-black text-white py-3 px-6 rounded-md text-center flex items-center justify-center gap-2"
            >
              <span>一键生成剧本内容</span>
              <span className="text-lg">›</span>
            </Link>

            <Link
              to="/editor"
              className="border border-gray-300 bg-white py-3 px-6 rounded-md text-center"
            >
              续写我的作品
            </Link>

            <Link
              to="/knowledge/knowledge-1"
              className="border border-gray-300 bg-white py-3 px-6 rounded-md text-center"
            >
              上传我的素材
            </Link>

            <button
              onClick={() => {
                toast('功能开发中...', {
                  duration: 2000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                });
              }}
              className="border border-gray-300 bg-gray-100 text-gray-400 py-3 px-6 rounded-md text-center flex items-center justify-center gap-2 cursor-not-allowed"
              disabled
            >
              <span>不喜欢这个方式？新建工作流</span>
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 