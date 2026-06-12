const express = require('express');

const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id/original', authenticateToken, commentController.getOriginalContent);

router.get('/story/:storyId', commentController.getByStory);
router.get('/chapter/:chapterId', commentController.getByChapter);
router.post('/', authenticateToken, commentController.create);
router.delete('/:id', authenticateToken, commentController.remove);

module.exports = router;