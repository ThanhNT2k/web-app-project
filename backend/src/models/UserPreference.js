const db = require('../config/database');

// Giá trị mặc định cho cài đặt đọc truyện khi user lần đầu sử dụng
// Được export để controller có thể dùng khi tạo preferences mặc định
const defaults = {
  dark_mode: false,           // Chế độ sáng mặc định
  font_size: 16,              // Cỡ chữ 16px
  line_spacing: 1.5,          // Giãn dòng 1.5
  font_family: 'Inter, sans-serif', // Font chữ Inter
  theme_color: 'default',     // Màu chủ đạo mặc định
  auto_bookmark: true,        // Tự động lưu vị trí đọc
};

/**
 * Lấy cài đặt đọc truyện của một user.
 * Trả về null nếu user chưa có cài đặt (lần đầu sử dụng).
 */
async function getByUserId(userId) {
  const result = await db.query(
    'SELECT * FROM user_preferences WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Tạo mới hoặc cập nhật toàn bộ cài đặt của user (UPSERT).
 * Dùng toán tử ?? (nullish coalescing) để merge các giá trị theo thứ tự ưu tiên:
 * 1. Giá trị từ prefs (mới nhất, được gửi lên)
 * 2. Giá trị từ existing (hiện tại trong DB)
 * 3. Giá trị từ defaults (mặc định)
 *
 * Đây là cơ chế partial merge: chỉ cập nhật trường được gửi lên, giữ nguyên các trường còn lại.
 *
 * ON CONFLICT (user_id) DO UPDATE: Vì mỗi user chỉ có 1 bản ghi preferences
 */
async function upsert(userId, prefs) {
  // Lấy giá trị hiện tại để merge với giá trị mới
  const existing = await getByUserId(userId);

  // Merge giá trị theo thứ tự ưu tiên: prefs mới > existing trong DB > defaults
  const values = {
    dark_mode: prefs.dark_mode ?? existing?.dark_mode ?? defaults.dark_mode,
    font_size: prefs.font_size ?? existing?.font_size ?? defaults.font_size,
    line_spacing: prefs.line_spacing ?? existing?.line_spacing ?? defaults.line_spacing,
    font_family: prefs.font_family ?? existing?.font_family ?? defaults.font_family,
    theme_color: prefs.theme_color ?? existing?.theme_color ?? defaults.theme_color,
    auto_bookmark: prefs.auto_bookmark ?? existing?.auto_bookmark ?? defaults.auto_bookmark,
  };

  const result = await db.query(
    `
      INSERT INTO user_preferences (
        user_id, dark_mode, font_size, line_spacing, font_family, theme_color, auto_bookmark
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        dark_mode = EXCLUDED.dark_mode,
        font_size = EXCLUDED.font_size,
        line_spacing = EXCLUDED.line_spacing,
        font_family = EXCLUDED.font_family,
        theme_color = EXCLUDED.theme_color,
        auto_bookmark = EXCLUDED.auto_bookmark,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [
      userId,
      values.dark_mode,
      values.font_size,
      values.line_spacing,
      values.font_family,
      values.theme_color,
      values.auto_bookmark,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getByUserId,
  upsert,
  defaults, // Export defaults để controller có thể tạo preferences mặc định cho user mới
};
