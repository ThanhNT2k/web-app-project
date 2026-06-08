const express = require('express');

const storyController = require('../controllers/storyController');
const chapterController = require('../controllers/chapterController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', storyController.getAllStories);
router.get('/mine', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.getMyStories);
router.get('/search', storyController.searchStories);

router.get('/:slug', storyController.getStoryBySlug); 
router.post('/', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.createStory);
router.put('/:slug', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.updateStory);
router.delete('/:slug', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.deleteStory);

router.get('/:mangaSlug/chapters', chapterController.getChaptersBySlug);
router.get('/:mangaSlug/chuong-:chapterNumber', chapterController.getChapterBySlugAndNumber);

router.post('/:mangaSlug/chapters', authenticateToken, authorizeRole('Uploader', 'Admin'), chapterController.createChapterBySlug);
router.put('/:mangaSlug/chuong-:chapterNumber', authenticateToken, authorizeRole('Uploader', 'Admin'), chapterController.updateChapterBySlug);
router.delete('/:mangaSlug/chuong-:chapterNumber', authenticateToken, authorizeRole('Uploader', 'Admin'), chapterController.deleteChapterBySlug);

module.exports = router;