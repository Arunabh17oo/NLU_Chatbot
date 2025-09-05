import React, { useState } from 'react'
import './App.css'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Workspace from './Pages/Workspace'

function App() {
  const [page, setPage] = useState('login') // default login page

  return (
    <div className="app">
      {page === 'login' && (
        <Login goToSignup={() => setPage('signup')} onLoginSuccess={() => setPage('workspace')} />
      )}
      {page === 'signup' && (
        <Signup goToLogin={() => setPage('login')} />
      )}
      {page === 'workspace' && (
        <Workspace goToLogin={() => setPage('login')} />
      )}
    </div>
  )
}

export default App
