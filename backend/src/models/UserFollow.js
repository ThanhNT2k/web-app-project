const db = require('../config/database');

/**
 * Theo dõi một truyện (INSERT vào bảng user_follows).
 * ON CONFLICT (user_id, story_id) DO NOTHING:
 * - Idempotent: Gọi nhiều lần không gây lỗi, không tạo bản ghi trùng
 * - Nếu đã follow, query thành công nhưng không insert thêm
 *
 * @returns Bản ghi follow vừa tạo, hoặc undefined nếu đã follow trước đó
 */
async function follow(userId, storyId) {
  const result = await db.query(
    `
      INSERT INTO user_follows (user_id, story_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, story_id) DO NOTHING
      RETURNING *
    `,
    [userId, storyId]
  );
  return result.rows[0];
}

/**
 * Bỏ theo dõi một truyện (DELETE khỏi bảng user_follows).
 * RETURNING id: Trả về id của record đã xóa; null nếu không tìm thấy (đã bỏ follow trước đó).
 * Idempotent: Gọi nhiều lần không gây lỗi.
 */
async function unfollow(userId, storyId) {
  const result = await db.query(
    'DELETE FROM user_follows WHERE user_id = $1 AND story_id = $2 RETURNING id',
    [userId, storyId]
  );
  return result.rows[0] || null;
}

/**
 * Kiểm tra xem user có đang follow một truyện hay không.
 * LIMIT 1: Tối ưu hiệu suất, chỉ cần biết có tồn tại hay không.
 * Boolean(result.rows[0]): Chuyển object (truthy) hoặc undefined (falsy) thành true/false.
 */
async function isFollowing(userId, storyId) {
  const result = await db.query(
    'SELECT id FROM user_follows WHERE user_id = $1 AND story_id = $2 LIMIT 1',
    [userId, storyId]
  );
  return Boolean(result.rows[0]);
}

/**
 * Lấy danh sách truyện mà user đang theo dõi (kèm thông tin truyện).
 * INNER JOIN stories: Chỉ lấy truyện còn tồn tại trong hệ thống.
 * Sắp xếp theo followed_at DESC: Truyện mới follow gần nhất hiển thị trước.
 */
async function getFollowedStories(userId) {
  const result = await db.query(
    `
      SELECT
        s.id,
        s.title,
        s.slug,
        s.cover_image_url,
        s.category,
        s.status,
        s.total_chapters,
        uf.followed_at    -- Thời điểm user bắt đầu follow truyện này
      FROM user_follows uf
      INNER JOIN stories s ON s.id = uf.story_id
      WHERE uf.user_id = $1
      ORDER BY uf.followed_at DESC
    `,
    [userId]
  );
  return result.rows;
}

module.exports = {
  follow,
  unfollow,
  isFollowing,
  getFollowedStories,
};
