const AuditLog = require('../models/AuditLog');

async function getAuditLogs(req, res) {
  try {
    const actorRole = req.user.role === 'Moderator'
      ? 'Moderator'
      : (['Admin', 'Moderator'].includes(req.query.role) ? req.query.role : null);
    const result = await AuditLog.findAll({
      page: req.query.page,
      limit: req.query.limit,
      actorRole,
      action: req.query.action || null,
      entityType: req.query.entity_type || null,
      search: typeof req.query.search === 'string' ? req.query.search.trim() : '',
      from: req.query.from || null,
      to: req.query.to || null,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[auditLogController.getAuditLogs]', error);
    return res.status(500).json({ success: false, message: 'Không thể tải nhật ký hoạt động' });
  }
}

module.exports = { getAuditLogs };
