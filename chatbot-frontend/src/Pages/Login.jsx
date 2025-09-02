import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Typed from 'typed.js'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import './login.css'

function Login({ goToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const typedRef = useRef(null)

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ['Welcome to MyChat!!'],
      typeSpeed: 100,
      backSpeed: 50,
      loop: false,
      showCursor: false,
    })

    return () => {
      typed.destroy()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', {
        email: email,
        password: password,
      })
      if (res.status === 200) {
        alert('Login successful')
      }
    } catch (err) {
      const status = err?.response?.status
      const message = err?.response?.data?.message
      if (status === 401) {
        alert('Invalid credentials')
      } else if (message) {
        alert(message)
      } else {
        alert('Login failed. Please try again later.')
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-container">
      <div className="website-title">
        <span ref={typedRef}></span>
      </div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-container">
          <span className="input-icon"><FiMail /></span>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="password-input-container">
          <span className="input-icon"><FiLock /></span>
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button 
            type="button" 
            className="password-toggle-btn"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <button type="submit" onClick={handleLogin}>Login</button>
      </form>
      <p>
        Don't have an account? <span onClick={goToSignup}>Sign up</span>
      </p>
    </div>
  )
}

export default Login
