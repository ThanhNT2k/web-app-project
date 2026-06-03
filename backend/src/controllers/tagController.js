const Joi = require('joi');

const Tag = require('../models/Tag');

// Schema validate khi tạo tag mới: chỉ cần name, 1-100 ký tự
const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
});

/**
 * Lấy danh sách tất cả tags/thể loại trong hệ thống.
 * Dùng để hiển thị dropdown lọc thể loại hoặc gợi ý khi tạo truyện.
 * Public endpoint, không yêu cầu đăng nhập.
 */
async function listTags(req, res) {
  try {
    const tags = await Tag.findAll();
    return res.status(200).json({ success: true, tags });
  } catch (err) {
    console.error('[tagController.listTags]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Tạo tag mới hoặc lấy tag đã tồn tại (findOrCreate pattern).
 * Dùng cơ chế upsert ở model để đảm bảo không tạo tag trùng.
 * Tên tag được chuyển thành slug để dễ tìm kiếm và URL-friendly.
 */
async function createTag(req, res) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // findOrCreate: Nếu tag đã tồn tại (theo slug) thì trả về tag cũ, không tạo mới trùng
    const tag = await Tag.findOrCreate(value.name);
    return res.status(201).json({ success: true, tag });
  } catch (err) {
    console.error('[tagController.createTag]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  listTags,
  createTag,
};
