const db = require('../config/database');

/**
 * Thêm cộng tác viên mới vào truyện.
 */
async function addCollaborator(storyId, userId) {
  try {
    const result = await db.query(
      `
        INSERT INTO story_collaborators (story_id, user_id)
        VALUES ($1, $2)
        RETURNING story_id, user_id, created_at
      `,
      [storyId, userId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Xóa cộng tác viên khỏi truyện.
 */
async function removeCollaborator(storyId, userId) {
  try {
    const result = await db.query(
      `
        DELETE FROM story_collaborators
        WHERE story_id = $1 AND user_id = $2
        RETURNING story_id, user_id
      `,
      [storyId, userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy danh sách cộng tác viên của truyện.
 */
async function getCollaborators(storyId) {
  try {
    const result = await db.query(
      `
        SELECT 
          u.id, 
          u.username, 
          u.email, 
          u.full_name, 
          u.avatar_url,
          sc.created_at
        FROM story_collaborators sc
        INNER JOIN users u ON u.id = sc.user_id
        WHERE sc.story_id = $1
        ORDER BY sc.created_at ASC
      `,
      [storyId]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * Kiểm tra xem một user có phải là cộng tác viên của truyện không.
 */
async function isCollaborator(storyId, userId) {
  if (!storyId || !userId) return false;
  try {
    const result = await db.query(
      `
        SELECT 1 
        FROM story_collaborators 
        WHERE story_id = $1 AND user_id = $2 
        LIMIT 1
      `,
      [storyId, userId]
    );
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addCollaborator,
  removeCollaborator,
  getCollaborators,
  isCollaborator,
};
