import { createHashRouter } from 'react-router-dom'
import ScriptEditor from './components/ScriptEditor'
import SceneList from './components/SceneList'
import SceneEditor from './components/SceneEditor'

// 使用HashRouter而不是BrowserRouter，可以避免部署时的路径问题
const router = createHashRouter([
  {
    path: '/',
    element: <ScriptEditor />
  },
  {
    path: '/scenes',
    element: <SceneList />
  },
  {
    path: '/scenes/:sceneId',
    element: <SceneEditor />
  }
])

export default router 