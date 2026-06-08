const Joi = require('joi');
const { Story } = require('../models');
const Tag = require('../models/Tag');

const createStorySchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  slug: Joi.string().trim().max(255).required(),
  description: Joi.string().trim().required(),
  cover_image_url: Joi.string().trim().max(500).allow('', null),
  category: Joi.string().trim().max(100).allow('', null),
  tags: Joi.array().items(Joi.string().trim().max(100)).max(20),
});

const updateStorySchema = Joi.object({
  title: Joi.string().trim().max(255).optional(),
  description: Joi.string().trim().optional(),
  cover_image_url: Joi.string().trim().max(500).allow('', null).optional(),
  category: Joi.string().trim().max(100).allow('', null).optional(),
  status: Joi.string().valid('Ongoing', 'Completed', 'Hiatus').optional(),
  tags: Joi.array().items(Joi.string().trim().max(100)).max(20),
}).min(1);

function isStoryOwnerOrAdmin(user, story) {
  if (!user || !story) return false;
  return user.role === 'Admin' || Number(user.id) === Number(story.author_id);
}

async function getAllStories(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sortBy = req.query.sortBy || 'newest';
    const result = await Story.getAllStories(page, limit, sortBy);
    return res.status(200).json({ success: true, stories: result.stories, pagination: result.pagination });
  } catch (error) {
    console.error('[storyController.getAllStories]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Lấy chi tiết truyện theo SLUG thay vì ID
 */
async function getStoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    // Lưu ý: Bạn cần đảm bảo Model Story có hàm getStoryBySlug
    const story = await Story.getStoryBySlug(slug);

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    return res.status(200).json({ success: true, story });
  } catch (error) {
    console.error('[storyController.getStoryBySlug]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function createStory(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { error, value } = createStorySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, message: 'Validation failed', errors: error.details.map(d => d.message) });

    const storyData = { title: value.title, slug: value.slug, author_id: req.user.id, description: value.description, cover_image_url: value.cover_image_url || null, category: value.category || null };
    const createdStory = await Story.createStory(storyData);

    let tags = [];
    if (value.tags?.length) tags = await Tag.setStoryTags(createdStory.id, value.tags);
    else if (value.category) tags = await Tag.setStoryTags(createdStory.id, [value.category]);

    return res.status(201).json({ success: true, message: 'Story created successfully', story: { ...createdStory, tags } });
  } catch (error) {
    console.error('[storyController.createStory]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function updateStory(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { slug } = req.params;
    const existingStory = await Story.getStoryBySlug(slug);

    if (!existingStory) return res.status(404).json({ success: false, message: 'Story not found' });
    if (!isStoryOwnerOrAdmin(req.user, existingStory)) return res.status(403).json({ success: false, message: 'Access denied' });

    const { error, value } = updateStorySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ success: false, message: 'Validation failed', errors: error.details.map(d => d.message) });

    const updatedStory = await Story.updateStory(existingStory.id, value);
    let tags = await Tag.getTagsForStory(existingStory.id);
    if (value.tags) tags = await Tag.setStoryTags(existingStory.id, value.tags);

    return res.status(200).json({ success: true, message: 'Story updated successfully', story: { ...updatedStory, tags } });
  } catch (error) {
    console.error('[storyController.updateStory]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteStory(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { slug } = req.params;
    const existingStory = await Story.getStoryBySlug(slug);

    if (!existingStory) return res.status(404).json({ success: false, message: 'Story not found' });
    if (!isStoryOwnerOrAdmin(req.user, existingStory)) return res.status(403).json({ success: false, message: 'Access denied' });

    await Story.deleteStory(existingStory.id);
    return res.status(200).json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('[storyController.deleteStory]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getMyStories(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const authorId = req.user.role === 'Admin' && req.query.author_id ? req.query.author_id : req.user.id;
    const result = await Story.getStoriesByAuthor(authorId, page, limit);
    return res.status(200).json({ success: true, stories: result.stories, pagination: result.pagination });
  } catch (error) {
    console.error('[storyController.getMyStories]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function searchStories(req, res) {
  try {
    const query = req.query.q || '';
    const category = req.query.category || null;
    const tag = req.query.tag || req.query.tag_slug || null;
    const page = req.query.page || 1;
    const limit = req.query.limit || 12;
    const result = await Story.searchStories(query, category, tag, page, limit);
    return res.status(200).json({ success: true, stories: result.stories, pagination: result.pagination });
  } catch (error) {
    console.error('[storyController.searchStories]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getAllStories,
  getStoryBySlug,
  getMyStories,
  createStory,
  updateStory,
  deleteStory,
  searchStories,
};