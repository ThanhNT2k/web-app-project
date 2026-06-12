const express = require('express');
const adminController = require('../controllers/adminController');
const badWordController = require('../controllers/badWordController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('Admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/comments/:id', adminController.deleteComment);
router.get('/stories', adminController.getAllStories);
router.get('/bad-words', badWordController.getAll);
router.post('/bad-words', badWordController.create);
router.delete('/bad-words/:id', badWordController.remove);

module.exports = router;
