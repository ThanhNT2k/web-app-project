const db = require('../config/database');

/**
 * Tạo một thông báo mới cho người dùng.
 * @param {number} userId - ID của người dùng nhận thông báo
 * @param {number} storyId - ID của truyện
 * @param {number} chapterId - ID của chương (có thể null)
 * @param {string} message - Nội dung thông báo
 * @param {string} link - URL dẫn đến chương/truyện
 * @param {string} type - Loại thông báo ('new_chapter', 'system', 'announcement')
 * @returns Bản ghi thông báo vừa tạo
 */
async function create(userId, storyId, chapterId, message, link, type = 'new_chapter') {
  const result = await db.query(
    `
      INSERT INTO notifications (user_id, story_id, chapter_id, message, link, type, is_read)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING *
    `,
    [userId, storyId, chapterId, message, link, type]
  );
  return result.rows[0];
}

/**
 * Tạo thông báo hàng loạt cho nhiều người dùng.
 * Được sử dụng khi một chương mới được đăng tải.
 * @param {number[]} userIds - Danh sách ID người dùng
 * @param {number} storyId - ID của truyện
 * @param {number} chapterId - ID của chương
 * @param {string} message - Nội dung thông báo
 * @param {string} link - URL dẫn đến chương
 * @returns Danh sách bản ghi thông báo vừa tạo
 */
async function createBatch(userIds, storyId, chapterId, message, link) {
  if (!userIds.length) return [];

  const values = userIds
    .map((userId, idx) => `(${userId}, ${storyId}, ${chapterId}, '${message.replace(/'/g, "''")}', '${link}', 'new_chapter', false)`)
    .join(',');

  const result = await db.query(
    `
      INSERT INTO notifications (user_id, story_id, chapter_id, message, link, type, is_read)
      VALUES ${values}
      RETURNING *
    `
  );
  return result.rows;
}

/**
 * Lấy danh sách thông báo của người dùng (phân trang).
 * Sắp xếp theo thời gian tạo từ mới nhất đến cũ nhất.
 * @param {number} userId - ID của người dùng
 * @param {number} limit - Số thông báo trên một trang
 * @param {number} offset - Offset (page * limit)
 * @returns { notifications: [...], total: number }
 */
async function getNotifications(userId, limit = 10, offset = 0) {
  const notificationsResult = await db.query(
    `
      SELECT
        n.id,
        n.user_id,
        n.story_id,
        n.chapter_id,
        n.message,
        n.link,
        n.type,
        n.is_read,
        n.created_at,
        n.read_at,
        s.title as story_title,
        s.slug as story_slug,
        s.cover_image_url,
        c.chapter_number
      FROM notifications n
      LEFT JOIN stories s ON n.story_id = s.id
      LEFT JOIN chapters c ON n.chapter_id = c.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  const countResult = await db.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
    [userId]
  );

  return {
    notifications: notificationsResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * Lấy số thông báo chưa đọc của người dùng.
 * @param {number} userId - ID của người dùng
 * @returns Số thông báo chưa đọc
 */
async function getUnreadCount(userId) {
  const result = await db.query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Đánh dấu một thông báo là đã đọc.
 * @param {number} notificationId - ID của thông báo
 * @returns Bản ghi thông báo đã cập nhật
 */
async function markAsRead(notificationId) {
  const result = await db.query(
    `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    [notificationId]
  );
  return result.rows[0];
}

/**
 * Đánh dấu tất cả thông báo của một người dùng là đã đọc.
 * @param {number} userId - ID của người dùng
 * @returns Số thông báo được cập nhật
 */
async function markAllAsRead(userId) {
  const result = await db.query(
    `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING *
    `,
    [userId]
  );
  return result.rows.length;
}

/**
 * Xóa một thông báo.
 * @param {number} notificationId - ID của thông báo
 * @returns Bản ghi thông báo đã xóa
 */
async function deleteNotification(notificationId) {
  const result = await db.query(
    'DELETE FROM notifications WHERE id = $1 RETURNING *',
    [notificationId]
  );
  return result.rows[0];
}

/**
 * Xóa tất cả thông báo của một người dùng.
 * @param {number} userId - ID của người dùng
 * @returns Số thông báo được xóa
 */
async function deleteAllNotifications(userId) {
  const result = await db.query(
    'DELETE FROM notifications WHERE user_id = $1 RETURNING *',
    [userId]
  );
  return result.rows.length;
}

/**
 * Lấy một thông báo cụ thể.
 * @param {number} notificationId - ID của thông báo
 * @returns Bản ghi thông báo
 */
async function getNotificationById(notificationId) {
  const result = await db.query(
    'SELECT * FROM notifications WHERE id = $1',
    [notificationId]
  );
  return result.rows[0];
}

module.exports = {
  create,
  createBatch,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationById,
};
