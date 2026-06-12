const express = require('express');
const healthController = require('../controllers/healthController');
// 1. Import adminRoutes của bạn vào đây
const adminRoutes = require('./adminRoutes'); // Đảm bảo đường dẫn đúng tới file adminRoutes.js của bạn

const router = express.Router();

// 2. Định nghĩa route gốc
router.get('/health', healthController.getHealthStatus);

// 3. Mount adminRoutes vào đường dẫn /admin
router.use('/admin', adminRoutes);

module.exports = router;