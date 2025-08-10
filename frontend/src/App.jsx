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
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ active: 0, canceled: 0, totalRevenue: 0 })
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
      fetchOrders()
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

  const fetchOrders = async () => {
    try {
      const response = await apiService.getOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
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
    setStats({ active: 0, canceled: 0, totalRevenue: 0 })
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
        <SubscriptionTable 
          subscriptions={subscriptions} 
          loading={loading}
          onCancel={handleCancelSubscription}
        />
        
        {orders.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Recent Orders from Shoptet</h2>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {orders.map(order => (
                <div key={order._id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                  <div><strong>Email:</strong> {order.customer_email}</div>
                  <div><strong>Amount:</strong> {order.amount} {order.currency}</div>
                  <div><strong>Status:</strong> {order.status}</div>
                  <div><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
                  {order.shoptet_order_id && <div><strong>Shoptet ID:</strong> {order.shoptet_order_id}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App