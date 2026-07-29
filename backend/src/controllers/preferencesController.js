const Joi = require('joi');

const UserPreference = require('../models/UserPreference');

// Schema validate khi cập nhật cài đặt đọc truyện
// .min(1): Yêu cầu gửi ít nhất 1 trường (tránh request rỗng vô nghĩa)
// Các khoảng giá trị được giới hạn để tránh cài đặt cực đoan (ví dụ font_size quá nhỏ hoặc quá lớn)
const updateSchema = Joi.object({
  dark_mode: Joi.boolean(),                          // Chế độ tối
  font_size: Joi.number().integer().min(12).max(32), // Cỡ chữ (12px - 32px)
  line_spacing: Joi.number().min(1).max(3),          // Giãn dòng (1 - 3)
  font_family: Joi.string().max(100),                // Font chữ
  theme_color: Joi.string().max(50),                 // Màu chủ đạo
  auto_bookmark: Joi.boolean(),                      // Tự động lưu vị trí đọc
  auto_unlock_next_chapter: Joi.boolean(),
}).min(1);

/**
 * Lấy cài đặt đọc truyện của user hiện tại.
 * Nếu user chưa có cài đặt (lần đầu dùng), tự động tạo bản ghi với giá trị mặc định.
 * Đảm bảo mọi user đều có cài đặt hợp lệ khi đọc truyện.
 */
async function getPreferences(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let prefs = await UserPreference.getByUserId(req.user.id);

    // Nếu chưa có record trong DB, tự động tạo với giá trị mặc định
    // Đảm bảo user luôn có cài đặt để frontend không phải xử lý trường hợp null
    if (!prefs) {
      prefs = await UserPreference.upsert(req.user.id, UserPreference.defaults);
    }

    return res.status(200).json({ success: true, preferences: prefs });
  } catch (err) {
    console.error('[preferencesController.getPreferences]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Cập nhật cài đặt đọc truyện của user.
 * Dùng UPSERT nên an toàn: tạo mới nếu chưa có, cập nhật nếu đã có.
 * Chỉ các trường được gửi lên mới được cập nhật (merge với cài đặt cũ).
 */
async function updatePreferences(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
    }

    // UPSERT: Tạo mới hoặc cập nhật cài đặt tùy theo đã tồn tại hay chưa
    const prefs = await UserPreference.upsert(req.user.id, value);
    return res.status(200).json({ success: true, preferences: prefs });
  } catch (err) {
    console.error('[preferencesController.updatePreferences]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getPreferences,
  updatePreferences,
};
