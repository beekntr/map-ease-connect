const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Test database connection
router.get('/db-test', asyncHandler(async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();
    const eventCount = await prisma.event.count();
    
    res.json({
      message: 'Database connection successful',
      stats: {
        users: userCount,
        tenants: tenantCount,
        events: eventCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });
  }
}));

// Test file upload configuration
router.get('/upload-test', (req, res) => {
  const { isR2Configured } = require('../middleware/upload');
  
  res.json({
    message: 'Upload configuration',
    storage: isR2Configured ? 'Cloudflare R2' : 'Local Storage',
    isProduction: process.env.NODE_ENV === 'production',
    r2Configured: isR2Configured,
    baseDomain: process.env.BASE_DOMAIN,
    timestamp: new Date().toISOString()
  });
});

// Test SSO configuration
router.get('/sso-test', (req, res) => {
  res.json({
    message: 'SSO configuration',
    ssoUrl: process.env.SSO_SERVICE_URL,
    superAdmins: (process.env.SUPER_ADMIN_EMAILS || '').split(',').map(email => email.trim()),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
