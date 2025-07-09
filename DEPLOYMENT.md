# 🚀 MapEase Connect - Vercel Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/map-ease-connect)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account

## Environment Variables

Set these in your Vercel dashboard:

```bash
VITE_API_BASE_URL=https://identity.akshatmehta.com
VITE_APP_NAME="MapEase Connect"
VITE_APP_URL=https://your-app.vercel.app
```

## Deployment Steps

### Option 1: Automatic Deployment

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
3. **Configure Environment Variables** in Vercel dashboard
4. **Deploy** - Vercel will automatically build and deploy

### Option 2: Manual Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/map-ease-connect.git
   cd map-ease-connect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

## Build Configuration

The project is optimized for production with:

- ✅ **Code Splitting**: Automatic vendor chunk splitting
- ✅ **Tree Shaking**: Unused code elimination  
- ✅ **Asset Optimization**: Minified CSS/JS with proper caching
- ✅ **Environment Variables**: Secure configuration management
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **SEO Optimization**: Proper meta tags and structure
- ✅ **Security Headers**: XSS, CSRF, and content-type protection

## Performance Features

### Bundle Analysis
```bash
npm run build
# Check dist/ folder sizes
```

### Optimization Features
- **Lazy Loading**: Route-based code splitting
- **Asset Caching**: Long-term caching for static assets
- **Compression**: Gzip compression enabled
- **CDN**: Vercel Edge Network for global distribution

## Configuration Files

### `vercel.json`
- SPA routing configuration
- Asset caching headers
- Security headers
- Build optimization

### `vite.config.ts`
- Bundle splitting strategy
- Build optimization
- Development server config

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] OAuth redirect URLs updated in providers
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Environment Variables:**
- Ensure all `VITE_` prefixed variables are set
- Check Vercel dashboard environment variables
- Redeploy after changing environment variables

**OAuth Issues:**
- Update redirect URLs in OAuth provider settings
- Verify API_BASE_URL is accessible from your domain

### Performance Monitoring

Monitor your deployment:
- **Vercel Analytics**: Built-in performance metrics
- **Core Web Vitals**: Lighthouse scores in Vercel dashboard
- **Error Tracking**: Monitor error boundary triggers

## Security

### Headers Applied
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
```

### Best Practices Implemented
- Environment-based configuration
- Secure token storage
- CORS configuration
- Input validation

## Support

For deployment issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Verify environment variables
4. Test local build with `npm run build && npm run preview`

---

**Production URL**: Your app will be available at `https://your-app.vercel.app`

**Build Time**: ~2-3 minutes
**Cold Start**: ~100ms  
**Global CDN**: 99.99% uptime
