# MapEase Event Management - Cloudflare Configuration Guide

This guide explains how to configure Cloudflare for subdomain routing in the MapEase Event Management system.

## Overview

MapEase uses subdomain-based multi-tenancy where each tenant gets their own subdomain:
- `tenant1.mapease.com`
- `tenant2.mapease.com` 
- `admin.mapease.com`

## Step-by-Step Cloudflare Configuration

### 1. Domain Setup

1. **Add your domain to Cloudflare**
   - Go to Cloudflare dashboard
   - Add `mapease.com` as a new site
   - Update your domain's nameservers to Cloudflare's

### 2. DNS Configuration

Add the following DNS records in Cloudflare:

```
Type: A
Name: @
Content: YOUR_SERVER_IP
Proxy status: Proxied (Orange cloud)

Type: A  
Name: *
Content: YOUR_SERVER_IP
Proxy status: Proxied (Orange cloud)

Type: CNAME
Name: www
Content: mapease.com
Proxy status: Proxied (Orange cloud)
```

The wildcard record (`*`) is crucial as it handles all subdomains.

### 3. SSL/TLS Configuration

1. **SSL/TLS Tab**
   - Set encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

2. **Edge Certificates**
   - Enable "Universal SSL"
   - The wildcard certificate will automatically cover subdomains

### 4. Page Rules (Optional but Recommended)

Create page rules for better performance:

```
Rule 1: *.mapease.com/*
Settings:
- Cache Level: Standard
- Browser Cache TTL: Respect Existing Headers

Rule 2: admin.mapease.com/*  
Settings:
- Security Level: High
- Cache Level: Bypass
```

### 5. Security Settings

1. **Firewall Rules**
   - Consider rate limiting for API endpoints
   - Block suspicious traffic patterns

2. **Bot Management**
   - Enable bot fight mode
   - Configure challenge pages

### 6. Performance Optimization

1. **Speed Tab**
   - Enable Auto Minify (CSS, HTML, JS)
   - Enable Brotli compression
   - Enable Rocket Loader (if compatible)

2. **Caching**
   - Set custom cache rules for static assets
   - Configure cache TTL appropriately

## Testing the Configuration

### 1. Verify DNS Propagation
```bash
# Check if wildcard DNS works
nslookup test123.mapease.com
dig test123.mapease.com
```

### 2. Test Subdomain Access
```bash
# Test main domain
curl -I https://mapease.com/health

# Test subdomain
curl -I https://tenant1.mapease.com/health
```

### 3. SSL Certificate Verification
```bash
# Check SSL certificate covers wildcards
openssl s_client -connect tenant1.mapease.com:443 -servername tenant1.mapease.com
```

## Backend Configuration for Cloudflare

Update your backend to handle Cloudflare headers:

### 1. Trust Cloudflare IPs

Add to your Express app:

```javascript
// Trust Cloudflare proxy
app.set('trust proxy', true);

// Handle Cloudflare headers
app.use((req, res, next) => {
  // Get real IP from Cloudflare
  const realIP = req.headers['cf-connecting-ip'] || 
                 req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress;
  req.realIP = realIP;
  
  // Get original host
  const originalHost = req.headers['cf-host'] || req.headers.host;
  req.originalHost = originalHost;
  
  next();
});
```

### 2. Update CORS Configuration

```javascript
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const baseDomain = process.env.BASE_DOMAIN || 'mapease.com';
    const allowedOrigins = [
      `https://${baseDomain}`,
      `https://www.${baseDomain}`,
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow all subdomains of base domain
    if (origin.endsWith(`.${baseDomain}`) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
```

### 3. Handle Rate Limiting with Cloudflare

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: (req) => {
    // Use real IP from Cloudflare
    return req.headers['cf-connecting-ip'] || req.ip;
  },
  message: {
    error: 'Too many requests from this IP'
  }
});
```

## Troubleshooting

### Common Issues

1. **Subdomain not resolving**
   - Check wildcard DNS record exists
   - Verify DNS propagation (can take up to 48 hours)
   - Check Cloudflare proxy status

2. **SSL errors on subdomains**
   - Ensure Universal SSL is enabled
   - Check certificate covers wildcard domains
   - Verify SSL/TLS mode is "Full (strict)"

3. **503 errors**
   - Check origin server is accessible
   - Verify server can handle HOST header correctly
   - Check firewall rules aren't blocking traffic

### Debug Commands

```bash
# Check DNS resolution
dig @1.1.1.1 tenant1.mapease.com

# Test direct server access
curl -H "Host: tenant1.mapease.com" http://YOUR_SERVER_IP/health

# Check SSL certificate
echo | openssl s_client -connect tenant1.mapease.com:443 2>/dev/null | openssl x509 -noout -text
```

## Advanced Configuration

### 1. Multiple Environments

For staging/production environments:

```
Production: *.mapease.com → Production Server
Staging: *.staging.mapease.com → Staging Server
```

### 2. Cloudflare Workers (Optional)

Use Workers for advanced routing logic:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const hostname = url.hostname
  
  // Custom routing logic
  if (hostname.includes('admin.')) {
    // Route to admin backend
  } else if (hostname.includes('api.')) {
    // Route to API backend
  }
  
  return fetch(request)
}
```

### 3. Analytics and Monitoring

- Enable Cloudflare Analytics
- Set up log retention
- Monitor performance metrics
- Configure alerts for downtime

## Security Best Practices

1. **Enable DDoS Protection**
2. **Configure Bot Management**
3. **Set up Rate Limiting**
4. **Enable Security Headers**
5. **Use Authenticated Origin Pulls**
6. **Regular security audits**

This configuration will provide a robust, secure, and performant subdomain routing system for your MapEase application.
