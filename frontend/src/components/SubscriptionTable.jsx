import React, { useState } from 'react'

const SubscriptionTable = ({ subscriptions = [], loading, onCancel, onDelete }) => {
  const [filter, setFilter] = useState('')

  // Ensure subscriptions is always an array
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : []
  
  const filteredSubscriptions = safeSubscriptions.filter(sub =>
    sub.customer_email?.toLowerCase().includes(filter.toLowerCase()) ||
    sub.plan?.toLowerCase().includes(filter.toLowerCase()) ||
    sub.status?.toLowerCase().includes(filter.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return <div className="loading">Loading subscriptions...</div>
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Subscriptions</h2>
        <input
          type="text"
          placeholder="Filter by email, product, or status..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
      </div>
      
      <table className="subscription-table">
        <thead>
          <tr>
            <th>Customer Email</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Payment ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <td>{subscription.customer_email}</td>
              <td>{subscription.plan}</td>
              <td>${subscription.amount} {subscription.currency}</td>
              <td>
                <span className={`status ${subscription.status}`}>
                  {subscription.status}
                </span>
              </td>
              <td>{formatDate(subscription.created_at)}</td>
              <td>{subscription.payment_id || 'N/A'}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {subscription.status === 'active' && (
                    <button
                      onClick={() => onCancel(subscription.id)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(subscription.id)}
                    className="delete-btn"
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredSubscriptions.length === 0 && (
        <div className="no-data">No subscriptions found</div>
      )}
    </div>
  )
}

export default SubscriptionTable