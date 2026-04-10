import multer from 'multer';
import path from 'path';

// Memory storage is best for Cloudinary/Render setups
const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
  // Broad regex to handle variations like .JPG or .webp
  const filetypes = /jpg|jpeg|png|pdf|webp|jfif/i; 
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Format not supported! Use JPG, PNG, or WebP.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;