const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      tenantAdmins: {
        include: {
          tenant: {
            select: {
              id: true,
              placeName: true,
              subdomain: true,
              isActive: true
            }
          }
        }
      },
      createdTenants: {
        select: {
          id: true,
          placeName: true,
          subdomain: true,
          isActive: true,
          createdAt: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      managedTenants: user.tenantAdmins.map(ta => ta.tenant),
      createdTenants: user.createdTenants
    }
  });
}));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { name } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name })
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      isActive: true
    }
  });

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
}));

// Get user dashboard data
router.get('/dashboard', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let dashboardData = {
    user: {
      id: userId,
      name: req.user.name,
      email: req.user.email,
      role: userRole
    }
  };

  if (userRole === 'SUPER_ADMIN') {
    // Super admin dashboard
    const [
      totalTenants,
      totalUsers,
      totalEvents,
      recentEvents
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.event.count(),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: { placeName: true, subdomain: true }
          },
          _count: {
            select: { eventUsers: true }
          }
        }
      })
    ]);

    dashboardData.stats = {
      totalTenants,
      totalUsers,
      totalEvents
    };
    dashboardData.recentEvents = recentEvents;

  } else if (userRole === 'TENANT_ADMIN') {
    // Tenant admin dashboard
    const tenantAdmins = await prisma.tenantAdmin.findMany({
      where: { userId },
      include: {
        tenant: {
          include: {
            events: {
              include: {
                _count: {
                  select: { eventUsers: true }
                }
              }
            }
          }
        }
      }
    });

    const managedTenants = tenantAdmins.map(ta => ta.tenant);
    const allEvents = managedTenants.flatMap(tenant => tenant.events);

    dashboardData.managedTenants = managedTenants.map(tenant => ({
      id: tenant.id,
      placeName: tenant.placeName,
      subdomain: tenant.subdomain,
      eventsCount: tenant.events.length,
      totalRegistrations: tenant.events.reduce((sum, event) => sum + event._count.eventUsers, 0)
    }));

    dashboardData.stats = {
      managedTenants: managedTenants.length,
      totalEvents: allEvents.length,
      totalRegistrations: allEvents.reduce((sum, event) => sum + event._count.eventUsers, 0)
    };

    dashboardData.recentEvents = allEvents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(event => ({
        ...event,
        tenant: managedTenants.find(t => t.id === event.tenantId)
      }));

  } else {
    // Guest user dashboard
    const userEvents = await prisma.eventUser.findMany({
      where: { 
        OR: [
          { email: req.user.email },
          { userId: userId }
        ]
      },
      include: {
        event: {
          include: {
            tenant: {
              select: { placeName: true, subdomain: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    dashboardData.registeredEvents = userEvents;
    dashboardData.stats = {
      totalRegistrations: userEvents.length,
      approvedRegistrations: userEvents.filter(eu => eu.status === 'APPROVED').length,
      pendingRegistrations: userEvents.filter(eu => eu.status === 'PENDING').length
    };
  }

  res.json(dashboardData);
}));

// Get user's registered events
router.get('/events', authenticateToken, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const where = {
    OR: [
      { email: req.user.email },
      { userId: req.user.id }
    ],
    ...(status && { status })
  };

  const [eventUsers, total] = await Promise.all([
    prisma.eventUser.findMany({
      where,
      include: {
        event: {
          include: {
            tenant: {
              select: { placeName: true, subdomain: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.eventUser.count({ where })
  ]);

  res.json({
    events: eventUsers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

module.exports = router;
