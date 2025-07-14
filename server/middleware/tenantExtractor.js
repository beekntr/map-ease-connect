const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tenantExtractor = async (req, res, next) => {
  try {
    // Extract subdomain from hostname
    const hostname = req.get('host') || req.headers['x-forwarded-host'] || '';
    const baseDomain = process.env.BASE_DOMAIN || 'mapease.com';
    
    // Check if this is a subdomain request
    if (hostname && hostname !== baseDomain && hostname.endsWith(`.${baseDomain}`)) {
      const subdomain = hostname.replace(`.${baseDomain}`, '');
      
      // Find tenant by subdomain
      const tenant = await prisma.tenant.findUnique({
        where: { 
          subdomain: subdomain,
          isActive: true
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (tenant) {
        req.tenant = tenant;
        req.subdomain = subdomain;
      }
    }

    // Also check for tenant parameter in URL
    const tenantParam = req.params.tenant;
    if (tenantParam && !req.tenant) {
      const tenant = await prisma.tenant.findUnique({
        where: { 
          subdomain: tenantParam,
          isActive: true
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (tenant) {
        req.tenant = tenant;
        req.subdomain = tenantParam;
      }
    }

    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    next(); // Continue without tenant context
  }
};

const requireTenant = (req, res, next) => {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'Tenant context required',
      message: 'This endpoint requires a valid tenant subdomain'
    });
  }
  next();
};

module.exports = {
  tenantExtractor,
  requireTenant
};
