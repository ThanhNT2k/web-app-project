const express = require('express');

const readingHistoryController = require('../controllers/readingHistoryController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, readingHistoryController.saveProgress);
router.get('/', authenticateToken, readingHistoryController.getHistory);
router.get('/story/:storyId/read-chapters', authenticateToken, readingHistoryController.getReadChaptersByStory);
router.get('/story/:storyId', authenticateToken, readingHistoryController.getStoryProgress);

module.exports = router;
