import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import Analysis from './components/Analysis'
import Community from './components/Community'
import Settings from './components/Settings'
import "tailwindcss";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Nav />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App