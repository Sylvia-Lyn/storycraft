import { createHashRouter } from 'react-router-dom'
import ScriptEditor from './components/ScriptEditor'
import SceneList from './components/SceneList'
import SceneEditor from './components/SceneEditor'
import OutlinePage from './components/OutlinePage'
import CharactersPage from './components/CharactersPage'
import RelationsPage from './components/RelationsPage'
import ChaptersPage from './components/ChaptersPage'
import HomePage from './components/HomePage'
import WelcomePage from './components/WelcomePage'
import KnowledgeBasePage from './components/KnowledgeBasePage'
import KnowledgeUploadPage from './components/KnowledgeUploadPage'
import StorySettingsPage from './components/StorySettingsPage'
import OptimizingFeatureWrapper from './components/OptimizingFeatureWrapper'
import App from './App'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import VipPage from './components/VipPage'
import ProfilePage from './components/ProfilePage'
import PaymentPage from './components/PaymentPage'
import PaymentSuccessPage from './components/PaymentSuccessPage'
import ProtectedRoute from './components/ProtectedRoute'
import ShortplayEntryPage from './components/ShortplayEntryPage'
import PromptConfigPage from './components/PromptConfigPage'

// 临时页面组件，显示"正在加班加点更新中"
// const ComingSoonPage = () => (
//   <div className="flex items-center justify-center h-full">
//     <div className="text-xl text-gray-600 p-8 rounded-lg bg-white" style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
//       此页面正在加班加点更新中
//     </div>
//   </div>
// );

// 使用HashRouter而不是BrowserRouter，可以避免部署时的路径问题
const router = createHashRouter([
  {
    path: '/',
    element: <WelcomePage />
  },
  {
    path: '/prompt',
    element: <PromptConfigPage />
  },
  {
    path: '/app',
    element: <App />,
    children: [
      {
        path: 'home',
        element: <ProtectedRoute><HomePage /></ProtectedRoute>
      },
      {
        path: 'shortplay-entry',
        element: <ProtectedRoute><ShortplayEntryPage /></ProtectedRoute>
      },
      {
        path: 'editor',
        element: <ProtectedRoute><ScriptEditor /></ProtectedRoute>
      },
      {
        path: 'outline',
        element: <ProtectedRoute><OutlinePage /></ProtectedRoute>
      },
      {
        path: 'characters',
        element: <ProtectedRoute><CharactersPage /></ProtectedRoute>
      },
      {
        path: 'relations',
        element: <ProtectedRoute><RelationsPage /></ProtectedRoute>
      },
      {
        path: 'chapters',
        element: <ProtectedRoute><ChaptersPage /></ProtectedRoute>
      },
      {
        path: 'scenes',
        element: <ProtectedRoute><SceneList /></ProtectedRoute>
      },
      {
        path: 'scenes/:sceneId',
        element: <ProtectedRoute><SceneEditor /></ProtectedRoute>
      },
      {
        path: 'story-settings',
        element: <ProtectedRoute><StorySettingsPage /></ProtectedRoute>
      },
      {
        path: 'knowledge/:knowledgeId',
        element: <ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>
      },
      {
        path: 'knowledge/:knowledgeId/upload',
        element: <ProtectedRoute><KnowledgeUploadPage /></ProtectedRoute>
      },
      {
        path: 'vip',
        element: <VipPage />
      },
      {
        path: 'payment',
        element: <PaymentPage />
      },
      {
        path: 'payment/success',
        element: <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
    ]
  }
])

export default router 