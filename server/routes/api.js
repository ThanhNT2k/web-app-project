const express = require('express');
const apiController = require('../Controllers/apiController');

const router = express.Router();

router.get('/stories', apiController.getStories);
router.get('/stories/:id', apiController.getStory);
router.get('/genres', apiController.getGenres);
router.get('/profile', apiController.getProfile);

module.exports = router;
