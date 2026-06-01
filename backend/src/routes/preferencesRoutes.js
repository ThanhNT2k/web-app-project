const express = require('express');

const preferencesController = require('../controllers/preferencesController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, preferencesController.getPreferences);
router.put('/', authenticateToken, preferencesController.updatePreferences);

module.exports = router;
