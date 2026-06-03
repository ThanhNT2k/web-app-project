const db = require('../config/database');

/**
 * Lấy danh sách bình luận của một truyện (kèm thông tin người dùng).
 * INNER JOIN users: Chỉ lấy comment có user tồn tại (tránh comment mồ côi nếu user bị xóa).
 * Sắp xếp DESC: Bình luận mới nhất hiển thị trước.
 *
 * @param {number} storyId - ID của truyện
 * @param {number} limit - Số bình luận tối đa trả về (mặc định 50)
 */
async function getByStory(storyId, limit = 50) {
  const id = parseInt(storyId, 10);
  // Validate ID hợp lệ trước khi query để tránh lỗi DB
  if (!id) return [];

  const result = await db.query(
    `
      SELECT
        c.id,
        c.user_id,
        c.story_id,
        c.chapter_id,
        c.content,
        c.rating,
        c.created_at,
        c.updated_at,
        u.username,
        u.full_name,
        u.avatar_url
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.story_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2
    `,
    [id, limit]
  );
  return result.rows;
}

/**
 * Lấy danh sách bình luận của một chương cụ thể.
 * Tham số storyId tùy chọn để lọc thêm (đảm bảo chapter thuộc đúng story).
 * $2::int IS NULL: Bỏ qua điều kiện story_id nếu không được cung cấp.
 */
async function getByChapter(chapterId, storyId = null, limit = 50) {
  const chapterInt = parseInt(chapterId, 10);
  if (!chapterInt) return [];

  const result = await db.query(
    `
      SELECT
        c.id,
        c.user_id,
        c.story_id,
        c.chapter_id,
        c.content,
        c.rating,
        c.created_at,
        u.username,
        u.full_name
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.chapter_id = $1
        AND ($2::int IS NULL OR c.story_id = $2)   -- Lọc theo story nếu có, bỏ qua nếu không
      ORDER BY c.created_at DESC
      LIMIT $3
    `,
    [chapterInt, storyId ? parseInt(storyId, 10) : null, limit]
  );
  return result.rows;
}

/**
 * Tạo bình luận mới.
 * RETURNING *: Trả về toàn bộ record vừa INSERT (nhưng chưa bao gồm thông tin user).
 * Controller sẽ fetch lại với JOIN users để có thông tin đầy đủ.
 */
async function create({ userId, storyId, chapterId, content, rating }) {
  const result = await db.query(
    `
      INSERT INTO comments (user_id, story_id, chapter_id, content, rating)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [userId, storyId, chapterId || null, content, rating || null]
  );
  return result.rows[0];
}

/**
 * Tìm bình luận theo ID (dùng để kiểm tra quyền sở hữu trước khi xóa).
 */
async function findById(id) {
  const result = await db.query('SELECT * FROM comments WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

/**
 * Xóa bình luận theo ID (hard delete).
 * RETURNING id: Trả về id của record đã xóa để xác nhận xóa thành công.
 * Trả về null nếu không tìm thấy record để xóa.
 */
async function remove(id) {
  const result = await db.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = {
  getByStory,
  getByChapter,
  create,
  findById,
  remove,
};
