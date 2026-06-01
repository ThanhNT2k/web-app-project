const db = require('../config/database');

const defaults = {
  dark_mode: false,
  font_size: 16,
  line_spacing: 1.5,
  font_family: 'Inter, sans-serif',
  theme_color: 'default',
  auto_bookmark: true,
};

async function getByUserId(userId) {
  const result = await db.query(
    'SELECT * FROM user_preferences WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
}

async function upsert(userId, prefs) {
  const existing = await getByUserId(userId);
  const values = {
    dark_mode: prefs.dark_mode ?? existing?.dark_mode ?? defaults.dark_mode,
    font_size: prefs.font_size ?? existing?.font_size ?? defaults.font_size,
    line_spacing: prefs.line_spacing ?? existing?.line_spacing ?? defaults.line_spacing,
    font_family: prefs.font_family ?? existing?.font_family ?? defaults.font_family,
    theme_color: prefs.theme_color ?? existing?.theme_color ?? defaults.theme_color,
    auto_bookmark: prefs.auto_bookmark ?? existing?.auto_bookmark ?? defaults.auto_bookmark,
  };

  const result = await db.query(
    `
      INSERT INTO user_preferences (
        user_id, dark_mode, font_size, line_spacing, font_family, theme_color, auto_bookmark
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        dark_mode = EXCLUDED.dark_mode,
        font_size = EXCLUDED.font_size,
        line_spacing = EXCLUDED.line_spacing,
        font_family = EXCLUDED.font_family,
        theme_color = EXCLUDED.theme_color,
        auto_bookmark = EXCLUDED.auto_bookmark,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [
      userId,
      values.dark_mode,
      values.font_size,
      values.line_spacing,
      values.font_family,
      values.theme_color,
      values.auto_bookmark,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getByUserId,
  upsert,
  defaults,
};
