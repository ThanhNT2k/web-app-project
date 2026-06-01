const db = require('../config/database');

async function getByStory(storyId, limit = 50) {
  const id = parseInt(storyId, 10);
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
        AND ($2::int IS NULL OR c.story_id = $2)
      ORDER BY c.created_at DESC
      LIMIT $3
    `,
    [chapterInt, storyId ? parseInt(storyId, 10) : null, limit]
  );
  return result.rows;
}

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

async function findById(id) {
  const result = await db.query('SELECT * FROM comments WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

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
