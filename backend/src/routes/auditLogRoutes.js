const express = require('express');
const { getAuditLogs } = require('../controllers/auditLogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('Admin', 'Moderator'), getAuditLogs);

module.exports = router;
