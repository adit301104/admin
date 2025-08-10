# Subscription Management System

A complete subscription management system with Node.js backend and React dashboard.

## Project Structure

```
Admin/
├── backend/                 # Node.js Express API
│   ├── routes/             # API route handlers
│   ├── database/           # Database schema
│   ├── package.json
│   ├── server.js
│   └── .env.example
└── frontend/               # React Admin Dashboard
    ├── src/
    │   ├── components/     # React components
    │   ├── lib/           # Utilities (Supabase client)
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

## Quick Start

### Option 1: Use the startup script (Windows)
```bash
# Double-click start-backend.bat or run:
start-backend.bat
```

### Option 2: Manual setup

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Dashboard:**
   - Open http://localhost:3000
   - Login with: admin / admin123

## Backend Setup (Detailed)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are pre-configured in `.env`
   - For production, update with real credentials
   - Current setup works for demo purposes

4. **Optional:** Set up database schema:
   
   **For Supabase (Production):**
   - Run the SQL in `database/schema.sql` in your Supabase SQL editor
   - Update `.env` with your Supabase credentials
   
   **For Development/Testing:**
   - Use `database/schema-simple.sql` (includes sample data)
   - Works with any PostgreSQL database

5. Start the server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

## Features

### Backend
- **POST /api/orders**: Process Shoptet orders and create Stripe subscriptions
- **GET /api/subscriptions**: Fetch all subscriptions with real-time updates
- **GET /api/subscriptions/stats**: Get subscription statistics
- **POST /api/subscriptions/:id/cancel**: Cancel a subscription
- **POST /api/webhooks/stripe**: Handle Stripe webhook events
- WebSocket support for real-time updates
- Cron jobs for recurring billing

### Frontend
- Real-time subscription dashboard via WebSocket
- Live statistics (active/canceled/revenue)
- Filterable subscription table
- One-click subscription cancellation
- Responsive design
- Direct API communication with backend (no Supabase dependency)

## Deployment

### Backend
Deploy to any Node.js hosting service (Heroku, Railway, etc.)

### Frontend
Deploy to Vercel:
```bash
npm run build
vercel --prod
```

## Environment Variables

### Backend (.env)
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend (.env)
```
VITE_BACKEND_URL=http://localhost:3001
```