const express = require('express');
const moderatorController = require('../controllers/moderatorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('Moderator', 'Admin'));

router.get('/dashboard', moderatorController.getDashboard);
router.get('/pending-stories', moderatorController.getPendingStories);
router.patch('/pending-stories/:id/approve', moderatorController.approvePendingStory);
router.get('/comments', moderatorController.getComments);
router.patch('/comments/:id/status', moderatorController.updateCommentStatus);

module.exports = router;
