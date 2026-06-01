const express = require('express');

const tagController = require('../controllers/tagController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', tagController.listTags);
router.post('/', authenticateToken, authorizeRole('Uploader', 'Admin'), tagController.createTag);

module.exports = router;
