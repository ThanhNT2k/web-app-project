const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');

const router = express.Router();
router.get('/', authenticateToken, walletController.getWallet);

module.exports = router;
