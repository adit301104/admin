# Shoptet Mock Payment Integration Guide

This guide will help you integrate the mock payment system with your Shoptet e-commerce store for testing purposes.

## Overview

The mock payment system provides:
- ✅ Simulated payment processing without real money
- ✅ Subscription management and recurring billing
- ✅ Webhook events for payment status updates
- ✅ Admin dashboard for monitoring transactions
- ✅ Refund and cancellation capabilities
- ✅ Multiple payment methods simulation

## Prerequisites

1. **Shoptet Store**: You need access to a Shoptet store with admin privileges
2. **Backend Server**: The Node.js backend should be running (default: `http://localhost:3001`)
3. **Database**: Supabase database with the updated schema
4. **Web Server**: For hosting the PHP webhook handler (if using PHP integration)

## Integration Steps

### Step 1: Database Setup

1. **Apply the database schema:**
   ```sql
   -- Run the contents of backend/database/schema.sql in your Supabase database
   ```

2. **Verify tables are created:**
   - `admin_users`
   - `customers`
   - `subscriptions`
   - `orders`
   - `mock_payments`
   - `mock_subscription_cycles`
   - `mock_webhooks`

### Step 2: Backend Configuration

1. **Update environment variables** in `backend/.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   PORT=3001
   ```

2. **Start the backend server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Verify the server is running:**
   ```bash
   curl http://localhost:3001/api/mock-payments/stats/24h
   ```

### Step 3: Shoptet Webhook Configuration

#### Option A: PHP Webhook Handler (Recommended)

1. **Upload the webhook handler** to your web server:
   - Copy `shoptet-integration/shoptet-webhook-handler.php` to your web server
   - Make it accessible via URL (e.g., `https://yoursite.com/shoptet-webhook.php`)

2. **Configure the webhook in Shoptet admin:**
   - Go to **Settings** → **API** → **Webhooks**
   - Add new webhook with URL: `https://yoursite.com/shoptet-webhook.php`
   - Select events: `order:created`, `order:changed`, `order:paid`, `order:cancelled`
   - Set webhook secret (optional but recommended)

3. **Update webhook handler configuration:**
   ```php
   $BACKEND_URL = 'http://your-backend-url:3001'; // Update this
   $WEBHOOK_SECRET = 'your-webhook-secret'; // Match Shoptet configuration
   ```

#### Option B: Direct Integration

If you prefer to handle webhooks directly in your backend:

1. **Add webhook endpoint** to your backend (already included in the routes)
2. **Configure Shoptet webhook** to point directly to your backend:
   - URL: `http://your-backend-url:3001/api/webhooks/shoptet`

### Step 4: Frontend Integration

#### Option A: JavaScript Integration

1. **Add the integration script** to your Shoptet theme:
   ```html
   <!-- Add this to your theme's footer or checkout page -->
   <script src="/path/to/shoptet-frontend-integration.js"></script>
   ```

2. **Configure the integration:**
   ```javascript
   // Update the configuration in the script
   const config = {
       backendUrl: 'http://your-backend-url:3001',
       apiKey: '', // Optional
       debug: false // Set to true for testing
   };
   ```

#### Option B: Custom Payment Method

1. **Add custom payment method** in Shoptet admin:
   - Go to **Settings** → **Payment Methods**
   - Add new payment method: "Test Payment (Mock)"
   - Set it as active for testing

2. **Handle payment processing** in your theme:
   ```javascript
   // Example checkout form handling
   document.querySelector('#checkout-form').addEventListener('submit', async (e) => {
       const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
       
       if (paymentMethod === 'mock-payment') {
           e.preventDefault();
           
           const orderData = {
               customer_email: document.querySelector('input[name="email"]').value,
               product_id: 'SHOPTET_PRODUCT_123',
               amount: parseFloat(document.querySelector('.total-price').textContent),
               interval: 'once', // or 'monthly', 'yearly', etc.
               payment_method: 'card'
           };
           
           try {
               const response = await fetch('http://your-backend-url:3001/api/orders', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(orderData)
               });
               
               const result = await response.json();
               
               if (result.success) {
                   window.location.href = '/checkout/success';
               } else {
                   alert('Payment failed: ' + result.error);
               }
           } catch (error) {
               alert('Payment error: ' + error.message);
           }
       }
   });
   ```

### Step 5: Product Configuration for Subscriptions

To enable subscription products in Shoptet:

1. **Use product codes** to identify subscription products:
   - Monthly subscription: `SUB_MONTHLY_PRODUCT_NAME`
   - Yearly subscription: `SUB_YEARLY_PRODUCT_NAME`
   - Weekly subscription: `SUB_WEEKLY_PRODUCT_NAME`

2. **Or use product names** with subscription keywords:
   - "Premium Plan - Monthly Subscription"
   - "Basic Plan - Yearly Subscription"

3. **The integration will automatically detect** subscription products based on:
   - Product code patterns (`SUB_MONTHLY`, `SUB_YEARLY`, etc.)
   - Product name keywords (`monthly`, `yearly`, `weekly`, `quarterly`)

### Step 6: Testing the Integration

#### Test One-Time Payment

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "product_id": "TEST_PRODUCT",
    "amount": 29.99,
    "interval": "once",
    "shoptet_order_id": "SHOPTET_123",
    "payment_method": "card",
    "currency": "USD"
  }'
```

#### Test Subscription

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "product_id": "SUB_MONTHLY_PREMIUM",
    "amount": 19.99,
    "interval": "monthly",
    "shoptet_order_id": "SHOPTET_124",
    "payment_method": "card",
    "currency": "USD"
  }'
```

#### Test Payment Failure

```bash
curl -X POST http://localhost:3001/api/mock-payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "amount": 29.99,
    "success_rate": 0
  }'
```

### Step 7: Admin Dashboard Access

1. **Access the admin dashboard** (if you have a frontend):
   - URL: `http://localhost:3000` (or your frontend URL)
   - Login with default credentials: `admin` / `admin123`

2. **Monitor payments and subscriptions:**
   - View all transactions
   - Process refunds
   - Cancel subscriptions
   - View webhook events

### Step 8: Webhook Event Handling

The system automatically generates webhook events for:

- **Payment Events:**
  - `payment.completed`
  - `payment.failed`
  - `payment.refunded`

- **Subscription Events:**
  - `subscription.created`
  - `subscription.payment_succeeded`
  - `subscription.payment_failed`

**Example webhook payload:**
```json
{
  "event_type": "payment.completed",
  "event_data": {
    "payment_id": "mock_pay_abc123",
    "customer_email": "customer@example.com",
    "amount": 29.99,
    "currency": "USD",
    "status": "completed",
    "order_id": "uuid",
    "subscription_id": "uuid"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Advanced Configuration

### Custom Payment Success Rates

You can configure different success rates for testing:

```javascript
// 90% success rate (default)
const payment1 = await processPayment(orderData, 0.9);

// 50% success rate (for testing failures)
const payment2 = await processPayment(orderData, 0.5);

// 100% success rate (always succeeds)
const payment3 = await processPayment(orderData, 1.0);
```

### Subscription Intervals

Supported subscription intervals:
- `daily` - Daily billing
- `weekly` - Weekly billing
- `monthly` - Monthly billing (default)
- `quarterly` - Every 3 months
- `yearly` - Annual billing

### Payment Methods

Supported payment methods:
- `card` - Credit/Debit card
- `bank_transfer` - Bank transfer
- `paypal` - PayPal
- `cod` - Cash on delivery

### Currency Support

The system supports multiple currencies:
- `USD` - US Dollar (default)
- `EUR` - Euro
- `GBP` - British Pound
- `CZK` - Czech Koruna

## Troubleshooting

### Common Issues

1. **Backend not responding:**
   - Check if the server is running: `curl http://localhost:3001/api/mock-payments/stats/24h`
   - Verify environment variables are set correctly
   - Check server logs for errors

2. **Database connection issues:**
   - Verify Supabase URL and service key
   - Check if database schema is applied correctly
   - Ensure RLS policies are configured

3. **Webhook not receiving events:**
   - Verify webhook URL is accessible from Shoptet
   - Check webhook handler logs
   - Ensure webhook secret matches (if used)

4. **Payment processing fails:**
   - Check request payload format
   - Verify required fields are provided
   - Check backend logs for detailed error messages

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// In frontend integration
const config = {
    debug: true
};

// In backend (add to .env)
DEBUG=true
```

### API Testing

Use the provided API documentation to test endpoints:

```bash
# Get payment statistics
curl http://localhost:3001/api/mock-payments/stats/30d

# List recent payments
curl http://localhost:3001/api/mock-payments?limit=10

# Get webhook events
curl http://localhost:3001/api/mock-payments/webhooks/events?limit=10
```

## Production Considerations

⚠️ **Important**: This is a mock payment system for testing only!

Before going to production:

1. **Replace mock payments** with real payment processor (Stripe, PayPal, etc.)
2. **Implement proper security** measures
3. **Add input validation** and sanitization
4. **Set up proper error handling** and logging
5. **Configure SSL/HTTPS** for all communications
6. **Implement rate limiting** and DDoS protection
7. **Add monitoring** and alerting

## Support

For issues and questions:

1. Check the API documentation: `API_DOCUMENTATION.md`
2. Review server logs for error details
3. Test individual API endpoints using curl or Postman
4. Verify database schema and data integrity

## Next Steps

1. **Test the integration** thoroughly with various scenarios
2. **Customize the frontend** integration for your specific needs
3. **Set up monitoring** for payments and subscriptions
4. **Plan the migration** to a real payment processor
5. **Document your customizations** for future reference