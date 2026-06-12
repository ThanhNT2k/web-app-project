// backend/src/routes/reportRoutes.js
const express = require('express');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController.js');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware.js');
const { reportRateLimiter } = require('../middleware/rateLimiter.js');

const router = express.Router();

router.post('', authenticateToken, reportRateLimiter, createReport);
router.get('/', authenticateToken, authorizeAdmin, getReports);
router.patch('/:id', authenticateToken, authorizeAdmin, updateReportStatus);

module.exports = router;