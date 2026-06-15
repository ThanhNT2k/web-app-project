// backend/src/routes/reportRoutes.js
const express = require('express');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController.js');
const { authenticateToken } = require('../middleware/authMiddleware.js');
const { authorizeRole } = require('../middleware/roleMiddleware');
const { reportRateLimiter } = require('../middleware/rateLimiter.js');

const router = express.Router();

router.post('', authenticateToken, reportRateLimiter, createReport);
router.get('/', authenticateToken, authorizeRole('Admin', 'Moderator'), getReports);
router.patch('/:id', authenticateToken, authorizeRole('Admin', 'Moderator'), updateReportStatus);

module.exports = router;