import ScriptEditor from './components/ScriptEditor'
import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  return (
    <div className="app">
      <ScriptEditor />
      <Toaster />
    </div>
  )
}

export default App
