const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

// User routes (Uploaders)
router.post('/request', authenticateToken, authorizeRole('Uploader', 'Admin'), payoutController.requestPayout);
router.get('/my-requests', authenticateToken, authorizeRole('Uploader', 'Admin'), payoutController.getMyPayouts);

// Admin routes
router.get('/admin/all', authenticateToken, authorizeRole('Admin'), payoutController.getAllPayoutsAdmin);
router.put('/admin/process/:id', authenticateToken, authorizeRole('Admin'), payoutController.processPayoutAdmin);

module.exports = router;
