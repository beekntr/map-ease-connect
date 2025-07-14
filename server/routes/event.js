const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { authenticateToken, requireTenantAdmin } = require('../middleware/auth');
const { requireTenant } = require('../middleware/tenantExtractor');
const { validateRequest, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { isR2Configured } = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize S3 client for QR code uploads
let s3Client;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// Create event (tenant admin only)
router.post('/:tenant/event/create',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  validateRequest(schemas.createEvent),
  asyncHandler(async (req, res) => {
    const { eventName, locationName, eventType, description, startDate, endDate } = req.body;
    
    const shareLink = uuidv4();

    const event = await prisma.event.create({
      data: {
        tenantId: req.tenant.id,
        eventName,
        locationName,
        eventType: eventType || 'OPEN',
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        shareLink
      }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
      publicUrl: `https://${req.tenant.subdomain}.${process.env.BASE_DOMAIN}/event/${event.id}`
    });
  })
);

// Get event details (public route)
router.get('/:tenant/event/:id',
  requireTenant,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        id,
        tenantId: req.tenant.id,
        isActive: true
      },
      include: {
        tenant: {
          select: {
            placeName: true,
            subdomain: true
          }
        },
        _count: {
          select: { eventUsers: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  })
);

// Register for event (public route)
router.post('/:tenant/event/:id/register',
  requireTenant,
  validateRequest(schemas.registerForEvent),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Check if event exists and is active
    const event = await prisma.event.findFirst({
      where: {
        id,
        tenantId: req.tenant.id,
        isActive: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user already registered
    const existingRegistration = await prisma.eventUser.findUnique({
      where: {
        eventId_email: {
          eventId: id,
          email
        }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        error: 'Already registered',
        registration: existingRegistration
      });
    }

    // Find user if exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    const eventUser = await prisma.eventUser.create({
      data: {
        eventId: id,
        userId: user?.id || null,
        name,
        email,
        phone,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration: eventUser
    });
  })
);

// Get event registrations (tenant admin only)
router.get('/:tenant/event/:id/registrations',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const where = {
      eventId: id,
      ...(status && { status })
    };

    const [registrations, total] = await Promise.all([
      prisma.eventUser.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.eventUser.count({ where })
    ]);

    res.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// Approve user registration (tenant admin only)
router.post('/:tenant/event/:id/approve-user/:userId',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const eventUser = await prisma.eventUser.findFirst({
      where: {
        id: userId,
        eventId: id,
        event: { tenantId: req.tenant.id }
      }
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (eventUser.status === 'APPROVED') {
      return res.status(400).json({ error: 'User already approved' });
    }

    // Generate QR code
    const qrCode = uuidv4();
    let qrCodeUrl = null;

    try {
      // Generate QR code image
      const qrCodeBuffer = await QRCode.toBuffer(qrCode, {
        type: 'png',
        width: 256,
        margin: 2
      });

      if (isR2Configured) {
        // Upload to R2
        const fileName = `qrcodes/${qrCode}.png`;
        const uploadCommand = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: qrCodeBuffer,
          ContentType: 'image/png',
          Metadata: {
            eventId: id,
            userId: userId,
            createdAt: new Date().toISOString()
          }
        });

        await s3Client.send(uploadCommand);
        qrCodeUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      } else {
        // Save locally for development
        const qrDir = path.join(process.env.UPLOAD_PATH || './uploads', 'qrcodes');
        if (!fs.existsSync(qrDir)) {
          fs.mkdirSync(qrDir, { recursive: true });
        }

        const qrPath = path.join(qrDir, `${qrCode}.png`);
        fs.writeFileSync(qrPath, qrCodeBuffer);
        qrCodeUrl = `/uploads/qrcodes/${qrCode}.png`;
      }

      const updatedEventUser = await prisma.eventUser.update({
        where: { id: userId },
        data: {
          status: 'APPROVED',
          qrCode
        }
      });

      res.json({
        message: 'User approved successfully',
        registration: updatedEventUser,
        qrCodeUrl
      });
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      
      // Still approve the user even if QR generation fails
      const updatedEventUser = await prisma.eventUser.update({
        where: { id: userId },
        data: {
          status: 'APPROVED',
          qrCode
        }
      });

      res.json({
        message: 'User approved successfully (QR code generation failed)',
        registration: updatedEventUser,
        qrCodeUrl: null
      });
    }
  })
);

// Reject user registration (tenant admin only)
router.post('/:tenant/event/:id/reject-user/:userId',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const updatedEventUser = await prisma.eventUser.updateMany({
      where: {
        id: userId,
        eventId: id,
        event: { tenantId: req.tenant.id }
      },
      data: {
        status: 'REJECTED'
      }
    });

    if (updatedEventUser.count === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'User registration rejected' });
  })
);

// Scan QR code (tenant admin only)
router.post('/:tenant/event/:id/scan-qr',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  validateRequest(schemas.scanQR),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { qrCode } = req.body;

    const eventUser = await prisma.eventUser.findFirst({
      where: {
        qrCode,
        eventId: id,
        event: { tenantId: req.tenant.id },
        status: 'APPROVED'
      },
      include: {
        event: {
          select: { eventName: true, locationName: true }
        }
      }
    });

    if (!eventUser) {
      return res.status(404).json({ error: 'Invalid QR code or registration not approved' });
    }

    if (eventUser.scanned) {
      return res.status(400).json({ 
        error: 'QR code already scanned',
        scannedAt: eventUser.scannedAt
      });
    }

    const updatedEventUser = await prisma.eventUser.update({
      where: { id: eventUser.id },
      data: {
        scanned: true,
        scannedAt: new Date()
      }
    });

    res.json({
      message: 'QR code scanned successfully',
      registration: {
        name: updatedEventUser.name,
        email: updatedEventUser.email,
        event: eventUser.event,
        scannedAt: updatedEventUser.scannedAt
      }
    });
  })
);

// Get map for approved user
router.get('/:tenant/event/:id/map/:userId',
  requireTenant,
  asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const eventUser = await prisma.eventUser.findFirst({
      where: {
        id: userId,
        eventId: id,
        event: { tenantId: req.tenant.id },
        status: 'APPROVED',
        scanned: true
      },
      include: {
        event: {
          include: {
            tenant: true
          }
        }
      }
    });

    if (!eventUser) {
      return res.status(403).json({ 
        error: 'Access denied. QR code must be scanned and registration must be approved.' 
      });
    }

    if (!eventUser.event.tenant.svgPath) {
      return res.status(404).json({ error: 'Map not available for this event' });
    }

    // Return map URL or content
    res.json({
      mapUrl: eventUser.event.tenant.svgPath,
      event: {
        name: eventUser.event.eventName,
        location: eventUser.event.locationName
      },
      user: {
        name: eventUser.name,
        email: eventUser.email
      }
    });
  })
);

// Update event (tenant admin only)
router.put('/:tenant/event/:id',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { eventName, locationName, eventType, description, startDate, endDate, isActive } = req.body;

    const updateData = {};
    if (eventName) updateData.eventName = eventName;
    if (locationName) updateData.locationName = locationName;
    if (eventType) updateData.eventType = eventType;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const event = await prisma.event.updateMany({
      where: {
        id,
        tenantId: req.tenant.id
      },
      data: updateData
    });

    if (event.count === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  })
);

// Delete event (tenant admin only)
router.delete('/:tenant/event/:id',
  requireTenant,
  authenticateToken,
  requireTenantAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedEvent = await prisma.event.deleteMany({
      where: {
        id,
        tenantId: req.tenant.id
      }
    });

    if (deletedEvent.count === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  })
);

module.exports = router;
