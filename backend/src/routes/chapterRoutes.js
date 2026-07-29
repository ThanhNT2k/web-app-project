const express = require('express');

const readingHistoryController = require('../controllers/readingHistoryController');
const chapterController = require('../controllers/chapterController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:id/unlock', authenticateToken, chapterController.unlockChapter);
router.get('/:id/summary', optionalAuth, readingHistoryController.getChapterSummary);

module.exports = router;
