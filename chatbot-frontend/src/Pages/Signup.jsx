import React, { useState, useEffect, useRef } from 'react'
import './signup.css'
import axios from 'axios';
import Typed from 'typed.js'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

function Signup({ goToLogin }) {
  const [username, setUsername] = useState('')
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

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/register', {
        username: username,
        email: email,
        password: password,
      })
      if (res.status === 201) {
        alert('Signup successful')
      }
    } catch (err) {
      const status = err?.response?.status
      const message = err?.response?.data?.message
      if (status === 409) {
        alert('Account already exists')
      } else if (message) {
        alert(message)
      } else {
        alert('Signup failed. Please try again later.')
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="signup-container">
      <div className="website-title">
        <span ref={typedRef}></span>
      </div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="input-container">
          <span className="input-icon"><FiUser /></span>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>
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
        <button type="submit" onClick={handleSignup}>Sign Up</button>
      </form>
      <p>
        Already have an account? <span onClick={goToLogin}>Login</span>
      </p>
    </div>
  )
}

export default Signup
