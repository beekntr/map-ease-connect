const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// SSO callback route
router.post('/sso/callback', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'SSO token required' });
  }

  try {
    // Verify token with SSO service - based on your SSO frontend code
    const ssoResponse = await axios.get(`${process.env.SSO_SERVICE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const userData = ssoResponse.data.user;

    if (!userData || !userData.email) {
      return res.status(400).json({ error: 'Invalid user data from SSO' });
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map(email => email.trim());
    const defaultRole = superAdminEmails.includes(userData.email) ? 'SUPER_ADMIN' : 'GUEST';

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          avatar: userData.picture || userData.avatar || null,
          role: defaultRole
        }
      });
    } else {
      // Update user info from SSO
      user = await prisma.user.update({
        where: { email: userData.email },
        data: {
          name: userData.name || user.name,
          avatar: userData.picture || userData.avatar || user.avatar,
          // Update role if user is in super admin list and not already super admin
          ...(defaultRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && { role: 'SUPER_ADMIN' })
        }
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('SSO callback error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid SSO token' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
}));

// Verify token endpoint (for checking if user is still authenticated)
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
}));

// Get SSO login URL
router.get('/sso/login', (req, res) => {
  const redirectUrl = req.query.redirect || `https://${process.env.BASE_DOMAIN}`;
  const ssoLoginUrl = `${process.env.SSO_SERVICE_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
  
  res.json({
    loginUrl: ssoLoginUrl
  });
});

// Logout route
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // But we can add token blacklisting here if needed
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
