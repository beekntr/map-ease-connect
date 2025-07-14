# Cloudflare R2 Setup Guide

## Getting R2 API Credentials

### Step 1: Access R2 in Cloudflare Dashboard
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Navigate to **R2 Object Storage** in the left sidebar

### Step 2: Create R2 API Token
1. Click **"Manage R2 API tokens"** (on the right side of the page)
2. Click **"Create API token"**
3. Configure the token:
   - **Token name**: `MapEase Backend Token`
   - **Permissions**: 
     - `Object Storage:Edit` (allows read/write to buckets)
   - **Account resources**: 
     - Include: Your account
   - **R2 resources**:
     - Include: Specific bucket → `mapease-uploads`

### Step 3: Get Your Credentials
After creating the token, you'll see:
- **Access Key ID**: Copy this value
- **Secret Access Key**: Copy this value (only shown once!)

### Step 4: Update Environment Variables
Update your `.env` file with these values:

```env
R2_ACCOUNT_ID=0048c69f9eb335e50f8c98ce682d79a3
R2_ACCESS_KEY_ID=your_access_key_from_step_3
R2_SECRET_ACCESS_KEY=your_secret_key_from_step_3
R2_BUCKET_NAME=mapease-uploads
R2_PUBLIC_URL=https://mapease-uploads.0048c69f9eb335e50f8c98ce682d79a3.r2.cloudflarestorage.com
```

### Step 5: Configure Public Access (Optional)
If you want public read access to files:
1. Go to your R2 bucket settings
2. Under **Settings** → **Public access**
3. Enable **"Allow access"**
4. Set up custom domain if needed

## Testing R2 Integration

After setting up credentials, test the integration:

1. Start your development server:
```bash
npm run dev
```

2. Test file upload endpoint (requires authentication):
```bash
# Upload SVG map as super admin
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "svgMap=@your-map.svg" \
  -F "placeName=Test Tenant" \
  -F "subdomain=test-tenant" \
  http://localhost:5000/api/admin/create-tenant
```

## Important Notes

- **Security**: Never commit your R2 credentials to version control
- **Development**: In development mode, files are stored locally in `./uploads/`
- **Production**: In production (`NODE_ENV=production`), files are uploaded to R2
- **Bucket**: Make sure your bucket exists and is in the correct region
- **CORS**: Configure CORS on your R2 bucket if needed for browser uploads

## Current Configuration Status

✅ Account ID: `0048c69f9eb335e50f8c98ce682d79a3`
✅ Bucket Name: `mapease-uploads`
✅ S3 Endpoint: Configured for R2
❌ Access Key ID: **Need to add from Cloudflare**
❌ Secret Access Key: **Need to add from Cloudflare**

Replace the placeholder values in your `.env` file with the actual credentials from Cloudflare.
