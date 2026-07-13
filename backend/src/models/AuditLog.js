const db = require('../config/database');

async function create({ actorId, actorRole, action, entityType, entityId, details, ipAddress }) {
  const result = await db.query(
    `INSERT INTO audit_logs
       (actor_id, actor_role, action, entity_type, entity_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
     RETURNING *`,
    [
      actorId || null,
      actorRole,
      action,
      entityType,
      entityId == null ? null : String(entityId),
      JSON.stringify(details || {}),
      ipAddress || null,
    ]
  );
  return result.rows[0];
}

async function findAll(filters = {}) {
  const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(filters.limit, 10) || 20, 1), 100);
  const values = [];
  const conditions = [];

  const addFilter = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  };

  if (filters.actorRole) addFilter('al.actor_role = ?', filters.actorRole);
  if (filters.action) addFilter('al.action = ?', filters.action);
  if (filters.entityType) addFilter('al.entity_type = ?', filters.entityType);
  if (filters.search) {
    addFilter(`(
      COALESCE(u.username, '') ILIKE ?
      OR COALESCE(u.full_name, '') ILIKE $${values.length + 1}
      OR al.action ILIKE $${values.length + 1}
      OR al.entity_type ILIKE $${values.length + 1}
      OR COALESCE(al.entity_id, '') ILIKE $${values.length + 1}
      OR al.details::text ILIKE $${values.length + 1}
    )`, `%${filters.search}%`);
  }
  if (filters.from) addFilter('al.created_at >= ?', filters.from);
  if (filters.to) addFilter("al.created_at < (?::date + INTERVAL '1 day')", filters.to);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit);
  const limitIndex = values.length;
  values.push((page - 1) * limit);
  const offsetIndex = values.length;

  const result = await db.query(
    `SELECT
       al.*,
       u.username AS actor_username,
       u.full_name AS actor_full_name,
       COUNT(*) OVER()::int AS total_count
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.actor_id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  const totalItems = result.rows[0]?.total_count || 0;
  return {
    logs: result.rows.map(({ total_count, ...log }) => log),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}

module.exports = { create, findAll };
