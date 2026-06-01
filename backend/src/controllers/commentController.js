const Joi = require('joi');

const Comment = require('../models/Comment');

const createSchema = Joi.object({
  story_id: Joi.number().integer().required(),
  chapter_id: Joi.number().integer().allow(null),
  content: Joi.string().trim().min(1).max(2000).required(),
  rating: Joi.number().integer().min(1).max(5).allow(null),
}).required();

async function getByStory(req, res) {
  try {
    const storyId = parseInt(req.params.storyId, 10);
    if (!storyId) {
      return res.status(400).json({ success: false, message: 'Invalid story id' });
    }
    const comments = await Comment.getByStory(storyId);
    return res.status(200).json({ success: true, story_id: storyId, comments });
  } catch (err) {
    console.error('[commentController.getByStory]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getByChapter(req, res) {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);
    const storyId = req.query.story_id ? parseInt(req.query.story_id, 10) : null;
    if (!chapterId) {
      return res.status(400).json({ success: false, message: 'Invalid chapter id' });
    }
    const comments = await Comment.getByChapter(chapterId, storyId);
    return res.status(200).json({ success: true, chapter_id: chapterId, comments });
  } catch (err) {
    console.error('[commentController.getByChapter]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
    }

    const comment = await Comment.create({
      userId: req.user.id,
      storyId: value.story_id,
      chapterId: value.chapter_id,
      content: value.content,
      rating: value.rating,
    });

    const enriched = await Comment.getByStory(value.story_id, 1);
    const created = enriched.find((c) => c.id === comment.id) || comment;

    return res.status(201).json({ success: true, comment: created });
  } catch (err) {
    console.error('[commentController.create]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isOwner = Number(comment.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Comment.remove(req.params.id);
    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('[commentController.remove]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getByStory,
  getByChapter,
  create,
  remove,
};
