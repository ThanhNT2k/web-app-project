const db = require('../config/database');

async function create({ actorId, actorRole, action, entityType, entityId, affectedUserId, details, ipAddress }) {
  const result = await db.query(
    `INSERT INTO audit_logs
       (actor_id, actor_role, action, entity_type, entity_id, affected_user_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
     RETURNING *`,
    [
      actorId || null,
      actorRole,
      action,
      entityType,
      entityId == null ? null : String(entityId),
      affectedUserId || null,
      JSON.stringify(details || {}),
      ipAddress || null,
    ]
  );
  return result.rows[0];
}

async function resolveAffectedUser(entityType, entityId) {
  const id = Number.parseInt(entityId, 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  if (entityType === 'user') return id;

  const queries = {
    comment: 'SELECT user_id AS affected_user_id FROM comments WHERE id = $1',
    story: 'SELECT author_id AS affected_user_id FROM stories WHERE id = $1',
    report: `
      SELECT COALESCE(r.reported_user_id, c.user_id, s.author_id) AS affected_user_id
      FROM reports r
      LEFT JOIN comments c ON c.id = r.comment_id
      LEFT JOIN chapters ch ON ch.id = r.chapter_id
      LEFT JOIN stories s ON s.id = COALESCE(r.story_id, c.story_id, ch.story_id)
      WHERE r.id = $1
    `,
  };
  if (!queries[entityType]) return null;
  const result = await db.query(queries[entityType], [id]);
  return result.rows[0]?.affected_user_id || null;
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
      OR COALESCE(affected_user.username, '') ILIKE $${values.length + 1}
      OR COALESCE(affected_user.full_name, '') ILIKE $${values.length + 1}
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
       affected_user.username AS affected_username,
       affected_user.full_name AS affected_full_name,
       affected_user.avatar_url AS affected_avatar_url,
       COUNT(*) OVER()::int AS total_count
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.actor_id
     LEFT JOIN comments audit_comment
       ON al.entity_type = 'comment'
      AND al.entity_id ~ '^[0-9]+$'
      AND audit_comment.id = al.entity_id::integer
     LEFT JOIN stories audit_story
       ON al.entity_type = 'story'
      AND al.entity_id ~ '^[0-9]+$'
      AND audit_story.id = al.entity_id::integer
     LEFT JOIN reports audit_report
       ON al.entity_type = 'report'
      AND al.entity_id ~ '^[0-9]+$'
      AND audit_report.id = al.entity_id::integer
     LEFT JOIN comments audit_report_comment ON audit_report_comment.id = audit_report.comment_id
     LEFT JOIN chapters audit_report_chapter ON audit_report_chapter.id = audit_report.chapter_id
     LEFT JOIN stories audit_report_story
       ON audit_report_story.id = COALESCE(
         audit_report.story_id,
         audit_report_comment.story_id,
         audit_report_chapter.story_id
       )
     LEFT JOIN users affected_user ON affected_user.id = COALESCE(
       al.affected_user_id,
       CASE
         WHEN al.entity_type = 'user' AND al.entity_id ~ '^[0-9]+$' THEN al.entity_id::integer
         ELSE NULL
       END,
       audit_comment.user_id,
       audit_story.author_id,
       audit_report.reported_user_id,
       audit_report_comment.user_id,
       audit_report_story.author_id
     )
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

module.exports = { create, findAll, resolveAffectedUser };
