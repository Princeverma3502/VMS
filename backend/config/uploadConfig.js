import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in 'backend/uploads/'
    // You must manually create this folder in your root directory!
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Naming convention: fieldname-timestamp.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter (Images only)
const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, jpeg, png)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // Limit: 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;