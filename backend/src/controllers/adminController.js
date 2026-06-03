const Joi = require('joi');

// Import pool database, User và Story model, Comment model cho các thao tác admin
const { User, Story, db } = require('../models');
const Comment = require('../models/Comment');

/**
 * Lấy thống kê tổng quan cho trang admin dashboard.
 * Dùng Promise.all để chạy 4 query COUNT song song, giảm thời gian chờ.
 * ::int là PostgreSQL type cast để chuyển bigint thành integer (dễ dùng hơn ở JS).
 */
async function getStats(req, res) {
  try {
    // Chạy 4 query đếm song song (concurrent) thay vì tuần tự để tối ưu hiệu suất
    const [users, stories, chapters, comments] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS c FROM users'),                                     // Tổng số người dùng
      db.query('SELECT COUNT(*)::int AS c FROM stories WHERE is_published = true'),         // Chỉ đếm truyện đã published
      db.query('SELECT COUNT(*)::int AS c FROM chapters'),                                  // Tổng số chương
      db.query('SELECT COUNT(*)::int AS c FROM comments'),                                  // Tổng số bình luận
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        users: users.rows[0].c,
        stories: stories.rows[0].c,
        chapters: chapters.rows[0].c,
        comments: comments.rows[0].c,
      },
    });
  } catch (err) {
    console.error('[adminController.getStats]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Lấy danh sách tất cả người dùng (tối đa 200 user).
 * Dùng để Admin xem, quản lý và phân quyền người dùng.
 */
async function getUsers(req, res) {
  try {
    // Giới hạn 200 user để tránh response quá lớn; trong thực tế nên có pagination
    const users = await User.findAll(200);
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('[adminController.getUsers]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Schema validate khi cập nhật role user
// Chỉ cho phép 4 role được định nghĩa trong hệ thống: Admin, Uploader, User, Guest
const roleSchema = Joi.object({
  role: Joi.string().valid('Admin', 'Uploader', 'User', 'Guest').required(),
});

/**
 * Cập nhật role (vai trò) của một user.
 * Chỉ Admin mới được gọi endpoint này (kiểm soát bởi roleMiddleware ở route).
 * Thay đổi role ảnh hưởng đến quyền truy cập các tính năng của user đó.
 */
async function updateUserRole(req, res) {
  try {
    const { error, value } = roleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // req.params.id: ID của user cần cập nhật role (từ URL /admin/users/:id/role)
    const updated = await User.updateRole(req.params.id, value.role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    console.error('[adminController.updateUserRole]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Admin xóa bình luận vi phạm.
 * Khác với commentController.remove, endpoint này chỉ dành cho Admin
 * và không cần kiểm tra quyền sở hữu bình luận.
 */
async function deleteComment(req, res) {
  try {
    const removed = await Comment.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('[adminController.deleteComment]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Admin lấy danh sách tất cả truyện (bao gồm cả truyện chưa published).
 * includeUnpublished = true: cho phép Admin thấy tất cả truyện kể cả đã bị ẩn.
 * Giới hạn 50 truyện mỗi trang, sắp xếp mới nhất trước.
 */
async function getAllStories(req, res) {
  try {
    const result = await Story.getAllStories(req.query.page || 1, req.query.limit || 50, 'newest', true);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[adminController.getAllStories]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteComment,
  getAllStories,
};
