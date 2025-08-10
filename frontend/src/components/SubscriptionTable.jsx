import React, { useState } from 'react'

const SubscriptionTable = ({ subscriptions = [], loading, onCancel }) => {
  const [filter, setFilter] = useState('')

  // Ensure subscriptions is always an array
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : []
  
  const filteredSubscriptions = safeSubscriptions.filter(sub =>
    sub.customer_email?.toLowerCase().includes(filter.toLowerCase()) ||
    sub.product_id?.toLowerCase().includes(filter.toLowerCase()) ||
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
            <th>Product</th>
            <th>Amount</th>
            <th>Interval</th>
            <th>Status</th>
            <th>Next Billing</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <td>{subscription.customer_email}</td>
              <td>{subscription.product_id}</td>
              <td>${subscription.amount}</td>
              <td>{subscription.interval}</td>
              <td>
                <span className={`status ${subscription.status}`}>
                  {subscription.status}
                </span>
              </td>
              <td>
                {subscription.next_billing_date 
                  ? formatDate(subscription.next_billing_date)
                  : 'N/A'
                }
              </td>
              <td>
                {subscription.status === 'active' && (
                  <button
                    onClick={() => onCancel(subscription.id)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                )}
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