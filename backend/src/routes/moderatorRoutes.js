const express = require('express');
const moderatorController = require('../controllers/moderatorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('Moderator', 'Admin'));

router.get('/dashboard', moderatorController.getDashboard);
router.get('/pending-stories', moderatorController.getPendingStories);
router.get('/comments', moderatorController.getComments);

module.exports = router;
