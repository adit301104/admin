import { useState, useEffect } from 'react'
import { apiService } from './services/api'
import Login from './components/Login'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import SubscriptionTable from './components/SubscriptionTable'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const [stats, setStats] = useState({ active: 0, canceled: 0, pending: 0, total: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions()
      fetchStats()
    }
  }, [isAuthenticated])

  const fetchSubscriptions = async () => {
    try {
      setError(null)
      const response = await apiService.getSubscriptions()
      setSubscriptions(response.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      
      // Check if it's a connection error
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Backend server not running on localhost:3001')
      } else {
        setError('Failed to fetch subscriptions')
      }
      
      // Set empty array when backend is not available
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return
    
    try {
      await apiService.deleteSubscription(id)
      setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      fetchStats()
    } catch (error) {
      console.error('Error deleting subscription:', error)
      alert('Failed to delete subscription. Please try again.')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiService.getSubscriptionStats()
      setStats(response)
    } catch (error) {
      console.error('Error fetching stats:', error)
      
      // Always set stats to 0 when backend is unavailable
      setStats({
        active: 0,
        canceled: 0,
        pending: 0,
        total: 0,
        totalRevenue: 0
      })
    }
  }

  const handleCancelSubscription = async (id) => {
    try {
      await apiService.cancelSubscription(id)
      
      // Update local state immediately for better UX
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, status: 'canceled' } : sub
        )
      )
      
      // Refresh stats
      fetchStats()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    }
  }

  const handleLogin = (authStatus) => {
    setIsAuthenticated(authStatus)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setSubscriptions([])
    setStats({ active: 0, canceled: 0, pending: 0, total: 0, totalRevenue: 0 })
    setLoading(true)
    setError(null)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Header onLogout={handleLogout} error={error} />
      
      <main>
        <StatsCards stats={stats} />
        
        <div style={{ margin: '1rem 0' }}>
          <button 
            onClick={async () => {
              try {
                const data = await apiService.testData()
                console.log('Test data:', data)
                alert(`Found ${data.count} orders in database. Check console for details.`)
              } catch (error) {
                console.error('Test failed:', error)
                alert('Test failed: ' + error.message)
              }
            }}
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Test Database Connection
          </button>
        </div>
        
        <SubscriptionTable 
          subscriptions={subscriptions} 
          loading={loading}
          onCancel={handleCancelSubscription}
          onDelete={handleDeleteSubscription}
        />
      </main>
    </div>
  )
}

export default App