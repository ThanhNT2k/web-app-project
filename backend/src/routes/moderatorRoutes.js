const express = require('express');
const moderatorController = require('../controllers/moderatorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');
const { auditAction } = require('../middleware/auditMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('Moderator', 'Admin'));

router.get('/dashboard', moderatorController.getDashboard);
router.get('/pending-stories', moderatorController.getPendingStories);
router.patch('/pending-stories/:id/approve', auditAction('APPROVE_STORY', 'story'), moderatorController.approvePendingStory);
router.patch('/pending-stories/:id/process', auditAction('PROCESS_STORY', 'story'), moderatorController.processPendingStory);
router.get('/comments', moderatorController.getComments);
router.patch('/comments/:id/status', auditAction('UPDATE_COMMENT_STATUS', 'comment'), moderatorController.updateCommentStatus);
router.get('/profiles', moderatorController.getReportedProfiles);
router.patch('/profiles/:id/avatar', auditAction('PROCESS_PROFILE_AVATAR', 'user'), moderatorController.processProfileAvatar);

module.exports = router;
