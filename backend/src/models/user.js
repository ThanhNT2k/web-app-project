const db = require('../config/database');

const baseSelect = `
  id,
  username,
  email,
  password,
  full_name,
  avatar_url,
  role,
  bio,
  created_at,
  updated_at,
  is_active
`;

async function findByEmail(email) {
  const result = await db.query(`SELECT ${baseSelect} FROM users WHERE email = $1 LIMIT 1`, [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(`SELECT ${baseSelect} FROM users WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] || null;
}

async function createUser({ username, email, password, fullName, role = 'User' }) {
  const result = await db.query(
    `
      INSERT INTO users (username, email, password, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${baseSelect}
    `,
    [username, email, password, fullName || null, role]
  );

  return result.rows[0];
}

async function findAll(limit = 100) {
  const result = await db.query(
    `
      SELECT id, username, email, full_name, avatar_url, role, bio, created_at, is_active
      FROM users
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit]
  );
  return result.rows;
}

async function updateRole(id, role) {
  const result = await db.query(
    `
      UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, full_name, role, is_active
    `,
    [role, id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  findAll,
  updateRole,
};