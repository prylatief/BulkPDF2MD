const multer = require('multer');

// Gunakan penyimpanan RAM (Buffer) untuk performa tanpa menulis ke disk
const storage = multer.memoryStorage();

// Validasi tipe file hanya PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya file PDF yang diperbolehkan.'), false);
  }
};

const limitSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // default 10MB
const limitCount = parseInt(process.env.MAX_FILE_COUNT) || 20;

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: limitSize
  }
});

// Middleware penanganan upload bulk
const uploadBulk = upload.array('files', limitCount);

// Middleware penanganan single file (misal untuk preview)
const uploadSingle = upload.single('file');

module.exports = {
  uploadBulk,
  uploadSingle
};
