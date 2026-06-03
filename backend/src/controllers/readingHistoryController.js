const Joi = require('joi');

const aiService = require('../services/aiService');
const { Chapter, Story } = require('../models');
const ReadingHistory = require('../models/ReadingHistory');
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

    // Lưu tiến trình đọc vào bảng reading_history (UPSERT)
    const progress = await ReadingHistory.saveReadingProgress(
      req.user.id,
      value.story_id,
      value.chapter_id,
      readPosition,
      readTime,
    );

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
 * 4. Lọc bỏ truyện đã đọc khỏi danh sách gợi ý
 */
async function getRecommendations(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Lấy lịch sử đọc để phân tích sở thích của user
    const history = await ReadingHistory.getReadingHistory(req.user.id);

    let storyIds = [];

    if (history.length > 0) {
      // User đã có lịch sử đọc => dùng AI gợi ý dựa trên sở thích
      storyIds = await aiService.generatePersonalRecommendations(history);
    }

    if (storyIds.length === 0) {
      // Trường hợp 1: User chưa đọc truyện nào => gợi ý 5 truyện phổ biến nhất
      const popular = await Story.getAllStories(1, 5);
      storyIds = popular.stories.map((s) => s.id);
    } else {
      // Trường hợp 2: AI đã gợi ý nhưng cần validate và lọc
      const allStories = await Story.getAllStories(1, 50);

      // validIds: tập hợp ID của 50 truyện mới nhất đang available trong DB
      const validIds = new Set(allStories.stories.map((s) => s.id));
      // readIds: tập hợp ID của các truyện user đã đọc (để lọc ra khỏi gợi ý)
      const readIds = new Set(history.map((h) => h.story_id));

      // Giữ lại những ID do AI gợi ý mà:
      // - Tồn tại trong hệ thống (validIds)
      // - User chưa đọc (không có trong readIds)
      // - Chỉ lấy tối đa 5 gợi ý
      storyIds = storyIds.filter((id) => validIds.has(id) && !readIds.has(id)).slice(0, 5);

      // Nếu AI không đủ 5 gợi ý, bổ sung thêm truyện chưa đọc từ danh sách phổ biến
      if (storyIds.length < 5) {
        const extras = allStories.stories
          .filter((s) => !readIds.has(s.id) && !storyIds.includes(s.id)) // Chưa đọc và chưa có trong list gợi ý
          .slice(0, 5 - storyIds.length) // Chỉ lấy đủ số còn thiếu
          .map((s) => s.id);
        storyIds = [...storyIds, ...extras];
      }
    }

    // Fetch đầy đủ thông tin của từng truyện được gợi ý (sequential để đảm bảo thứ tự)
    const stories = [];
    for (const storyId of storyIds) {
      const story = await Story.getStoryById(storyId);
      if (story) {
        stories.push(story);
      }
    }

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
  getChapterSummary,
  getRecommendations,
};
