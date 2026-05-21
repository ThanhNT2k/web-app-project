const express = require('express');
const pageController = require('../Controllers/pageController');

const router = express.Router();

router.get('/', pageController.home);
router.get('/login', pageController.login);
router.get('/stories', pageController.stories);
router.get('/genres', pageController.genres);
router.get('/story', pageController.story);
router.get('/chapter', pageController.chapter);
router.get('/profile', pageController.profile);

module.exports = router;
