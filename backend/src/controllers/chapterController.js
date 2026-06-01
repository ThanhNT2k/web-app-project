const Joi = require('joi');

const { Chapter, Story } = require('../models');

const createChapterSchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  content: Joi.string().trim().required(),
  chapter_number: Joi.number().integer().min(1).required(),
}).required();

const updateChapterSchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  content: Joi.string().trim().required(),
}).required();

function isStoryOwnerOrAdmin(user, story) {
  if (!user || !story) {
    return false;
  }

  return user.role === 'Admin' || Number(user.id) === Number(story.author_id);
}

async function getChapters(req, res) {
  try {
    const { storyId } = req.params;
    const page = req.query.page || 1;
    const result = await Chapter.getChaptersByStory(storyId, page);

    return res.status(200).json({
      success: true,
      chapters: result.chapters,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[chapterController.getChapters]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function getChapterById(req, res) {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.getChapterById(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    return res.status(200).json({
      success: true,
      chapter,
    });
  } catch (error) {
    console.error('[chapterController.getChapterById]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function createChapter(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { storyId } = req.params;
    const story = await Story.getStoryById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    if (!isStoryOwnerOrAdmin(req.user, story)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { error, value } = createChapterSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const chapterData = {
      story_id: storyId,
      chapter_number: value.chapter_number,
      title: value.title,
      content: value.content,
    };

    const createdChapter = await Chapter.createChapter(chapterData);

    return res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      chapter: createdChapter,
    });
  } catch (error) {
    console.error('[chapterController.createChapter]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function updateChapter(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { storyId, chapterId } = req.params;
    const story = await Story.getStoryById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    if (!isStoryOwnerOrAdmin(req.user, story)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { error, value } = updateChapterSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const updatedChapter = await Chapter.updateChapter(chapterId, value);

    if (!updatedChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      chapter: updatedChapter,
    });
  } catch (error) {
    console.error('[chapterController.updateChapter]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function deleteChapter(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { storyId, chapterId } = req.params;
    const story = await Story.getStoryById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    if (!isStoryOwnerOrAdmin(req.user, story)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const deletedChapter = await Chapter.deleteChapter(chapterId);

    if (!deletedChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully',
      chapter: deletedChapter,
    });
  } catch (error) {
    console.error('[chapterController.deleteChapter]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
};