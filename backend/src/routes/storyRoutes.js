const express = require('express');

const storyController = require('../controllers/storyController');
const chapterController = require('../controllers/chapterController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');
const { uploadStoryFile } = require('../middleware/upload');

const router = express.Router();

router.get('/', storyController.getAllStories);
router.get('/mine', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.getMyStories);
router.get('/search', storyController.searchStories);
router.get('/by-slug/:slug', optionalAuth, storyController.getStoryBySlug);
router.get('/:id', optionalAuth, storyController.getStoryById);
router.post('/', authenticateToken, authorizeRole('Uploader'), storyController.createStory);
router.post('/import-file', authenticateToken, authorizeRole('Uploader'), uploadStoryFile.single('file'), storyController.createStoryFromFile);
router.put('/:id', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.updateStory);
router.delete('/:id', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.deleteStory);
router.patch('/:id/visibility', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.toggleStoryVisibility);

// Collaborator Management
router.get('/:id/collaborators', authenticateToken, storyController.getCollaborators);
router.post('/:id/collaborators', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.addCollaborator);
router.delete('/:id/collaborators/:userId', authenticateToken, authorizeRole('Uploader', 'Admin'), storyController.removeCollaborator);

router.get('/:storyId/chapters', optionalAuth, chapterController.getChapters);
router.get('/:storyId/chapters/:chapterId', optionalAuth, chapterController.getChapterById);
router.get('/by-slug/:storySlug/chapters/:chapterNumber', optionalAuth, chapterController.getChapterBySlugAndNumber);
router.post('/:storyId/chapters', authenticateToken, authorizeRole('Uploader'), chapterController.createChapter);
router.post('/:storyId/chapters/import-file', authenticateToken, authorizeRole('Uploader'), uploadStoryFile.single('file'), chapterController.importChapterFile);
router.put('/:storyId/chapters/:chapterId', authenticateToken, authorizeRole('Uploader', 'Admin'), chapterController.updateChapter);
router.delete('/:storyId/chapters/:chapterId', authenticateToken, authorizeRole('Uploader', 'Admin'), chapterController.deleteChapter);

module.exports = router;