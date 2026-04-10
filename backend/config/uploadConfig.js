import multer from 'multer';
import path from 'path';

// Use memoryStorage for production (Cloudinary/Render compatible)
const storage = multer.memoryStorage();

// File filter (Expanded for mobile compatibility)
const checkFileType = (file, cb) => {
  // Added webp and jfif; made regex case-insensitive 'i'
  const filetypes = /jpg|jpeg|png|pdf|webp|jfif/i; 
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Better error message so students know WHY it failed
    cb(new Error('Format not supported! Use JPG, PNG, or WebP.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB for modern phone photos
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;