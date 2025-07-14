# MapEase Event Management Backend

A multi-tenant event management system with map integration, built with Node.js, Express, and PostgreSQL.

## Features

- **Multi-tenant Architecture**: Subdomain-based tenant isolation
- **SSO Integration**: Integration with external SSO service
- **Role-based Access Control**: Super Admin, Tenant Admin, and Guest roles
- **Event Management**: Create, manage, and register for events
- **QR Code System**: Generate and scan QR codes for event entry
- **Map Integration**: SVG map uploads and access control
- **RESTful API**: Comprehensive API for all operations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with SSO integration
- **File Upload**: Multer for SVG maps and images
- **QR Codes**: qrcode package for generation
- **Validation**: Joi for request validation

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mapease-event-management
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database
```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

5. Start the development server
```bash
npm run dev
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET=your_jwt_secret
SSO_SERVICE_URL=https://identity.akshatmehta.com
BASE_DOMAIN=mapease.com
SUPER_ADMIN_EMAILS=email1@example.com,email2@example.com
```

## API Endpoints

### Authentication
- `POST /api/auth/sso/callback` - SSO authentication callback
- `GET /api/auth/sso/login` - Get SSO login URL

### Admin Routes (Super Admin only)
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/create-tenant` - Create new tenant
- `POST /api/admin/assign-tenant-admin` - Assign tenant admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/dashboard` - User dashboard data
- `GET /api/user/events` - User's registered events

### Tenant Routes
- `GET /api/:tenant` - Get tenant info
- `GET /api/:tenant/events` - List tenant events
- `GET /api/:tenant/dashboard` - Tenant dashboard (admin only)

### Event Routes
- `POST /api/:tenant/event/create` - Create event (admin only)
- `GET /api/:tenant/event/:id` - Get event details
- `POST /api/:tenant/event/:id/register` - Register for event
- `GET /api/:tenant/event/:id/registrations` - List registrations (admin only)
- `POST /api/:tenant/event/:id/approve-user/:userId` - Approve registration
- `POST /api/:tenant/event/:id/scan-qr` - Scan QR code
- `GET /api/:tenant/event/:id/map/:userId` - Access event map

## Database Schema

### Users
- Super Admins: Full system access
- Tenant Admins: Manage specific tenants
- Guests: Register for events

### Tenants
- Multi-tenant isolation by subdomain
- Each tenant has its own events and users

### Events
- Belong to specific tenants
- Support registration and QR code entry
- Can be open or closed type

### Event Users
- Track user registrations
- QR code generation and scanning
- Status tracking (pending/approved/rejected)

## Subdomain Configuration

For subdomain routing to work properly:

1. **DNS Configuration**: Set up wildcard DNS (*.mapease.com) pointing to your server
2. **Cloudflare Setup**: If using Cloudflare, configure wildcard subdomain proxying
3. **Load Balancer**: Configure your load balancer to handle wildcard subdomains

Example subdomain structure:
- `company-a.mapease.com` - Tenant A's events
- `university-b.mapease.com` - Tenant B's events
- `admin.mapease.com` - Admin dashboard

## Deployment

### Environment Setup
1. Set up PostgreSQL database (Supabase, Neon, or Railway recommended)
2. Configure environment variables
3. Run migrations and seed data

### Platform Deployment
- **Railway**: Connect GitHub repo and deploy
- **Render**: Connect GitHub repo and deploy
- **Fly.io**: Use fly.toml configuration

### Post-deployment
1. Configure DNS for wildcard subdomains
2. Set up SSL certificates
3. Configure CORS for your domains
4. Test SSO integration

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio
- `npm run seed` - Seed database with initial data

### File Structure
```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Seed data
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── tenantExtractor.js # Tenant extraction
│   ├── validation.js     # Request validation
│   └── upload.js         # File upload handling
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── admin.js          # Admin routes
│   ├── user.js           # User routes
│   ├── tenant.js         # Tenant routes
│   └── event.js          # Event routes
├── uploads/              # File uploads directory
└── server.js             # Main server file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
