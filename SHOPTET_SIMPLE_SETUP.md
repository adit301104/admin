# Simple Shoptet Mock Payment Setup

A minimal setup for testing Shoptet integration with mock payments.

## Quick Start

1. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Test the system:**
   ```bash
   node test-shoptet-payment.js
   ```

## What's Included

- ✅ Simple mock payment processing (95% success rate)
- ✅ MongoDB integration for order storage
- ✅ Basic Shoptet order handling
- ✅ No complex payment providers (Stripe/PayPal removed)
- ✅ Ready-to-use API endpoints

## API Endpoints

### Process Order
```bash
POST /api/orders
{
  "customer_email": "customer@example.com",
  "product_id": "SHOPTET_PRODUCT_123",
  "amount": 29.99,
  "currency": "USD",
  "shoptet_order_id": "SHOPTET_ORDER_456"
}
```

### Get Orders
```bash
GET /api/orders
```

### System Status
```bash
GET /api/mock-payments/status
```

### Test Payment
```bash
POST /api/mock-payments/test
{
  "amount": 10.00,
  "currency": "USD",
  "customer_email": "test@shoptet.com"
}
```

## Shoptet Integration

Add this to your Shoptet theme:

```html
<script src="/path/to/shoptet-simple-integration.js"></script>
```

The script will:
1. Add a "Test Payment (Mock)" option to checkout
2. Process payments through your backend
3. Handle success/failure responses

## Environment Variables

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MOCK_PAYMENT_SUCCESS_RATE=0.95
```

## Testing

Run the test script to verify everything works:

```bash
node test-shoptet-payment.js
```

Expected output:
- ✅ System Status: active
- ✅ Database Status: connected  
- ✅ Order Result: success
- ✅ Orders Count: 1+

## Next Steps

1. Deploy your backend to a hosting service
2. Update the `backendUrl` in the Shoptet integration script
3. Add the script to your Shoptet theme
4. Test with real Shoptet orders

## Support

The system is now simplified and ready for Shoptet integration with just mock payments!