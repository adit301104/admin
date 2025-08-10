import React from 'react'
import { apiService } from '../services/api'

const Header = ({ onLogout, error }) => {
  const user = localStorage.getItem('authUser')

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      onLogout()
    }
  }

  return (
    <header>
      <div className="header-content">
        <h1>Subscription Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
      {error && (
        <div className="error-banner">
          <strong>⚠️ {error}</strong>
          <br />
          
          <br />
         Offline :- Stats will show 0 values until backend is connected.
        </div>
      )}
    </header>
  )
}

export default Header