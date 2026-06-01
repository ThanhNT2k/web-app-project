const db = require('../config/database');

async function saveReadingProgress(userId, storyId, chapterId, readPosition, readTime) {
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
    [userId, storyId, chapterId, position, timeSpent]
  );

  return result.rows[0];
}

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
        s.title,
        s.slug,
        s.cover_image_url,
        s.category,
        s.total_chapters,
        s.author_id,
        c.chapter_number AS last_chapter_number,
        c.title AS last_chapter_title
      FROM reading_history rh
      INNER JOIN stories s ON s.id = rh.story_id
      LEFT JOIN chapters c ON c.id = rh.last_chapter_read
      WHERE rh.user_id = $1
      ORDER BY rh.last_read_at DESC
    `,
    [userId]
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
    [userId, storyId]
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
    [progress.last_chapter_read]
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
    [completionRate, userId, storyId]
  );

  return result.rows[0] || null;
}

module.exports = {
  saveReadingProgress,
  getReadingHistory,
  getStoryProgress,
  updateCompletionRate,
};
