const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to get latest info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: userRoles,
        current: req.user.role
      });
    }

    next();
  };
};

const requireTenantAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admins can access everything
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user is tenant admin for the current tenant
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    const tenantAdmin = await prisma.tenantAdmin.findUnique({
      where: {
        userId_tenantId: {
          userId: req.user.id,
          tenantId: req.tenant.id
        }
      }
    });

    if (!tenantAdmin) {
      return res.status(403).json({ 
        error: 'Tenant admin access required',
        tenant: req.tenant.subdomain
      });
    }

    next();
  } catch (error) {
    console.error('Tenant admin middleware error:', error);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireTenantAdmin
};
