import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './router'
import { AuthProvider } from './contexts/AuthContext'
import { WorksProvider } from './contexts/WorksContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WorksProvider>
        <RouterProvider router={router} />
      </WorksProvider>
    </AuthProvider>
  </StrictMode>,
)
