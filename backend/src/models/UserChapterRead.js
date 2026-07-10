const db = require('../config/database');

async function markChapterRead(userId, storyId, chapterId) {
  const validUserId = Number.isInteger(Number(userId)) && Number(userId) > 0 ? Number(userId) : null;
  const validStoryId = Number.isInteger(Number(storyId)) && Number(storyId) > 0 ? Number(storyId) : null;
  const validChapterId = Number.isInteger(Number(chapterId)) && Number(chapterId) > 0 ? Number(chapterId) : null;

  if (!validUserId || !validStoryId || !validChapterId) {
    throw new Error('Invalid userId, storyId, or chapterId');
  }

  const result = await db.query(
    `
      INSERT INTO user_chapter_reads (
        user_id,
        story_id,
        chapter_id,
        read_at
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, chapter_id)
      DO UPDATE SET
        story_id = EXCLUDED.story_id,
        read_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [validUserId, validStoryId, validChapterId]
  );

  return result.rows[0] || null;
}

async function getReadChaptersByStory(userId, storyId) {
  const result = await db.query(
    `
      SELECT
        ucr.id,
        ucr.user_id,
        ucr.story_id,
        ucr.chapter_id,
        ucr.read_at,
        c.chapter_number,
        c.title AS chapter_title
      FROM user_chapter_reads ucr
      INNER JOIN chapters c ON c.id = ucr.chapter_id
      WHERE ucr.user_id = $1 AND ucr.story_id = $2
      ORDER BY c.chapter_number ASC
    `,
    [userId, storyId]
  );

  return result.rows;
}

module.exports = {
  markChapterRead,
  getReadChaptersByStory,
};
