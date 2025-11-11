import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import TokenExpiryHandler from './components/TokenExpiryHandler'

const App: React.FC = () => {
  return (
    <TokenExpiryHandler>
      <div className="h-screen flex flex-col">
        {/* 全局顶栏 */}
        <TopBar />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* 固定左侧边栏 - 已隐藏 */}
          {/* <Sidebar /> */}
          {/* 主内容区域 */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </div>
    </TokenExpiryHandler>
  )
}

export default App
