const db = require('../config/database');

/**
 * Lưu hoặc cập nhật tiến trình đọc của user với một truyện (UPSERT).
 * ON CONFLICT (user_id, story_id): Khi cặp (user_id, story_id) đã tồn tại, thực hiện UPDATE thay vì INSERT.
 *
 * Điểm đặc biệt trong phần DO UPDATE:
 * - total_read_time: CỘNG DỒN thời gian đọc (không reset về 0 mỗi lần save)
 *   = reading_history.total_read_time + EXCLUDED.total_read_time
 * - Các trường khác: Thay thế bằng giá trị mới nhất (last chapter, last position)
 */
async function saveReadingProgress(userId, storyId, chapterId, readPosition, readTime) {
  const validUserId = Number.isInteger(Number(userId)) && Number(Number(userId)) > 0 ? Number(userId) : null;
  const validStoryId = Number.isInteger(Number(storyId)) && Number(Number(storyId)) > 0 ? Number(storyId) : null;
  const validChapterId = Number.isInteger(Number(chapterId)) && Number(Number(chapterId)) > 0 ? Number(chapterId) : null;

  if (!validUserId || !validStoryId) {
    throw new Error('Invalid userId or storyId');
  }

  // Đảm bảo vị trí đọc và thời gian là số nguyên không âm
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
        last_chapter_read = EXCLUDED.last_chapter_read,      -- Cập nhật chương cuối đọc
        last_read_position = EXCLUDED.last_read_position,    -- Cập nhật vị trí scroll
        total_read_time = reading_history.total_read_time + EXCLUDED.total_read_time,  -- Cộng dồn thời gian
        last_read_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [validUserId, validStoryId, validChapterId, position, timeSpent]
  );

  return result.rows[0];
}

/**
 * Lấy toàn bộ lịch sử đọc của một user.
 * JOIN stories: Lấy thông tin truyện (title, cover, category)
 * LEFT JOIN chapters: Lấy số thứ tự và tên chương cuối đọc (LEFT vì chapter có thể đã bị xóa)
 * Sắp xếp theo last_read_at DESC: Truyện đọc gần nhất hiển thị trước
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
        s.title,
        s.slug,
        s.cover_image_url,
        s.category,
        s.total_chapters,
        s.author_id,
        s.author_name,
        c.chapter_number AS last_chapter_number,  -- Số thứ tự chương đọc cuối (để hiển thị "Đang ở chương X")
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

/**
 * Lấy tiến trình đọc của một user với một truyện cụ thể.
 * Dùng để khôi phục vị trí đọc: biết user đang ở chương nào và vị trí scroll bao nhiêu.
 */
async function getStoryProgress(userId, storyId) {
  const result = await db.query(
    `
      SELECT
        rh.*,
        s.title AS story_title,
        s.total_chapters,
        c.chapter_number,      -- Số thứ tự chương hiện tại
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

/**
 * Tính và cập nhật tỷ lệ hoàn thành truyện (completion_rate) của user.
 * Công thức: (số thứ tự chương đã đọc / tổng số chương) * 100, làm tròn, không vượt quá 100%.
 *
 * Lý do cần hàm riêng: completion_rate không thể tính inline trong saveReadingProgress
 * vì cần JOIN với bảng chapters để lấy chapter_number.
 */
async function updateCompletionRate(userId, storyId, totalChapters) {
  // Đảm bảo totalChapters ít nhất là 1 để tránh chia cho 0
  const total = Math.max(parseInt(totalChapters, 10) || 1, 1);

  // Lấy tiến trình hiện tại để có last_chapter_read
  const progress = await getStoryProgress(userId, storyId);

  // Không cập nhật nếu chưa có lịch sử đọc hoặc chưa đọc chapter nào
  if (!progress || !progress.last_chapter_read) {
    return null;
  }

  // Lấy số thứ tự chương đã đọc cuối cùng từ bảng chapters
  const chapterResult = await db.query(
    'SELECT chapter_number FROM chapters WHERE id = $1 LIMIT 1',
    [progress.last_chapter_read]
  );
  const chapterNumber = chapterResult.rows[0]?.chapter_number || 0;

  // Tính phần trăm hoàn thành, làm tròn số nguyên, giới hạn tối đa 100%
  const completionRate = Math.min(Math.round((chapterNumber / total) * 100), 100);

  // Cập nhật completion_rate vào database
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
