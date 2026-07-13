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
  return async (req, res, next) => {
    const entityId = req.params.id || req.params.storyId || null;
    let affectedUserId = null;
    try {
      affectedUserId = await AuditLog.resolveAffectedUser(entityType, entityId);
    } catch (error) {
      console.error('[auditAction.resolveAffectedUser]', error.message);
    }

    res.on('finish', () => {
      if (res.statusCode < 200 || res.statusCode >= 300 || !req.user) return;
      AuditLog.create({
        actorId: req.user.id,
        actorRole: req.user.role,
        action,
        entityType,
        entityId,
        affectedUserId,
        details: sanitizeDetails(req.body),
        ipAddress: req.ip,
      }).catch((error) => console.error('[auditAction]', error.message));
    });
    next();
  };
}

module.exports = { auditAction, sanitizeDetails };
