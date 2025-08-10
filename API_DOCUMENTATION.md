# Mock Payment System API Documentation

This document describes the API endpoints for the mock payment and subscription system designed for Shoptet integration.

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Mock Payments API

### Process Payment
Process a mock payment (one-time or subscription).

**Endpoint:** `POST /mock-payments/process`

**Request Body:**
```json
{
  "customer_email": "customer@example.com",
  "amount": 29.99,
  "currency": "USD",
  "payment_method": "card",
  "order_id": "uuid-optional",
  "subscription_id": "uuid-optional",
  "metadata": {
    "product_id": "PROD_123",
    "custom_field": "value"
  },
  "success_rate": 0.9
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "payment_id": "mock_pay_abc123",
    "status": "completed",
    "amount": 29.99,
    "currency": "USD",
    "payment_method": "card",
    "transaction_id": "txn_xyz789",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### Get Payments
Retrieve payments with pagination and filtering.

**Endpoint:** `GET /mock-payments`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `status` (pending, completed, failed, refunded)
- `customer_email`
- `payment_method`

**Response:**
```json
{
  "payments": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### Get Payment Details
Get details of a specific payment.

**Endpoint:** `GET /mock-payments/:paymentId`

**Response:**
```json
{
  "payment": {
    "id": "uuid",
    "payment_id": "mock_pay_abc123",
    "customer_email": "customer@example.com",
    "amount": 29.99,
    "currency": "USD",
    "status": "completed",
    "payment_method": "card",
    "transaction_id": "txn_xyz789",
    "order_id": "uuid",
    "subscription_id": "uuid",
    "metadata": {...},
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

### Refund Payment
Refund a completed payment (full or partial).

**Endpoint:** `POST /mock-payments/:paymentId/refund`

**Request Body:**
```json
{
  "amount": 15.00  // Optional: partial refund amount
}
```

**Response:**
```json
{
  "success": true,
  "refund": {
    "id": "uuid",
    "payment_id": "mock_pay_refund_123",
    "amount": -15.00,
    "status": "completed",
    "created_at": "2024-01-01T12:30:00Z"
  }
}
```

### Process Subscription Payment
Process a payment for a specific subscription cycle.

**Endpoint:** `POST /mock-payments/subscription/:id/charge`

**Request Body:**
```json
{
  "cycle_number": 2  // Optional: defaults to 1
}
```

**Response:**
```json
{
  "success": true,
  "cycle": {
    "id": "uuid",
    "subscription_id": "uuid",
    "cycle_number": 2,
    "billing_date": "2024-02-01T00:00:00Z",
    "amount": 29.99,
    "status": "paid"
  },
  "payment": {
    "id": "uuid",
    "payment_id": "mock_pay_sub_456",
    "status": "completed",
    "amount": 29.99,
    "currency": "USD",
    "created_at": "2024-02-01T12:00:00Z"
  }
}
```

### Get Payment Statistics
Get payment statistics for a specific timeframe.

**Endpoint:** `GET /mock-payments/stats/:timeframe`

**Timeframes:** `24h`, `7d`, `30d`, `90d`

**Response:**
```json
{
  "stats": {
    "total_payments": 150,
    "successful_payments": 135,
    "failed_payments": 15,
    "refunded_payments": 5,
    "total_amount": 4500.00,
    "refunded_amount": 150.00,
    "success_rate": "90.00",
    "payment_methods": {
      "card": {"count": 120, "amount": 3600.00},
      "bank_transfer": {"count": 20, "amount": 600.00},
      "paypal": {"count": 10, "amount": 300.00}
    },
    "currencies": {
      "USD": {"count": 140, "amount": 4200.00},
      "EUR": {"count": 10, "amount": 300.00}
    }
  }
}
```

## Orders API

### Create Order
Process an order from Shoptet (handles both one-time and subscription payments).

**Endpoint:** `POST /orders`

**Request Body:**
```json
{
  "customer_email": "customer@example.com",
  "product_id": "PROD_123",
  "amount": 29.99,
  "interval": "monthly",  // "once", "weekly", "monthly", "quarterly", "yearly"
  "shoptet_order_id": "SHOP_ORDER_456",
  "payment_method": "card",
  "currency": "USD"
}
```

**Response (Subscription):**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "customer_email": "customer@example.com",
    "product_id": "PROD_123",
    "amount": 29.99,
    "status": "completed",
    "shoptet_order_id": "SHOP_ORDER_456",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "subscription": {
    "id": "uuid",
    "customer_email": "customer@example.com",
    "product_id": "PROD_123",
    "amount": 29.99,
    "interval": "monthly",
    "status": "active",
    "next_billing_date": "2024-02-01T12:00:00Z"
  },
  "payment": {
    "id": "uuid",
    "payment_id": "mock_pay_abc123",
    "status": "completed",
    "amount": 29.99,
    "currency": "USD"
  }
}
```

### Get Orders
Retrieve orders with pagination and filtering.

**Endpoint:** `GET /orders`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `status` (pending, completed, failed, refunded)
- `customer_email`

### Get Order Details
Get details of a specific order including related payments.

**Endpoint:** `GET /orders/:id`

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "customer_email": "customer@example.com",
    "product_id": "PROD_123",
    "amount": 29.99,
    "status": "completed",
    "shoptet_order_id": "SHOP_ORDER_456",
    "created_at": "2024-01-01T12:00:00Z",
    "payments": [
      {
        "id": "uuid",
        "payment_id": "mock_pay_abc123",
        "status": "completed",
        "amount": 29.99,
        "created_at": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Refund Order
Refund an order (full or partial).

**Endpoint:** `POST /orders/:id/refund`

**Request Body:**
```json
{
  "amount": 15.00  // Optional: partial refund amount
}
```

## Subscriptions API

### Get Subscriptions
Retrieve all subscriptions (requires admin authentication).

**Endpoint:** `GET /subscriptions`

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "customer_email": "customer@example.com",
      "product_id": "PROD_123",
      "amount": 29.99,
      "interval": "monthly",
      "status": "active",
      "last_payment": "2024-01-01T12:00:00Z",
      "next_billing_date": "2024-02-01T12:00:00Z",
      "created_at": "2024-01-01T12:00:00Z",
      "customers": {
        "email": "customer@example.com",
        "name": "John Doe"
      }
    }
  ]
}
```

### Get Subscription Statistics
Get subscription statistics.

**Endpoint:** `GET /subscriptions/stats`

**Response:**
```json
{
  "active": 45,
  "canceled": 5,
  "totalRevenue": 1350.00
}
```

### Cancel Subscription
Cancel a subscription.

**Endpoint:** `POST /subscriptions/:id/cancel`

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "status": "canceled",
    "updated_at": "2024-01-01T12:30:00Z"
  }
}
```

## Webhooks API

### Get Webhook Events
Retrieve webhook events with pagination and filtering.

**Endpoint:** `GET /mock-payments/webhooks/events`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `event_type` (payment.completed, payment.failed, subscription.created, etc.)
- `status` (pending, sent, failed)

**Response:**
```json
{
  "webhooks": [
    {
      "id": "uuid",
      "event_type": "payment.completed",
      "event_data": {
        "payment_id": "mock_pay_abc123",
        "customer_email": "customer@example.com",
        "amount": 29.99,
        "status": "completed"
      },
      "status": "sent",
      "attempts": 1,
      "last_attempt": "2024-01-01T12:01:00Z",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

### Resend Webhook
Resend a webhook event.

**Endpoint:** `POST /mock-payments/webhooks/:id/resend`

**Response:**
```json
{
  "success": true,
  "message": "Webhook resent successfully",
  "webhook_id": "uuid"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (missing or invalid authentication)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Webhook Events

The system generates the following webhook events:

### Payment Events
- `payment.completed` - Payment was successful
- `payment.failed` - Payment failed
- `payment.refunded` - Payment was refunded

### Subscription Events
- `subscription.created` - New subscription created
- `subscription.payment_succeeded` - Subscription payment successful
- `subscription.payment_failed` - Subscription payment failed
- `subscription.canceled` - Subscription was canceled

### Event Data Structure
Each webhook event contains:
```json
{
  "event_type": "payment.completed",
  "event_data": {
    // Event-specific data
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Testing

### Mock Payment Behavior
- Default success rate: 90%
- Processing delay: 100-2000ms (simulated)
- Payment IDs format: `mock_pay_[16-char-hex]`
- Transaction IDs format: `txn_[12-char-hex]`

### Test Scenarios
1. **Successful Payment**: Use default parameters
2. **Failed Payment**: Set `success_rate` to 0
3. **Subscription Testing**: Use `interval` other than "once"
4. **Refund Testing**: Process a successful payment, then refund it

### Example Test Requests

**Create a test subscription:**
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "product_id": "TEST_SUB_MONTHLY",
    "amount": 19.99,
    "interval": "monthly",
    "payment_method": "card"
  }'
```

**Process a one-time payment:**
```bash
curl -X POST http://localhost:3001/api/mock-payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "amount": 49.99,
    "currency": "USD",
    "payment_method": "card"
  }'
```

**Get payment statistics:**
```bash
curl http://localhost:3001/api/mock-payments/stats/30d
```