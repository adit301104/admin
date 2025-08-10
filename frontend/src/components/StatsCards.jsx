import React from 'react'

const StatsCards = ({ stats = {} }) => {
  // Ensure we always have valid numbers
  const safeStats = {
    active: Number(stats.active) || 0,
    canceled: Number(stats.canceled) || 0,
    totalRevenue: Number(stats.totalRevenue) || 0
  }

  return (
    <div className="stats-container">
      <div className="stat-card">
        <h3>Active Subscriptions</h3>
        <p className="stat-number">{safeStats.active}</p>
      </div>
      
      <div className="stat-card">
        <h3>Canceled Subscriptions</h3>
        <p className="stat-number">{safeStats.canceled}</p>
      </div>
      
      <div className="stat-card">
        <h3>Total Revenue</h3>
        <p className="stat-number">€{safeStats.totalRevenue.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default StatsCards