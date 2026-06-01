const Joi = require('joi');

const { User, Story, db } = require('../models');
const Comment = require('../models/Comment');

async function getStats(req, res) {
  try {
    const [users, stories, chapters, comments] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS c FROM users'),
      db.query('SELECT COUNT(*)::int AS c FROM stories WHERE is_published = true'),
      db.query('SELECT COUNT(*)::int AS c FROM chapters'),
      db.query('SELECT COUNT(*)::int AS c FROM comments'),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        users: users.rows[0].c,
        stories: stories.rows[0].c,
        chapters: chapters.rows[0].c,
        comments: comments.rows[0].c,
      },
    });
  } catch (err) {
    console.error('[adminController.getStats]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.findAll(200);
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('[adminController.getUsers]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const roleSchema = Joi.object({
  role: Joi.string().valid('Admin', 'Uploader', 'User', 'Guest').required(),
});

async function updateUserRole(req, res) {
  try {
    const { error, value } = roleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updated = await User.updateRole(req.params.id, value.role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    console.error('[adminController.updateUserRole]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteComment(req, res) {
  try {
    const removed = await Comment.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    return res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('[adminController.deleteComment]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getAllStories(req, res) {
  try {
    const result = await Story.getAllStories(req.query.page || 1, req.query.limit || 50);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[adminController.getAllStories]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteComment,
  getAllStories,
};
