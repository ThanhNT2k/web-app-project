const db = require('../config/database');

async function saveReadingProgress(userId, storyId, chapterId, readPosition, readTime) {
  const validUserId = Number.isInteger(Number(userId)) && Number(Number(userId)) > 0 ? Number(userId) : null;
  const validStoryId = Number.isInteger(Number(storyId)) && Number(Number(storyId)) > 0 ? Number(storyId) : null;
  const validChapterId = Number.isInteger(Number(chapterId)) && Number(Number(chapterId)) > 0 ? Number(chapterId) : null;

  if (!validUserId || !validStoryId) {
    throw new Error('Invalid userId or storyId');
  }

  const position = Math.max(parseInt(readPosition, 10) || 0, 0);
  const timeSpent = Math.max(parseInt(readTime, 10) || 0, 0);

  const result = await db.query(
    `
      INSERT INTO reading_history (
        user_id,
        story_id,
        last_chapter_read,
        last_read_position,
        total_read_time,
        last_read_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, story_id)
      DO UPDATE SET
        last_chapter_read = EXCLUDED.last_chapter_read,
        last_read_position = EXCLUDED.last_read_position,
        total_read_time = reading_history.total_read_time + EXCLUDED.total_read_time,
        last_read_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [validUserId, validStoryId, validChapterId, position, timeSpent],
  );

  return result.rows[0];
}

/**
 * Lấy toàn bộ lịch sử đọc của một user.
 * JOIN stories: Lấy thông tin truyện (title, cover, category, description, status)
 * LEFT JOIN chapters: Lấy số thứ tự và tên chương cuối đọc (LEFT vì chapter có thể đã bị xóa)
 * Sắp xếp theo last_read_at DESC: Truyện đọc gần nhất hiển thị trước
 * Thêm tags từ bảng story_tags và follow_count để hover preview hiển thị đúng thông tin
 */
async function getReadingHistory(userId) {
  const result = await db.query(
    `
      SELECT
        rh.id,
        rh.user_id,
        rh.story_id,
        rh.last_chapter_read,
        rh.last_read_position,
        rh.total_read_time,
        rh.completion_rate,
        rh.last_read_at,
        rh.created_at,
        s.id,
        s.title,
        s.slug,
        s.description,
        s.cover_image_url,
        s.description,
        s.category,
        s.status,
        s.total_chapters,
        s.total_chapters AS chapter_count,
        s.author_id,
        s.author_name,
        s.average_rating,
        s.total_rating_count AS rating_count,
        COALESCE(s.total_views, 0)::float8 AS view_count,
        get_follower_count(s.id) AS follow_count,
        c.chapter_number AS last_chapter_number,
        c.title AS last_chapter_title,
        COALESCE((SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug) ORDER BY t.name)
          FROM story_tags st INNER JOIN tags t ON t.id = st.tag_id WHERE st.story_id = s.id), '[]'::jsonb) AS tags
      FROM reading_history rh
      INNER JOIN stories s ON s.id = rh.story_id
      LEFT JOIN chapters c ON c.id = rh.last_chapter_read
      WHERE rh.user_id = $1
      ORDER BY rh.last_read_at DESC
    `,
    [userId],
  );

  return result.rows;
}

async function getStoryProgress(userId, storyId) {
  const result = await db.query(
    `
      SELECT
        rh.*,
        s.title AS story_title,
        s.total_chapters,
        c.chapter_number,
        c.title AS chapter_title
      FROM reading_history rh
      INNER JOIN stories s ON s.id = rh.story_id
      LEFT JOIN chapters c ON c.id = rh.last_chapter_read
      WHERE rh.user_id = $1 AND rh.story_id = $2
      LIMIT 1
    `,
    [userId, storyId],
  );

  return result.rows[0] || null;
}

async function updateCompletionRate(userId, storyId, totalChapters) {
  const total = Math.max(parseInt(totalChapters, 10) || 1, 1);
  const progress = await getStoryProgress(userId, storyId);

  if (!progress || !progress.last_chapter_read) {
    return null;
  }

  const chapterResult = await db.query(
    'SELECT chapter_number FROM chapters WHERE id = $1 LIMIT 1',
    [progress.last_chapter_read],
  );
  const chapterNumber = chapterResult.rows[0]?.chapter_number || 0;
  const completionRate = Math.min(Math.round((chapterNumber / total) * 100), 100);

  const result = await db.query(
    `
      UPDATE reading_history
      SET completion_rate = $1
      WHERE user_id = $2 AND story_id = $3
      RETURNING *
    `,
    [completionRate, userId, storyId],
  );

  return result.rows[0] || null;
}

module.exports = {
  saveReadingProgress,
  getReadingHistory,
  getStoryProgress,
  updateCompletionRate,
};
