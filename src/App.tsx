import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="app">
      <Toaster />
      <Outlet />
    </div>
  )
}

export default App
