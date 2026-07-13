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

const router = express.Router();

router.post('', authenticateToken, reportRateLimiter, createReport);
router.get('/', authenticateToken, authorizeRole('Admin', 'Moderator'), getReports);
router.patch('/:id/process', authenticateToken, authorizeRole('Admin', 'Moderator'), processReport);
router.patch('/:id', authenticateToken, authorizeRole('Admin', 'Moderator'), updateReportStatus);

module.exports = router;
