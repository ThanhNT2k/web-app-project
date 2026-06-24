const db = require('../config/database');
const { moderateContent } = require('../services/moderationService');

function normalizeUserId(userId) {
  const parsed = Number(userId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

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
async function getByStory(storyId, limit = 50, userId = null) {
  const id = parseInt(storyId, 10);
  if (!id) return [];

  const safeLimit = Math.max(parseInt(limit, 10) || 50, 1);
  const result = await db.query(
    `
      SELECT
        c.id,
        c.user_id,
        c.story_id,
        c.chapter_id,
        c.parent_comment_id,
        c.content,
        c.rating,
        c.created_at,
        c.updated_at,
        c.status,
        c.is_spam,
        u.username,
        u.full_name,
        u.avatar_url,
        COALESCE(vs.vote_score, 0) AS vote_score,
        COALESCE(vs.upvote_count, 0) AS upvote_count,
        COALESCE(vs.downvote_count, 0) AS downvote_count,
        COALESCE(uv.value, 0) AS my_vote
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      LEFT JOIN (
        SELECT
          comment_id,
          SUM(value)::int AS vote_score,
          COUNT(*) FILTER (WHERE value = 1)::int AS upvote_count,
          COUNT(*) FILTER (WHERE value = -1)::int AS downvote_count
        FROM comment_votes
        GROUP BY comment_id
      ) vs ON vs.comment_id = c.id
      LEFT JOIN comment_votes uv ON uv.comment_id = c.id AND uv.user_id = $3
      WHERE c.story_id = $1 AND c.status != 'rejected'
      ORDER BY c.created_at DESC
      LIMIT $2
    `,
    [id, safeLimit, normalizeUserId(userId)]
  );
  return result.rows.map(addDisplayContent);
}

/**
 * Lấy danh sách bình luận của một chương cụ thể.
 */
async function getByChapter(chapterId, storyId = null, limit = 50, userId = null) {
  const chapterInt = parseInt(chapterId, 10);
  if (!chapterInt) return [];

  const safeLimit = Math.max(parseInt(limit, 10) || 50, 1);
  const normalizedStoryId = storyId ? parseInt(storyId, 10) : null;

  const result = await db.query(
    `
      SELECT
        c.id,
        c.user_id,
        c.story_id,
        c.chapter_id,
        c.parent_comment_id,
        c.content,
        c.rating,
        c.created_at,
        c.updated_at,
        c.status,
        c.is_spam,
        u.username,
        u.full_name,
        u.avatar_url,
        COALESCE(vs.vote_score, 0) AS vote_score,
        COALESCE(vs.upvote_count, 0) AS upvote_count,
        COALESCE(vs.downvote_count, 0) AS downvote_count,
        COALESCE(uv.value, 0) AS my_vote
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      LEFT JOIN (
        SELECT
          comment_id,
          SUM(value)::int AS vote_score,
          COUNT(*) FILTER (WHERE value = 1)::int AS upvote_count,
          COUNT(*) FILTER (WHERE value = -1)::int AS downvote_count
        FROM comment_votes
        GROUP BY comment_id
      ) vs ON vs.comment_id = c.id
      LEFT JOIN comment_votes uv ON uv.comment_id = c.id AND uv.user_id = $4
      WHERE c.chapter_id = $1
        AND ($2::int IS NULL OR c.story_id = $2)
        AND c.status != 'rejected'
      ORDER BY c.created_at DESC
      LIMIT $3
    `,
    [chapterInt, normalizedStoryId, safeLimit, normalizeUserId(userId)]
  );
  return result.rows.map(addDisplayContent);
}

/**
 * Tạo bình luận mới.
 */
async function create({ userId, storyId, chapterId, parentCommentId, content, rating }) {
  const result = await db.query(
    `
      INSERT INTO comments (user_id, story_id, chapter_id, parent_comment_id, content, rating, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'approved')
      RETURNING *
    `,
    [userId, storyId, chapterId || null, parentCommentId || null, content, rating || null]
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

async function vote(commentId, userId, value) {
  const normalizedVote = Number(value) === -1 ? -1 : 1;
  const result = await db.query(
    `
      INSERT INTO comment_votes (comment_id, user_id, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (comment_id, user_id)
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      RETURNING comment_id, user_id, value
    `,
    [commentId, userId, normalizedVote]
  );

  const summary = await db.query(
    `
      SELECT
        COALESCE(SUM(value), 0)::int AS vote_score,
        COUNT(*) FILTER (WHERE value = 1)::int AS upvote_count,
        COUNT(*) FILTER (WHERE value = -1)::int AS downvote_count
      FROM comment_votes
      WHERE comment_id = $1
    `,
    [commentId]
  );

  return {
    ...(result.rows[0] || { comment_id: commentId, user_id: userId, value: normalizedVote }),
    ...(summary.rows[0] || { vote_score: 0, upvote_count: 0, downvote_count: 0 }),
  };
}

module.exports = {
  getByStory,
  getByChapter,
  create,
  update,
  updateStatus,
  findById,
  remove,
  vote,
};