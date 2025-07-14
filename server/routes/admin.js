const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { validateRequest, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require super admin role
router.use(authenticateToken);
router.use(requireRole('SUPER_ADMIN'));

// Get all tenants
router.get('/tenants', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const where = search ? {
    OR: [
      { placeName: { contains: search, mode: 'insensitive' } },
      { subdomain: { contains: search, mode: 'insensitive' } }
    ]
  } : {};

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        admins: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { events: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.tenant.count({ where })
  ]);

  res.json({
    tenants,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create new tenant
router.post('/create-tenant', 
  uploadSingle('svgMap'),
  validateRequest(schemas.createTenant),
  asyncHandler(async (req, res) => {
    const { placeName, subdomain } = req.body;

    // Check if subdomain already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain }
    });

    if (existingTenant) {
      return res.status(400).json({ error: 'Subdomain already exists' });
    }

    // Handle SVG file upload
    let svgPath = null;
    if (req.file) {
      svgPath = req.file.url; // Use the processed URL from upload middleware
    }

    const tenant = await prisma.tenant.create({
      data: {
        placeName,
        subdomain,
        svgPath,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant
    });
  })
);

// Assign tenant admin
router.post('/assign-tenant-admin',
  validateRequest(schemas.assignTenantAdmin),
  asyncHandler(async (req, res) => {
    const { email, tenantId } = req.body;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Default name from email
          role: 'TENANT_ADMIN'
        }
      });
    } else if (user.role === 'GUEST') {
      // Update role to tenant admin if currently guest
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'TENANT_ADMIN' }
      });
    }

    // Check if already assigned
    const existingAssignment = await prisma.tenantAdmin.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenantId
        }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'User is already a tenant admin for this tenant' });
    }

    // Create tenant admin assignment
    await prisma.tenantAdmin.create({
      data: {
        userId: user.id,
        tenantId: tenantId
      }
    });

    res.json({
      message: 'Tenant admin assigned successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tenant: {
        id: tenant.id,
        placeName: tenant.placeName,
        subdomain: tenant.subdomain
      }
    });
  })
);

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }),
    ...(role && { role })
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        tenantAdmins: {
          include: {
            tenant: {
              select: { id: true, placeName: true, subdomain: true }
            }
          }
        },
        _count: {
          select: { createdTenants: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Update tenant
router.put('/tenants/:id',
  uploadSingle('svgMap'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { placeName, subdomain, isActive } = req.body;

    const updateData = {};
    if (placeName) updateData.placeName = placeName;
    if (subdomain) updateData.subdomain = subdomain;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Handle SVG file upload
    if (req.file) {
      updateData.svgPath = req.file.url; // Use the processed URL from upload middleware
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        admins: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.json({
      message: 'Tenant updated successfully',
      tenant
    });
  })
);

// Delete tenant
router.delete('/tenants/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.tenant.delete({
    where: { id }
  });

  res.json({ message: 'Tenant deleted successfully' });
}));

// Get dashboard stats
router.get('/dashboard/stats', asyncHandler(async (req, res) => {
  const [
    totalTenants,
    activeTenants,
    totalUsers,
    totalEvents,
    recentTenants
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.event.count(),
    prisma.tenant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        _count: {
          select: { events: true }
        }
      }
    })
  ]);

  res.json({
    stats: {
      totalTenants,
      activeTenants,
      totalUsers,
      totalEvents
    },
    recentTenants
  });
}));

module.exports = router;
