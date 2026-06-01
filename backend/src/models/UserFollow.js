const db = require('../config/database');

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

async function unfollow(userId, storyId) {
  const result = await db.query(
    'DELETE FROM user_follows WHERE user_id = $1 AND story_id = $2 RETURNING id',
    [userId, storyId]
  );
  return result.rows[0] || null;
}

async function isFollowing(userId, storyId) {
  const result = await db.query(
    'SELECT id FROM user_follows WHERE user_id = $1 AND story_id = $2 LIMIT 1',
    [userId, storyId]
  );
  return Boolean(result.rows[0]);
}

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
        uf.followed_at
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
