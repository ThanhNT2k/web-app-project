const db = require('../config/database');

/**
 * Tạo cài đặt thông báo mặc định cho một người dùng mới.
 * Tất cả các loại thông báo đều được bật mặc định (email và push).
 * @param {number} userId - ID của người dùng
 * @returns Bản ghi cài đặt thông báo vừa tạo
 */
async function createDefault(userId) {
  const result = await db.query(
    `
      INSERT INTO notification_preferences (
        user_id,
        email_new_chapter,
        push_new_chapter,
        email_system,
        push_system
      )
      VALUES ($1, true, true, true, true)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `,
    [userId]
  );
  return result.rows[0];
}

/**
 * Lấy cài đặt thông báo của một người dùng.
 * @param {number} userId - ID của người dùng
 * @returns Bản ghi cài đặt thông báo
 */
async function getPreferences(userId) {
  const result = await db.query(
    'SELECT * FROM notification_preferences WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}

/**
 * Cập nhật cài đặt thông báo của một người dùng.
 * @param {number} userId - ID của người dùng
 * @param {object} updates - Các trường cần cập nhật
 *   - email_new_chapter: boolean
 *   - push_new_chapter: boolean
 *   - email_system: boolean
 *   - push_system: boolean
 * @returns Bản ghi cài đặt thông báo đã cập nhật
 */
async function updatePreferences(userId, updates) {
  const fields = [];
  const values = [userId];
  let paramIndex = 2;

  if (updates.email_new_chapter !== undefined) {
    fields.push(`email_new_chapter = $${paramIndex}`);
    values.push(updates.email_new_chapter);
    paramIndex++;
  }
  if (updates.push_new_chapter !== undefined) {
    fields.push(`push_new_chapter = $${paramIndex}`);
    values.push(updates.push_new_chapter);
    paramIndex++;
  }
  if (updates.email_system !== undefined) {
    fields.push(`email_system = $${paramIndex}`);
    values.push(updates.email_system);
    paramIndex++;
  }
  if (updates.push_system !== undefined) {
    fields.push(`push_system = $${paramIndex}`);
    values.push(updates.push_system);
    paramIndex++;
  }

  if (!fields.length) {
    return getPreferences(userId);
  }

  const query = `
    UPDATE notification_preferences
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
}

/**
 * Kiểm tra xem người dùng có bật thông báo email cho chương mới hay không.
 * @param {number} userId - ID của người dùng
 * @returns boolean
 */
async function isEmailNewChapterEnabled(userId) {
  const prefs = await getPreferences(userId);
  return prefs ? prefs.email_new_chapter : true; // Mặc định là true nếu chưa có cài đặt
}

/**
 * Kiểm tra xem người dùng có bật thông báo push cho chương mới hay không.
 * @param {number} userId - ID của người dùng
 * @returns boolean
 */
async function isPushNewChapterEnabled(userId) {
  const prefs = await getPreferences(userId);
  return prefs ? prefs.push_new_chapter : true; // Mặc định là true nếu chưa có cài đặt
}

module.exports = {
  createDefault,
  getPreferences,
  updatePreferences,
  isEmailNewChapterEnabled,
  isPushNewChapterEnabled,
};
