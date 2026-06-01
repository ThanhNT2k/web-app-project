const express = require('express');

const readingHistoryController = require('../controllers/readingHistoryController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recommendations', authenticateToken, readingHistoryController.getRecommendations);

module.exports = router;
