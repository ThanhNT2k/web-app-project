const Joi = require('joi');

const Comment = require('../models/Comment');

const { Queue } = require('bullmq');
const redisConfig = require('../config/redisConfig');
const moderationQueue = new Queue('moderationQueue', { connection: redisConfig });

// Schema validate dữ liệu bình luận mới
// - story_id: bắt buộc, mỗi comment phải gắn với một truyện
// - chapter_id: tùy chọn (null = comment cho toàn bộ truyện, có id = comment cho chương cụ thể)
// - content: 1-2000 ký tự, không được rỗng
// - rating: 1-5 sao, tùy chọn (dùng để đánh giá truyện)
const createSchema = Joi.object({
  story_id: Joi.number().integer().required(),
  chapter_id: Joi.number().integer().allow(null),
  content: Joi.string().trim().min(1).max(2000).required(),
  rating: Joi.number().integer().min(1).max(5).allow(null),
}).required();

/**
 * Lấy danh sách bình luận của một truyện.
 * Trả về tối đa 50 bình luận mới nhất, kèm thông tin người dùng.
 */
async function getByStory(req, res) {
  try {
    // Parse storyId sang số nguyên, validate hợp lệ trước khi query
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

/**
 * Lấy danh sách bình luận của một chương cụ thể.
 * storyId là tham số optional để lọc thêm (đảm bảo chapter thuộc đúng story).
 */
async function getByChapter(req, res) {
  try {
    const chapterId = parseInt(req.params.chapterId, 10);
    // story_id từ query string, dùng để lọc thêm nếu client truyền lên
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

/**
 * Tạo bình luận mới.
 * Sau khi tạo, re-fetch bình luận từ DB để trả về đầy đủ thông tin user (username, avatar...).
 * Không trả về raw insert result vì thiếu thông tin người dùng.
 */
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

    // Tạo bình luận trong database
    const comment = await Comment.create({
      userId: req.user.id,
      storyId: value.story_id,
      chapterId: value.chapter_id,
      content: value.content,
      rating: value.rating,
      status: 'pending'
    });

    await moderationQueue.add('moderate-comment', { 
      content: value.content, 
      commentId: comment.id 
    });

    // Re-fetch danh sách bình luận của truyện (chỉ lấy 1 bình luận mới nhất)
    // để lấy thêm thông tin user (username, avatar) mà raw INSERT không trả về
    const enriched = await Comment.getByStory(value.story_id, 1);

    // Tìm bình luận vừa tạo trong danh sách fetch về, fallback về raw comment nếu không tìm thấy
    const created = enriched.find((c) => c.id === comment.id) || comment;

    return res.status(201).json({ success: true, comment: created });
  } catch (err) {
    console.error('[commentController.create]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Xóa bình luận.
 * Phân quyền: CHỦ SỞ HỮU bình luận hoặc ADMIN mới được xóa.
 * Dùng Number() để so sánh an toàn khi user_id từ DB là số, req.user.id từ JWT có thể là string.
 */
async function remove(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Lấy bình luận từ DB để kiểm tra tồn tại và lấy user_id của chủ bình luận
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Kiểm tra quyền xóa:
    // - isOwner: user hiện tại là chủ của bình luận này
    // - isAdmin: user có quyền Admin (có thể xóa bình luận của bất kỳ ai)
    const isOwner = Number(comment.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === 'Admin';

    // Nếu không phải chủ bình luận VÀ không phải Admin thì từ chối
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
