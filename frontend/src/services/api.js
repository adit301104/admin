const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('authToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('authToken')
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('authUser')
          window.location.reload()
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      // Handle connection errors specifically
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Backend server connection failed - please start the backend server')
      }
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    
    if (response.token) {
      localStorage.setItem('authToken', response.token)
    }
    
    return response
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('authUser')
    }
  }

  async verifyToken() {
    return this.request('/api/auth/verify')
  }

  // Subscription endpoints
  async getSubscriptions() {
    return this.request('/api/subscriptions')
  }

  async getSubscriptionStats() {
    return this.request('/api/subscriptions/stats')
  }

  async cancelSubscription(id) {
    return this.request(`/api/subscriptions/${id}/cancel`, {
      method: 'POST'
    })
  }

  // Order endpoints
  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }


}

export const apiService = new ApiService()