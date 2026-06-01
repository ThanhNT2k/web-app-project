const express = require('express');

const followController = require('../controllers/followController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, followController.getMyFollows);
// optionalAuth: guests get following:false, logged-in users get real status
router.get('/check/:storyId', optionalAuth, followController.checkFollow);
router.post('/:storyId', authenticateToken, followController.followStory);
router.delete('/:storyId', authenticateToken, followController.unfollowStory);

module.exports = router;
