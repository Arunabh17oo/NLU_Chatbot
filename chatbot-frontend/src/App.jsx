import React, { useState } from 'react'
import './App.css'
import Login from './Pages/Login'
import Signup from './Pages/Signup'

function App() {
  const [page, setPage] = useState('login') // default login page

  return (
    <div className="app">
      {page === 'login' ? (
        <Login goToSignup={() => setPage('signup')} />
      ) : (
        <Signup goToLogin={() => setPage('login')} />
      )}
    </div>
  )
}

export default App
