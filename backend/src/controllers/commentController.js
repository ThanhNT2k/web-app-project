const Joi = require('joi');
const Comment = require('../models/Comment');
const { Queue } = require('bullmq');
const redisConfig = require('../config/redisConfig');
const moderationQueue = new Queue('moderationQueue', { connection: redisConfig });

const createSchema = Joi.object({
  story_id: Joi.number().integer().required(),
  chapter_id: Joi.number().integer().allow(null),
  content: Joi.string().trim().min(1).max(2000).required(),
  rating: Joi.number().integer().min(1).max(5).allow(null),
}).required();

/**
 * Hàm lọc nội dung:
 * - Giữ nguyên content gốc trong DB.
 * - Thêm field 'display_content' cho Client hiển thị.
 * - Thêm field 'is_hidden' để Client biết khi nào cần show nút "Hiện nội dung".
 */
const processComments = (comments) => {
  return comments.map(c => {
    const commentData = typeof c.toJSON === 'function' ? c.toJSON() : { ...c };
    
    // Nếu status là masked, trả về nội dung cảnh báo ở field display_content
    // Nhưng vẫn giữ nguyên commentData.content là nội dung gốc (để API getOriginal dùng)
    if (commentData.status === 'masked') {
      commentData.display_content = "Bình luận chứa nội dung nhạy cảm";
      commentData.is_hidden = true;
    } else {
      commentData.display_content = commentData.content;
      commentData.is_hidden = false;
    }
    
    return commentData;
  });
};

async function getByStory(req, res) {
  try {
    const storyId = parseInt(req.params.storyId, 10);
    if (!storyId) return res.status(400).json({ success: false, message: 'Invalid story id' });
    
    const comments = await Comment.getByStory(storyId);
    return res.status(200).json({ success: true, story_id: storyId, comments: processComments(comments) });
  } catch (err) {
    console.error('[commentController.getByStory]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getByChapter(req, res) {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);
    const storyId = req.query.story_id ? parseInt(req.query.story_id, 10) : null;
    if (!chapterId) return res.status(400).json({ success: false, message: 'Invalid chapter id' });
    
    const comments = await Comment.getByChapter(chapterId, storyId);
    return res.status(200).json({ success: true, chapter_id: chapterId, comments: processComments(comments) });
  } catch (err) {
    console.error('[commentController.getByChapter]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getOriginalContent(req, res) {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = Number(comment.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Access denied' });

    // Trả về nội dung gốc từ DB - đảm bảo DB không bị thay đổi
    return res.status(200).json({ success: true, originalContent: comment.content });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function create(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, message: 'Validation failed', errors: error.details.map((d) => d.message) });

    const comment = await Comment.create({
      userId: req.user.id,
      storyId: value.story_id,
      chapterId: value.chapter_id,
      content: value.content, // Luôn lưu nội dung gốc vào đây
      rating: value.rating,
      status: 'pending'
    });

    await moderationQueue.add('moderate-comment', { content: value.content, commentId: comment.id });

    return res.status(201).json({ success: true, comment: comment });
  } catch (err) {
    console.error('[commentController.create]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function remove(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = Number(comment.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'Admin';
    const isModerator = req.user.role === 'Moderator';

    if (!isOwner && !isAdmin && !isModerator) return res.status(403).json({ success: false, message: 'Access denied' });

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
  getOriginalContent,
  create,
  remove,
};