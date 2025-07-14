const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto'
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Check if we're in production and R2 is configured
const isR2Configured = process.env.NODE_ENV === 'production' && 
  process.env.R2_ACCOUNT_ID && 
  process.env.R2_ACCESS_KEY_ID && 
  process.env.R2_SECRET_ACCESS_KEY;

// Local storage configuration (for development)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'misc';
    
    if (file.fieldname === 'svgMap') {
      subfolder = 'maps';
    } else if (file.fieldname === 'avatar') {
      subfolder = 'avatars';
    }
    
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const fullPath = path.join(uploadDir, subfolder);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// R2 storage configuration (for production)
const r2Storage = multerS3({
  s3: s3Client,
  bucket: process.env.R2_BUCKET_NAME,
  key: (req, file, cb) => {
    let subfolder = 'misc';
    
    if (file.fieldname === 'svgMap') {
      subfolder = 'maps';
    } else if (file.fieldname === 'avatar') {
      subfolder = 'avatars';
    } else if (file.fieldname === 'qrcode') {
      subfolder = 'qrcodes';
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const fileName = `${subfolder}/${file.fieldname}-${uniqueSuffix}${extension}`;
    
    cb(null, fileName);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      uploadedAt: new Date().toISOString()
    });
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'svgMap') {
    // Only allow SVG files for maps
    if (file.mimetype === 'image/svg+xml' || file.originalname.toLowerCase().endsWith('.svg')) {
      cb(null, true);
    } else {
      cb(new Error('Only SVG files are allowed for maps'), false);
    }
  } else if (file.fieldname === 'avatar') {
    // Allow common image formats for avatars
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Create multer instance based on environment
const upload = multer({
  storage: isR2Configured ? r2Storage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5
  }
});

// Helper function to get file URL
const getFileUrl = (filePath) => {
  if (isR2Configured) {
    // For R2, return the public URL
    return `${process.env.R2_PUBLIC_URL}/${filePath}`;
  } else {
    // For local development, return relative path
    return `/uploads/${path.basename(filePath)}`;
  }
};

// Middleware to add file URL to request
const processUploadedFile = (req, res, next) => {
  if (req.file) {
    if (isR2Configured) {
      // For R2, the location is provided by multer-s3
      req.file.url = req.file.location;
    } else {
      // For local storage, construct the URL
      req.file.url = `/uploads/${path.relative('./uploads', req.file.path)}`;
    }
  }
  
  if (req.files) {
    req.files.forEach(file => {
      if (isR2Configured) {
        file.url = file.location;
      } else {
        file.url = `/uploads/${path.relative('./uploads', file.path)}`;
      }
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle: (fieldName) => [upload.single(fieldName), processUploadedFile],
  uploadMultiple: (fieldName, maxCount = 5) => [upload.array(fieldName, maxCount), processUploadedFile],
  uploadFields: (fields) => [upload.fields(fields), processUploadedFile],
  getFileUrl,
  isR2Configured
};
