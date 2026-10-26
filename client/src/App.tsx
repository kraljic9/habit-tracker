import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import Analysis from './components/Analysis'
import Community from './components/Community'
import Settings from './components/Settings'
import axios from 'axios'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, (error) => {
  return Promise.reject(error);
})

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