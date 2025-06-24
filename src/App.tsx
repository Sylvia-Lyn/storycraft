import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 全局顶栏 */}
      <TopBar />
      <div className="flex flex-1 min-h-0 h-[calc(100vh-64px)]">
        {/* 固定左侧边栏 */}
        <Sidebar />
        {/* 主内容区域 */}
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App
