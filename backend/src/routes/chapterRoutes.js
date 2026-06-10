const express = require('express');

const readingHistoryController = require('../controllers/readingHistoryController');

const router = express.Router();

router.get('/:mangaSlug/chuong-:chapterNumber', chapterController.getChapterByNumber);

module.exports = router;
