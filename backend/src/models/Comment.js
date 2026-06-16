const db = require('../config/database');
const { moderateContent } = require('../services/moderationService');

function addDisplayContent(comment) {
  if (!comment) return comment;

  if (comment.status === 'rejected') {
    return {
      ...comment,
      display_content: 'Bình luận đã bị từ chối do vi phạm tiêu chuẩn cộng đồng',
    };
  }

  if (comment.status === 'flagged') {
    return {
      ...comment,
      display_content: 'Bình luận này đã bị gắn cờ là spam',
    };
  }

  const displayContent = comment.status === 'masked'
    ? moderateContent(comment.content).maskedContent
    : comment.content;
  return { ...comment, display_content: displayContent };
}

/**
 * Lấy danh sách bình luận của một truyện (kèm thông tin người dùng).
 */
async function getByStory(storyId, limit = 50) {
  const id = parseInt(storyId, 10);
  if (!id) return [];

  const result = await db.query(
    `
      SELECT
        c.id, c.user_id, c.story_id, c.chapter_id, c.content, c.rating,
        c.created_at, c.updated_at, c.status, c.is_spam,
        u.username, u.full_name, u.avatar_url
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.story_id = $1 AND c.status != 'rejected'
      ORDER BY c.created_at DESC
      LIMIT $2
    `,
    [id, limit]
  );
  return result.rows.map(addDisplayContent);
}

/**
 * Lấy danh sách bình luận của một chương cụ thể.
 */
async function getByChapter(chapterId, storyId = null, limit = 50) {
  const chapterInt = parseInt(chapterId, 10);
  if (!chapterInt) return [];

  const result = await db.query(
    `
      SELECT
        c.id, c.user_id, c.story_id, c.chapter_id, c.content, c.rating,
        c.created_at, c.status, c.is_spam,
        u.username, u.full_name
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.chapter_id = $1
        AND ($2::int IS NULL OR c.story_id = $2)
        AND c.status != 'rejected'
      ORDER BY c.created_at DESC
      LIMIT $3
    `,
    [chapterInt, storyId ? parseInt(storyId, 10) : null, limit]
  );
  return result.rows.map(addDisplayContent);
}

/**
 * Tạo bình luận mới.
 */
async function create({ userId, storyId, chapterId, content, rating }) {
  const result = await db.query(
    `
      INSERT INTO comments (user_id, story_id, chapter_id, content, rating, status)
      VALUES ($1, $2, $3, $4, $5, 'approved')
      RETURNING *
    `,
    [userId, storyId, chapterId || null, content, rating || null]
  );
  return addDisplayContent(result.rows[0]);
}

/**
 * Cập nhật nội dung bình luận (dùng cho tính năng Masking).
 */
async function update(id, data) {
  const keys = Object.keys(data);
  const fields = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
  const values = Object.values(data);
  
  const query = `UPDATE comments SET ${fields} WHERE id = $1 RETURNING *`;
  const result = await db.query(query, [id, ...values]);
  return addDisplayContent(result.rows[0]);
}

/**
 * Cập nhật trạng thái bình luận (approved, rejected, masked, flagged).
 */
async function updateStatus(id, status) {
  const result = await db.query(
    'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
}

/**
 * Tìm bình luận theo ID.
 */
async function findById(id) {
  const result = await db.query('SELECT * FROM comments WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

/**
 * Xóa bình luận theo ID.
 */
async function remove(id) {
  const result = await db.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
}

module.exports = {
  getByStory,
  getByChapter,
  create,
  update,
  updateStatus,
  findById,
  remove,
};