const pool = require('../config/database');

module.exports = {
  findAll: async () => {
    const res = await pool.query('SELECT * FROM bad_words ORDER BY "createdAt" DESC');
    return res.rows;
  },
  create: async ({ keyword, tier }) => {
    const res = await pool.query(
      'INSERT INTO bad_words (keyword, tier, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [keyword, tier]
    );
    return res.rows[0];
  },
  destroy: async ({ where }) => {
    const res = await pool.query('DELETE FROM bad_words WHERE id = $1', [where.id]);
    return res.rowCount;
  }
};