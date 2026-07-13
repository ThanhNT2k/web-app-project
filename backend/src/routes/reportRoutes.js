// backend/src/routes/reportRoutes.js
const express = require('express');
const {
  createReport,
  getReports,
  processReport,
  updateReportStatus,
} = require('../controllers/reportController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');
const { authorizeRole } = require('../middleware/roleMiddleware');
const { reportRateLimiter } = require('../middleware/rateLimiter.js');
const { auditAction } = require('../middleware/auditMiddleware');

const router = express.Router();

router.post('', authenticateToken, reportRateLimiter, createReport);
router.get('/', authenticateToken, authorizeRole('Admin', 'Moderator'), getReports);
router.patch('/:id/process', authenticateToken, authorizeRole('Admin', 'Moderator'), auditAction('PROCESS_REPORT', 'report'), processReport);
router.patch('/:id', authenticateToken, authorizeRole('Admin', 'Moderator'), auditAction('UPDATE_REPORT_STATUS', 'report'), updateReportStatus);

module.exports = router;
