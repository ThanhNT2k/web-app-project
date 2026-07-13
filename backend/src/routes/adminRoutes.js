const express = require('express');
const adminController = require('../controllers/adminController');
const badWordController = require('../controllers/badWordController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');
const { auditAction } = require('../middleware/auditMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('Admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', auditAction('UPDATE_USER_ROLE', 'user'), adminController.updateUserRole);
router.patch('/users/:id/status', auditAction('UPDATE_USER_STATUS', 'user'), adminController.updateUserStatus);
router.delete('/comments/:id', auditAction('DELETE_COMMENT', 'comment'), adminController.deleteComment);
router.get('/stories', adminController.getAllStories);
router.get('/bad-words', badWordController.getAll);
router.post('/bad-words', auditAction('CREATE_BAD_WORD', 'bad_word'), badWordController.create);
router.patch('/bad-words/:id', auditAction('UPDATE_BAD_WORD', 'bad_word'), badWordController.update);
router.delete('/bad-words/:id', auditAction('DELETE_BAD_WORD', 'bad_word'), badWordController.remove);

module.exports = router;
