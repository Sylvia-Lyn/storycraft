import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './router'
import { AuthProvider } from './contexts/AuthContext'
import { WorksProvider } from './contexts/WorksContext'
import { I18nProvider } from './contexts/I18nContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <I18nProvider>
        <WorksProvider>
          <RouterProvider router={router} />
        </WorksProvider>
      </I18nProvider>
    </AuthProvider>
  </StrictMode>,
)
