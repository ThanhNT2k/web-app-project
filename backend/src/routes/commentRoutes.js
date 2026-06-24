const express = require('express');

const commentController = require('../controllers/commentController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/story/:storyId', optionalAuth, commentController.getByStory);
router.get('/chapter/:chapterId', optionalAuth, commentController.getByChapter);
router.post('/', authenticateToken, commentController.create);
router.post('/:id/vote', authenticateToken, commentController.vote);
router.delete('/:id', authenticateToken, commentController.remove);

module.exports = router;