const Joi = require('joi');

const aiService = require('../services/aiService');
const { Chapter, Story } = require('../models');
const ReadingHistory = require('../models/ReadingHistory');
const AISummary = require('../models/AISummary');

const saveProgressSchema = Joi.object({
  story_id: Joi.number().integer().required(),
  chapter_id: Joi.number().integer().required(),
  // Frontend sends scrollY and elapsed seconds which can occasionally be NaN;
  // coerce to 0 so the record is always saved even when those values are absent.
  read_position: Joi.number().integer().min(0).default(0).allow(null),
  read_time: Joi.number().integer().min(0).default(0).allow(null),
}).required();

async function saveProgress(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { error, value } = saveProgressSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      // Convert null/NaN to the Joi default (0)
      convert: true,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Sanitize: replace NaN that slipped through with 0
    const readPosition = Number.isFinite(value.read_position) ? value.read_position : 0;
    const readTime = Number.isFinite(value.read_time) ? value.read_time : 0;

    const progress = await ReadingHistory.saveReadingProgress(
      req.user.id,
      value.story_id,
      value.chapter_id,
      readPosition,
      readTime,
    );

    // Best-effort completion-rate update — must not fail the whole request.
    try {
      const story = await Story.getStoryById(value.story_id);
      const totalChapters = story?.total_chapters || story?.chapter_count || 1;
      await ReadingHistory.updateCompletionRate(req.user.id, value.story_id, totalChapters);
    } catch (completionErr) {
      console.warn('[readingHistoryController.saveProgress] completion rate update failed:', completionErr.message);
    }

    // Re-fetch after potential completion update so the response is fresh.
    let updated = null;
    try {
      updated = await ReadingHistory.getStoryProgress(req.user.id, value.story_id);
    } catch {
      // Fall back to the raw UPSERT result
    }

    return res.status(200).json({
      success: true,
      message: 'Reading progress saved',
      progress: updated || progress,
    });
  } catch (err) {
    console.error('[readingHistoryController.saveProgress]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getHistory(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const history = await ReadingHistory.getReadingHistory(req.user.id);

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (err) {
    console.error('[readingHistoryController.getHistory]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getStoryProgressHandler(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const progress = await ReadingHistory.getStoryProgress(req.user.id, storyId);

    if (!progress) {
      return res.status(404).json({ success: false, message: 'No reading progress found' });
    }

    return res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error('[readingHistoryController.getStoryProgress]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getChapterSummary(req, res) {
  try {
    const { id } = req.params;
    const forceRegenerate = req.query.regenerate === 'true';

    const chapter = await Chapter.getChapterById(id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    if (!forceRegenerate) {
      const cached = await AISummary.getCachedSummary(id);
      if (cached?.summary) {
        return res.status(200).json({
          success: true,
          summary: cached.summary,
          generated_at: cached.generated_at,
          cached: true,
        });
      }
    }

    const summary = await aiService.generateChapterSummary(chapter.content || '');
    const saved = await AISummary.saveSummary(id, summary);

    return res.status(200).json({
      success: true,
      summary: saved.summary,
      generated_at: saved.generated_at,
      cached: false,
    });
  } catch (err) {
    console.error('[readingHistoryController.getChapterSummary]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate summary',
    });
  }
}

async function getRecommendations(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const history = await ReadingHistory.getReadingHistory(req.user.id);

    let storyIds = [];
    if (history.length > 0) {
      storyIds = await aiService.generatePersonalRecommendations(history);
    }

    if (storyIds.length === 0) {
      const popular = await Story.getAllStories(1, 5);
      storyIds = popular.stories.map((s) => s.id);
    } else {
      const allStories = await Story.getAllStories(1, 50);
      const validIds = new Set(allStories.stories.map((s) => s.id));
      const readIds = new Set(history.map((h) => h.story_id));
      storyIds = storyIds.filter((id) => validIds.has(id) && !readIds.has(id)).slice(0, 5);

      if (storyIds.length < 5) {
        const extras = allStories.stories
          .filter((s) => !readIds.has(s.id) && !storyIds.includes(s.id))
          .slice(0, 5 - storyIds.length)
          .map((s) => s.id);
        storyIds = [...storyIds, ...extras];
      }
    }

    const stories = [];
    for (const storyId of storyIds) {
      const story = await Story.getStoryById(storyId);
      if (story) {
        stories.push(story);
      }
    }

    return res.status(200).json({
      success: true,
      storyIds,
      stories,
    });
  } catch (err) {
    console.error('[readingHistoryController.getRecommendations]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  saveProgress,
  getHistory,
  getStoryProgress: getStoryProgressHandler,
  getChapterSummary,
  getRecommendations,
};
