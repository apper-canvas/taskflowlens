import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { useState, useEffect } from 'react'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Router>
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
      />
    </div>
  )
}

export default App