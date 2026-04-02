import multer from 'multer';
import path from 'path';

// Use process.cwd() so this module works under Jest and normal runtime
const uploadsDir = path.join(process.cwd(), 'uploads');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in '<cwd>/uploads/' (ensure folder exists)
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Naming convention: fieldname-timestamp.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter (Images and PDFs)
const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images and PDFs only! (jpg, jpeg, png, pdf)'));
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