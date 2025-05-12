import { createHashRouter, Outlet } from 'react-router-dom'
import ScriptEditor from './components/ScriptEditor'
import SceneList from './components/SceneList'
import SceneEditor from './components/SceneEditor'
import OutlinePage from './components/OutlinePage'
import CharactersPage from './components/CharactersPage'
import RelationsPage from './components/RelationsPage'
import ChaptersPage from './components/ChaptersPage'
import App from './App'

// 临时页面组件，显示"正在加班加点更新中"
const ComingSoonPage = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-xl text-gray-600 p-8 rounded-lg bg-white" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
      此页面正在加班加点更新中
    </div>
  </div>
);

// 使用HashRouter而不是BrowserRouter，可以避免部署时的路径问题
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ScriptEditor />
      },
      {
        path: 'outline',
        element: <OutlinePage />
      },
      {
        path: 'characters',
        element: <CharactersPage />
      },
      {
        path: 'relations',
        element: <RelationsPage />
      },
      {
        path: 'chapters',
        element: <ChaptersPage />
      },
      {
        path: 'scenes',
        element: <SceneList />
      },
      {
        path: 'scenes/:sceneId',
        element: <SceneEditor />
      }
    ]
  }
])

export default router 