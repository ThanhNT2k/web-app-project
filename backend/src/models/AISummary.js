const db = require('../config/database');

/**
 * Lấy bản tóm tắt AI đã được cache trong database cho một chương.
 * Mục đích: Tránh gọi AI API lại cho cùng một chương (tốn chi phí và thời gian).
 * Trả về null nếu chưa có tóm tắt trong DB.
 */
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

/**
 * Lưu hoặc cập nhật tóm tắt AI cho một chương (UPSERT).
 * ON CONFLICT (chapter_id) DO UPDATE: Mỗi chương chỉ có 1 tóm tắt duy nhất.
 * Khi gọi với regenerate=true từ controller, tóm tắt cũ sẽ bị ghi đè ở đây.
 * generated_at được cập nhật về thời điểm hiện tại khi có tóm tắt mới.
 */
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
