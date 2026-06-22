const db = require('../config/database');

async function syncStoryRatingStats(storyId) {
  const result = await db.query(
    `
      UPDATE stories s
      SET
        total_rating_count = stats.rating_count,
        average_rating = stats.average_rating
      FROM (
        SELECT
          $1::int AS story_id,
          COUNT(*)::int AS rating_count,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float8 AS average_rating
        FROM ratings
        WHERE story_id = $1
      ) stats
      WHERE s.id = stats.story_id
      RETURNING s.id, s.average_rating, s.total_rating_count
    `,
    [storyId]
  );

  return result.rows[0] || null;
}

async function getRatingDistribution(storyId) {
  const result = await db.query(
    `
      SELECT rating, COUNT(*)::int AS count
      FROM ratings
      WHERE story_id = $1
      GROUP BY rating
    `,
    [storyId]
  );

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    rating: star,
    count: 0,
  }));

  for (const row of result.rows) {
    const index = Number(row.rating) - 1;
    if (index >= 0 && index < distribution.length) {
      distribution[index].count = Number(row.count) || 0;
    }
  }

  return distribution;
}

async function getStoryRatingSummary(storyId, userId = null) {
  const storyResult = await db.query(
    `
      SELECT average_rating, total_rating_count
      FROM stories
      WHERE id = $1
      LIMIT 1
    `,
    [storyId]
  );

  const userRatingResult = userId
    ? await db.query(
      `
        SELECT rating
        FROM ratings
        WHERE story_id = $1 AND user_id = $2
        LIMIT 1
      `,
      [storyId, userId]
    )
    : { rows: [] };

  const summary = storyResult.rows[0] || { average_rating: 0, total_rating_count: 0 };
  const distribution = await getRatingDistribution(storyId);

  return {
    average_rating: Number(summary.average_rating) || 0,
    rating_count: Number(summary.total_rating_count) || 0,
    user_rating: userRatingResult.rows[0]?.rating || null,
    distribution,
  };
}

async function upsertStoryRating(storyId, userId, rating) {
  const result = await db.query(
    `
      INSERT INTO ratings (story_id, user_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (story_id, user_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        updated_at = CURRENT_TIMESTAMP
      RETURNING
        id,
        story_id,
        user_id,
        rating,
        created_at,
        updated_at
    `,
    [storyId, userId, rating]
  );

  await syncStoryRatingStats(storyId);
  return result.rows[0] || null;
}

async function deleteStoryRating(storyId, userId) {
  const result = await db.query(
    `
      DELETE FROM ratings
      WHERE story_id = $1 AND user_id = $2
      RETURNING id, story_id, user_id
    `,
    [storyId, userId]
  );

  await syncStoryRatingStats(storyId);
  return result.rows[0] || null;
}

module.exports = {
  syncStoryRatingStats,
  getRatingDistribution,
  getStoryRatingSummary,
  upsertStoryRating,
  deleteStoryRating,
};