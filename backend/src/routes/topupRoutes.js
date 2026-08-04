const express = require('express');
const router = express.Router();
const topupController = require('../controllers/topupController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, topupController.createTopupTransaction);
router.post('/webhook', topupController.handleWebhook);

module.exports = router;
