const express = require('express');
const router = express.Router();
const badWordController = require('../controllers/badWordController');
const authMiddleware = require('../middleware/authMiddleware'); // Giả định bạn có middleware xác thực

// Giả định bạn có middleware kiểm tra quyền Admin
// const { isAdmin } = require('../middleware/adminMiddleware'); 

// Các route này yêu cầu quyền Admin
// router.use(authMiddleware.verifyToken, isAdmin); 

// Lấy danh sách từ khóa
router.get('/', badWordController.getAll);

// Thêm từ khóa mới
router.post('/', badWordController.create);

// Xóa từ khóa
router.delete('/:id', badWordController.remove);

module.exports = router;