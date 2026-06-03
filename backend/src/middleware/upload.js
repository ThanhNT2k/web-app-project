const path = require('path');
const multer = require('multer');

// Sử dụng memory storage thay vì disk storage vì:
// 1. Trên Render.com, filesystem là ephemeral (mất khi restart)
// 2. File buffer được đẩy trực tiếp lên Supabase Storage mà không cần lưu local
// 3. Tiết kiệm dung lượng ổ đĩa server
const storage = multer.memoryStorage();

// Cấu hình middleware upload ảnh bìa truyện
const uploadCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file tối đa 5MB

  // Hàm lọc file: chỉ chấp nhận file có MIME type là ảnh (image/*)
  // Tránh người dùng upload file thực thi, script, hay tài liệu lên server
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ chấp nhận file ảnh'));
    }
    return cb(null, true);
  },
});

module.exports = {
  uploadCover,
  // uploadDir vẫn được export để tương thích ngược với app.js (express.static)
  // trong trường hợp Supabase chưa cấu hình và dùng fallback lưu file local
  uploadDir: path.resolve(__dirname, '../../uploads/covers'),
};
