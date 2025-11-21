import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (we'll process before uploading to Supabase)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  const allowedDocTypes = process.env.ALLOWED_DOC_TYPES?.split(',') || [
    'application/pdf'
  ];

  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};
