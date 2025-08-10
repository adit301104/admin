const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Hardcoded admin credentials for demo
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { 
          id: 'admin-id',
          username: 'admin',
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const user = {
        id: 'admin-id',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        last_login: new Date()
      };

      res.json({
        success: true,
        token,
        user
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/verify - Verify JWT token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/logout - Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { router, authenticateToken };