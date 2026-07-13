const AuditLog = require('../models/AuditLog');

const SENSITIVE_KEYS = new Set(['password', 'token', 'otp', 'authorization']);

function sanitizeDetails(value) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEYS.has(key.toLowerCase()))
      .map(([key, item]) => [key, typeof item === 'string' && item.length > 1000 ? `${item.slice(0, 1000)}…` : item])
  );
}

function auditAction(action, entityType) {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode < 200 || res.statusCode >= 300 || !req.user) return;
      AuditLog.create({
        actorId: req.user.id,
        actorRole: req.user.role,
        action,
        entityType,
        entityId: req.params.id || req.params.storyId || null,
        details: sanitizeDetails(req.body),
        ipAddress: req.ip,
      }).catch((error) => console.error('[auditAction]', error.message));
    });
    next();
  };
}

module.exports = { auditAction, sanitizeDetails };
