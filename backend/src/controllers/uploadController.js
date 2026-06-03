const path = require('path');

// Supabase JS client để upload file lên Supabase Storage
const { createClient } = require('@supabase/supabase-js');
const env = require('../config/environment');

// Tên bucket Supabase nơi lưu ảnh bìa truyện
// Bucket 'covers' phải được tạo trước trong Supabase dashboard với quyền public read
const BUCKET = 'covers';

/**
 * Tạo Supabase client với service role key.
 * Service role key có quyền bypass Row Level Security (RLS) và toàn quyền với Storage.
 * Trả về null nếu credentials chưa được cấu hình (development mode).
 */
function getSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return null;
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

/**
 * Upload ảnh bìa truyện.
 * Luồng: Nhận file từ multer (memory storage) → Upload lên Supabase Storage → Trả về public URL
 *
 * Nếu Supabase chưa cấu hình (dev environment):
 * - Tạo placeholder URL dạng <API_URL>/uploads/covers/<timestamp>-placeholder.jpg
 * - Cho phép app hoạt động mà không cần Supabase
 */
async function uploadCover(req, res) {
  try {
    // req.file được set bởi multer middleware (upload.js) khi có file hợp lệ được gửi lên
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
    }

    const supabase = getSupabase();

    // ── Fallback: Supabase not configured ──────────────────────────────────
    // Return a placeholder URL so the rest of the app still works during dev.
    if (!supabase) {
      console.warn('[uploadController] SUPABASE_URL/SUPABASE_SERVICE_KEY not set. Using placeholder URL.');
      // Tạo placeholder URL để frontend có URL hợp lệ, dù ảnh không thật sự tồn tại
      const placeholder = `${(env.API_URL || 'http://localhost:5000').replace(/\/$/, '')}/uploads/covers/${Date.now()}-placeholder.jpg`;
      return res.status(200).json({ success: true, url: placeholder, filename: req.file.originalname });
    }

    // ── Upload to Supabase Storage ──────────────────────────────────────────
    // Tạo tên file unique bằng cách kết hợp timestamp + số ngẫu nhiên + extension gốc
    // Tránh bị override khi nhiều user upload file cùng tên
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    // Upload buffer của file lên Supabase Storage
    // upsert: false => báo lỗi nếu file đã tồn tại (tên file unique nên thực tế sẽ không xảy ra)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadController] Supabase upload error:', uploadError.message);
      return res.status(500).json({ success: false, message: `Upload thất bại: ${uploadError.message}` });
    }

    // Lấy public URL của file vừa upload để lưu vào database và hiển thị trên frontend
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return res.status(200).json({
      success: true,
      url: data.publicUrl, // URL công khai để hiển thị ảnh
      filename,
    });
  } catch (err) {
    console.error('[uploadController.uploadCover]', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
}

module.exports = {
  uploadCover,
};
