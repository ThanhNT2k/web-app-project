const multer = require('multer');

// Use memory storage — the file buffer is passed directly to Supabase Storage.
// We no longer save files to the local disk (which is ephemeral on Render).
const storage = multer.memoryStorage();

const uploadCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh'));
    }
    return cb(null, true);
  },
});

module.exports = {
  uploadCover,
  // uploadDir is no longer used but kept for backward compatibility
  uploadDir: null,
};
