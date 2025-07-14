const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireTenantAdmin } = require('../middleware/auth');
const { requireTenant } = require('../middleware/tenantExtractor');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Get tenant info (public route)
router.get('/:tenant', requireTenant, asyncHandler(async (req, res) => {
  const tenant = req.tenant;

  res.json({
    tenant: {
      id: tenant.id,
      placeName: tenant.placeName,
      subdomain: tenant.subdomain,
      svgPath: tenant.svgPath,
      creator: tenant.creator
    }
  });
}));

// Get tenant events (public route)
router.get('/:tenant/events', requireTenant, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type;

  const where = {
    tenantId: req.tenant.id,
    isActive: true,
    ...(type && { eventType: type })
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: {
        id: true,
        eventName: true,
        locationName: true,
        eventType: true,
        description: true,
        startDate: true,
        endDate: true,
        shareLink: true,
        createdAt: true,
        _count: {
          select: { eventUsers: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.event.count({ where })
  ]);

  res.json({
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get tenant dashboard (admin only)
router.get('/:tenant/dashboard', 
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenant.id;

    const [
      totalEvents,
      activeEvents,
      totalRegistrations,
      pendingRegistrations,
      recentEvents
    ] = await Promise.all([
      prisma.event.count({ where: { tenantId } }),
      prisma.event.count({ where: { tenantId, isActive: true } }),
      prisma.eventUser.count({
        where: {
          event: { tenantId }
        }
      }),
      prisma.eventUser.count({
        where: {
          event: { tenantId },
          status: 'PENDING'
        }
      }),
      prisma.event.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { eventUsers: true }
          }
        }
      })
    ]);

    res.json({
      tenant: {
        id: req.tenant.id,
        placeName: req.tenant.placeName,
        subdomain: req.tenant.subdomain
      },
      stats: {
        totalEvents,
        activeEvents,
        totalRegistrations,
        pendingRegistrations
      },
      recentEvents
    });
  })
);

// Get tenant admins (admin only)
router.get('/:tenant/admins',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const admins = await prisma.tenantAdmin.findMany({
      where: { tenantId: req.tenant.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    res.json({
      admins: admins.map(admin => admin.user)
    });
  })
);

module.exports = router;
