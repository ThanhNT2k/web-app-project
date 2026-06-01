const express = require('express');

const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');
const { uploadCover } = require('../middleware/upload');

const router = express.Router();

router.post(
  '/cover',
  authenticateToken,
  authorizeRole('Uploader', 'Admin'),
  uploadCover.single('cover'),
  uploadController.uploadCover
);

module.exports = router;
