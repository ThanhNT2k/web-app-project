const db = require('../config/database');

async function getCachedSummary(chapterId) {
  const result = await db.query(
    `
      SELECT id, chapter_id, summary, generated_at
      FROM ai_summaries
      WHERE chapter_id = $1
      LIMIT 1
    `,
    [chapterId]
  );

  return result.rows[0] || null;
}

async function saveSummary(chapterId, summary) {
  const result = await db.query(
    `
      INSERT INTO ai_summaries (chapter_id, summary, generated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (chapter_id)
      DO UPDATE SET
        summary = EXCLUDED.summary,
        generated_at = CURRENT_TIMESTAMP
      RETURNING id, chapter_id, summary, generated_at
    `,
    [chapterId, summary]
  );

  return result.rows[0];
}

module.exports = {
  getCachedSummary,
  saveSummary,
};
