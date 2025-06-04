import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* 固定左侧边栏 */}
      <Sidebar />
      
      {/* 主内容区域 */}
      <div className="flex-1">
        <Outlet />
      </div>
      
      <Toaster />
    </div>
  )
}

export default App
