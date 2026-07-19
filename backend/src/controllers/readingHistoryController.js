const Joi = require('joi');

const aiService = require('../services/aiService');
const { Chapter, Story } = require('../models');
const ReadingHistory = require('../models/ReadingHistory');
const UserChapterRead = require('../models/UserChapterRead');
const AISummary = require('../models/AISummary');

// Schema validate dữ liệu khi lưu tiến trình đọc
// Frontend gửi scrollY (vị trí cuộn trang) và elapsed seconds (thời gian đọc)
// Đôi khi những giá trị này có thể là NaN nên cần xử lý đặc biệt với .default(0)
const saveProgressSchema = Joi.object({
  story_id: Joi.number().integer().required(),
  chapter_id: Joi.number().integer().required(),
  // Frontend sends scrollY and elapsed seconds which can occasionally be NaN;
  // coerce to 0 so the record is always saved even when those values are absent.
  read_position: Joi.number().integer().min(0).default(0).allow(null),
  read_time: Joi.number().integer().min(0).default(0).allow(null),
}).required();

/**
 * Lưu tiến trình đọc truyện của user.
 * Sử dụng UPSERT (INSERT ... ON CONFLICT DO UPDATE) nên an toàn khi gọi nhiều lần.
 * total_read_time được cộng dồn mỗi lần lưu, không bị reset.
 *
 * Luồng:
 * 1. Validate dữ liệu (xử lý NaN -> 0)
 * 2. Lưu tiến trình vào DB
 * 3. Cố gắng cập nhật completion_rate (best-effort, không làm fail request nếu lỗi)
 * 4. Fetch lại dữ liệu mới nhất và trả về
 */
async function saveProgress(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { error, value } = saveProgressSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      // Convert null/NaN to the Joi default (0) - xử lý các giá trị không hợp lệ từ frontend
      convert: true,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Bước bảo vệ thêm: đảm bảo các giá trị số thực sự là finite (không phải NaN hay Infinity)
    // Dùng Number.isFinite() thay vì isNaN() vì isNaN(null) = false nhưng Number.isFinite(null) = false
    const readPosition = Number.isFinite(value.read_position) ? value.read_position : 0;
    const readTime = Number.isFinite(value.read_time) ? value.read_time : 0;

    const storyId = Number.isInteger(value.story_id) ? Number(value.story_id) : null;
    const chapterId = Number.isInteger(value.chapter_id) ? Number(value.chapter_id) : null;

    if (!storyId || !chapterId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story_id or chapter_id',
      });
    }

    // Lưu tiến trình đọc vào bảng reading_history (UPSERT)
    const progress = await ReadingHistory.saveReadingProgress(
      req.user.id,
      storyId,
      chapterId,
      readPosition,
      readTime,
    );

    try {
      await UserChapterRead.markChapterRead(req.user.id, storyId, chapterId);
    } catch (chapterReadErr) {
      console.warn('[readingHistoryController.saveProgress] mark chapter read failed:', chapterReadErr.message);
    }

    // Cập nhật completion_rate (phần trăm hoàn thành truyện) - best-effort
    // Được bao bởi try/catch riêng để không làm fail toàn bộ request nếu gặp lỗi
    try {
      const story = await Story.getStoryById(value.story_id);
      // Lấy tổng số chương từ story, fallback về 1 để tránh chia cho 0
      const totalChapters = story?.total_chapters || story?.chapter_count || 1;
      await ReadingHistory.updateCompletionRate(req.user.id, value.story_id, totalChapters);
    } catch (completionErr) {
      console.warn('[readingHistoryController.saveProgress] completion rate update failed:', completionErr.message);
    }

    // Re-fetch dữ liệu tiến trình sau khi đã cập nhật completion_rate để trả về thông tin mới nhất
    let updated = null;
    try {
      updated = await ReadingHistory.getStoryProgress(req.user.id, value.story_id);
    } catch {
      // Fall back to the raw UPSERT result nếu re-fetch thất bại
    }

    return res.status(200).json({
      success: true,
      message: 'Reading progress saved',
      progress: updated || progress, // Ưu tiên dùng dữ liệu mới, fallback về kết quả UPSERT
    });
  } catch (err) {
    console.error('[readingHistoryController.saveProgress]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Lấy lịch sử đọc của user (tất cả truyện đã đọc, sắp xếp theo thời gian đọc gần nhất).
 * Bao gồm thông tin truyện, chapter cuối đọc, tỷ lệ hoàn thành.
 */
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

/**
 * Lấy tiến trình đọc của user với một truyện cụ thể.
 * Dùng để khôi phục vị trí đọc khi user mở lại truyện đã đọc dở.
 */
async function getStoryProgressHandler(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { storyId } = req.params;
    const progress = await ReadingHistory.getStoryProgress(req.user.id, storyId);

    // Trả về 404 nếu user chưa đọc truyện này bao giờ
    if (!progress) {
      return res.status(404).json({ success: false, message: 'No reading progress found' });
    }

    return res.status(200).json({ success: true, progress });
  } catch (err) {
    console.error('[readingHistoryController.getStoryProgress]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getReadChaptersByStory(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const storyId = Number.parseInt(req.params.storyId, 10);
    if (!Number.isInteger(storyId) || storyId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid story id' });
    }

    const chapters = await UserChapterRead.getReadChaptersByStory(req.user.id, storyId);

    return res.status(200).json({
      success: true,
      chapters,
      chapter_numbers: chapters
        .map((chapter) => Number(chapter.chapter_number))
        .filter((chapterNumber) => Number.isInteger(chapterNumber) && chapterNumber > 0),
    });
  } catch (err) {
    console.error('[readingHistoryController.getReadChaptersByStory]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Lấy tóm tắt AI cho một chương truyện.
 * Hỗ trợ cache ở 2 tầng:
 * 1. In-memory cache trong aiService (RAM, TTL 1 giờ)
 * 2. Database cache trong bảng ai_summaries (lưu lâu dài)
 *
 * Tham số regenerate=true bỏ qua DB cache và tạo bản tóm tắt mới.
 */
async function getChapterSummary(req, res) {
  try {
    const { id } = req.params;
    // regenerate=true: buộc tạo lại tóm tắt, bỏ qua cache (dùng khi tóm tắt cũ không đúng)
    const forceRegenerate = req.query.regenerate === 'true';

    const chapter = await Chapter.getChapterById(id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    // Nếu không yêu cầu tạo lại, kiểm tra cache trong database trước
    if (!forceRegenerate) {
      const cached = await AISummary.getCachedSummary(id);
      if (cached?.summary) {
        // Trả về tóm tắt đã cache, kèm flag cached=true để frontend hiển thị thông tin
        return res.status(200).json({
          success: true,
          summary: cached.summary,
          generated_at: cached.generated_at,
          cached: true,
        });
      }
    }

    // Gọi AI service để tạo tóm tắt mới (Groq hoặc Gemini)
    const summary = await aiService.generateChapterSummary(chapter.content || '');

    // Lưu tóm tắt vào database để cache cho các lần sau
    const saved = await AISummary.saveSummary(id, summary);

    return res.status(200).json({
      success: true,
      summary: saved.summary,
      generated_at: saved.generated_at,
      cached: false, // Đây là tóm tắt mới được tạo, chưa từ cache
    });
  } catch (err) {
    console.error('[readingHistoryController.getChapterSummary]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate summary',
    });
  }
}

/**
 * Lấy gợi ý truyện cá nhân hóa dựa trên lịch sử đọc của user.
 * Luồng:
 * 1. Lấy lịch sử đọc của user
 * 2. Nếu có lịch sử → dùng AI gợi ý (theo thể loại và tác giả ưa thích)
 * 3. Nếu không có lịch sử hoặc AI trả về ít gợi ý → bổ sung bằng truyện phổ biến
 * 4. Ưu tiên truyện chưa đọc; nếu kho truyện không đủ thì dùng truyện công khai còn lại
 */
async function getRecommendations(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const recommendationLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 10);

    // Lấy lịch sử đọc để phân tích sở thích của user
    const history = await ReadingHistory.getReadingHistory(req.user.id);

    let storyIds = [];

    if (history.length > 0) {
      // User đã có lịch sử đọc => dùng AI gợi ý dựa trên sở thích
      storyIds = await aiService.generatePersonalRecommendations(history);
    }

    const normalizeId = (value) => {
      const id = Number(value);
      return Number.isInteger(id) && id > 0 ? id : null;
    };
    const readIds = new Set(history.map((item) => normalizeId(item.story_id)).filter(Boolean));

    // Luôn validate gợi ý AI và bù từ danh sách phổ biến. Việc chuẩn hoá
    // ID tránh trường hợp PostgreSQL/AI trả về cùng ID dưới hai kiểu string/number.
    const selectedIds = new Set();
    const stories = [];
    const addStory = (story, allowRead = false) => {
      const id = normalizeId(story?.id);
      if (
        !id || selectedIds.has(id) || (!allowRead && readIds.has(id))
        || story.is_published !== true || story.hidden_by_admin === true
      ) return;
      selectedIds.add(id);
      stories.push(story);
    };

    for (const rawId of storyIds) {
      if (stories.length >= recommendationLimit) break;
      const id = normalizeId(rawId);
      if (!id || selectedIds.has(id) || readIds.has(id)) continue;
      addStory(await Story.getStoryById(id));
    }

    // Duyệt thêm các trang khi trang đầu bị chiếm bởi truyện đã đọc.
    let page = 1;
    let totalPages = 1;
    const publicFallbacks = [];
    while (stories.length < recommendationLimit && page <= totalPages) {
      const popular = await Story.getAllStories(page, 50, 'popular');
      totalPages = popular.pagination?.totalPages || 1;
      for (const story of popular.stories) {
        publicFallbacks.push(story);
        addStory(story);
        if (stories.length >= recommendationLimit) break;
      }
      page += 1;
    }

    // Với kho dữ liệu nhỏ, số truyện chưa đọc có thể không đủ 10. Khi đó
    // bù các truyện công khai còn lại thay vì trả về một danh sách bị thiếu.
    for (const story of publicFallbacks) {
      if (stories.length >= recommendationLimit) break;
      addStory(story, true);
    }

    storyIds = stories.map((story) => story.id);

    return res.status(200).json({
      success: true,
      storyIds, // Danh sách ID gợi ý (dùng để client có thể cache)
      stories,  // Thông tin đầy đủ của từng truyện gợi ý
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
  getReadChaptersByStory,
  getChapterSummary,
  getRecommendations,
};
