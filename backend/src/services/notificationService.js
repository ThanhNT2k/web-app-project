const Notification = require('../models/Notification');
const db = require('../config/database');

/**
 * Tìm tất cả người dùng đang theo dõi một truyện.
 * @param {number} storyId - ID của truyện
 * @returns Array của user IDs
 */
async function getFollowersOfStory(storyId) {
  const result = await db.query(
    'SELECT user_id FROM user_follows WHERE story_id = $1',
    [storyId]
  );
  return result.rows.map((row) => row.user_id);
}

/**
 * Gửi thông báo cho tất cả người dùng theo dõi một truyện
 * (thường được gọi khi một chương mới được publish).
 *
 * @param {object} chapterData - Dữ liệu chương: { id, story_id, chapter_number, title }
 * @param {object} storyData - Dữ liệu truyện: { id, title, slug }
 * @returns { success: boolean, notified_count: number }
 */
async function notifyFollowersNewChapter(chapterData, storyData) {
  try {
    // Lấy danh sách user theo dõi truyện
    const followers = await getFollowersOfStory(storyData.id);

    if (!followers.length) {
      return { success: true, notified_count: 0 };
    }

    // Xây dựng message và link
    const message = `Chương ${chapterData.chapter_number}${chapterData.title ? ` - ${chapterData.title}` : ''} của "${storyData.title}" vừa được đăng tải`;
    const link = `/story/${storyData.slug}/chapter/${chapterData.chapter_number}`;

    // Tạo thông báo cho tất cả followers
    await Notification.createBatch(followers, storyData.id, chapterData.id, message, link);

    // TODO: Có thể gửi email/push notification ở đây sử dụng queue worker

    return { success: true, notified_count: followers.length };
  } catch (error) {
    console.error('Error notifying followers:', error);
    throw error;
  }
}

/**
 * Lọc followers theo cài đặt thông báo của họ.
 * Chỉ lấy những người dùng có bật thông báo email hoặc push cho chương mới.
 * @param {number[]} userIds - Danh sách user IDs
 * @returns Array của user IDs có bật ít nhất một loại thông báo
 */
async function filterUsersByNotificationPreferences(userIds) {
  if (!userIds.length) return [];

  const result = await db.query(
    `
      SELECT DISTINCT uf.user_id
      FROM (SELECT UNNEST($1::integer[]) AS user_id) uf
      LEFT JOIN notification_preferences np ON np.user_id = uf.user_id
      WHERE np.email_new_chapter = true OR np.push_new_chapter = true
         OR np.id IS NULL  -- Nếu chưa có preferences, mặc định là bật
    `,
    [userIds]
  );
  return result.rows.map((row) => row.user_id);
}

/**
 * Tạo thông báo hệ thống cho tất cả người dùng hoặc nhóm người dùng cụ thể.
 * @param {string} message - Nội dung thông báo
 * @param {string} link - URL (nếu có)
 * @param {number[]} userIds - Danh sách user IDs (nếu null, gửi cho tất cả người dùng)
 * @returns { success: boolean, notified_count: number }
 */
async function createSystemNotification(message, link = null, userIds = null) {
  try {
    let targetUsers = userIds;

    // Nếu không chỉ định userIds, lấy tất cả active users
    if (!userIds) {
      const result = await db.query('SELECT id FROM users WHERE is_active = true');
      targetUsers = result.rows.map((row) => row.id);
    }

    if (!targetUsers.length) {
      return { success: true, notified_count: 0 };
    }

    // Tạo thông báo system cho tất cả người dùng
    const values = targetUsers
      .map((userId) => `(${userId}, 0, NULL, '${message.replace(/'/g, "''")}', '${link || ''}', 'system', false)`)
      .join(',');

    await db.query(`
      INSERT INTO notifications (user_id, story_id, chapter_id, message, link, type, is_read)
      VALUES ${values}
    `);

    return { success: true, notified_count: targetUsers.length };
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
}

/**
 * Xóa thông báo cũ (hơn X ngày).
 * Giúp giữ database sạch sẽ.
 * @param {number} daysOld - Xóa thông báo cũ hơn X ngày
 * @returns Số thông báo đã xóa
 */
async function deleteOldNotifications(daysOld = 30) {
  try {
    const result = await db.query(
      `
        DELETE FROM notifications
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
        RETURNING id
      `,
      [daysOld]
    );
    return result.rows.length;
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
}

module.exports = {
  notifyFollowersNewChapter,
  filterUsersByNotificationPreferences,
  createSystemNotification,
  deleteOldNotifications,
  getFollowersOfStory,
};
