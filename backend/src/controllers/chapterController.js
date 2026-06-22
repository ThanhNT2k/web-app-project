const Joi = require('joi');

const { Chapter, Story, StoryCollaborator } = require('../models');
const { parseStoryUploadFile, parseStoryTextToChapters } = require('../services/storyFileImportService');

// Schema validate khi TẠO chương mới
// chapter_number: số thứ tự chương, phải là số nguyên dương (bắt đầu từ 1)
const createChapterSchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  content: Joi.string().trim().required(),
  chapter_number: Joi.number().integer().min(1).required(),
}).required();

// Schema validate khi CẬP NHẬT chương (không cho phép đổi chapter_number)
const updateChapterSchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  content: Joi.string().trim().required(),
}).required();

const importChapterFileSchema = Joi.object({
  split_chapters: Joi.boolean().optional(),
  start_chapter_number: Joi.number().integer().min(1).optional(),
  title: Joi.string().trim().max(255).allow('', null).optional(),
  raw_text_override: Joi.string().trim().allow('', null).optional(),
}).required();

/**
 * Kiểm tra quyền thao tác với chương (thêm/sửa/xóa).
 * Logic giống storyController: chỉ tác giả hoặc Admin được phép.
 * So sánh Number(...) để tránh lỗi so sánh kiểu dữ liệu khác nhau.
 */
function isStoryOwnerOrAdmin(user, story) {
  if (!user || !story) {
    return false;
  }
  return user.role === 'Admin' || Number(user.id) === Number(story.author_id);
}

/**
 * Kiểm tra xem user có phải cộng tác viên, chủ sở hữu hoặc Admin không.
 */
async function isStoryCollaboratorOrOwnerOrAdmin(user, story) {
  if (!user || !story) return false;
  if (user.role === 'Admin') return true;
  if (Number(user.id) === Number(story.author_id)) return true;
  return await StoryCollaborator.isCollaborator(story.id, user.id);
}

/**
 * Lấy danh sách chương của một truyện với pagination và sắp xếp.
 * Hỗ trợ sort ascending (asc) hoặc descending (desc) theo chapter_number.
 * Thường dùng asc để hiển thị từ chương 1 lên, desc để hiển thị chương mới nhất trước.
 */
async function getChapters(req, res) {
  try {
    const { storyId } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sort = req.query.sort || 'asc';  // Mặc định sắp xếp từ chương đầu tiên
    const story = await Story.getStoryById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    if (!story.is_published || story.hidden_by_admin) {
      const isOwnerOrAdmin = req.user && (
        req.user.role === 'Admin' ||
        Number(req.user.id) === Number(story.author_id)
      );
      const isCollaborator = req.user && await StoryCollaborator.isCollaborator(story.id, req.user.id);
      if (!isOwnerOrAdmin && !isCollaborator) {
        return res.status(404).json({ success: false, message: 'Story not found' });
      }
    }

    const result = await Chapter.getChaptersByStory(storyId, page, limit, sort);
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

/**
 * Lấy chi tiết một chương theo chapterId.
 * Response bao gồm thông tin chương kèm thông tin cơ bản của truyện (story_title, story_slug,...).
 */
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
    
    // Kiểm tra trạng thái ẩn/hiện của truyện chứa chương này
    if (!chapter.story_is_published || chapter.story_hidden_by_admin) {
      const isOwnerOrAdmin = req.user && (
        req.user.role === 'Admin' ||
        Number(req.user.id) === Number(chapter.story_author_id)
      );
      const isCollaborator = req.user && await StoryCollaborator.isCollaborator(chapter.story_id, req.user.id);
      if (!isOwnerOrAdmin && !isCollaborator) {
        return res.status(404).json({ success: false, message: 'Chapter not found' });
      }
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

/**
 * Tạo chương mới cho một truyện.
 * Luồng: Xác thực → Kiểm tra truyện tồn tại → Kiểm tra quyền → Validate → Tạo chương
 *
 * Khi tạo chương thành công, model Chapter.createChapter sẽ tự động
 * tăng total_chapters của truyện lên 1 (trong một transaction).
 */
async function createChapter(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { storyId } = req.params;

    // Lấy truyện để xác nhận truyện tồn tại trước khi thêm chương
    const story = await Story.getStoryById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    // Kiểm tra quyền: chỉ tác giả của truyện, cộng tác viên hoặc Admin mới thêm được chương
    const hasAddPermission = await isStoryCollaboratorOrOwnerOrAdmin(req.user, story);
    if (!hasAddPermission) {
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

    // Xây dựng object dữ liệu chương với storyId từ URL params
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

async function importChapterFile(req, res) {
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

    const hasAddPermission = await isStoryCollaboratorOrOwnerOrAdmin(req.user, story);
    if (!hasAddPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên tệp .txt hoặc .md hợp lệ',
      });
    }

    const { error, value } = importChapterFileSchema.validate(req.body || {}, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const hasRawOverride = Boolean(value.raw_text_override && value.raw_text_override.trim());
    const chaptersFromFile = hasRawOverride
      ? parseStoryTextToChapters(value.raw_text_override, {
        splitChapters: value.split_chapters,
        singleTitle: value.title,
      })
      : parseStoryUploadFile(req.file, {
        splitChapters: value.split_chapters,
        singleTitle: value.title,
      });

    const maxChapterNumber = await Chapter.getMaxChapterNumberByStory(storyId);
    const startChapterNumber = value.start_chapter_number || (maxChapterNumber + 1);

    const createdChapters = await Chapter.createChaptersBatch(storyId, chaptersFromFile, {
      startChapterNumber,
    });

    return res.status(201).json({
      success: true,
      message: 'Import chapter từ file thành công',
      imported_count: createdChapters.length,
      chapters: createdChapters,
      next_chapter_number: startChapterNumber + createdChapters.length,
    });
  } catch (error) {
    console.error('[chapterController.importChapterFile]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

/**
 * Cập nhật nội dung chương (title và content).
 * Không cho phép thay đổi chapter_number (để tránh xáo trộn thứ tự chương).
 */
async function updateChapter(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { storyId, chapterId } = req.params;

    // Kiểm tra truyện cha tồn tại trước khi thao tác với chương
    const story = await Story.getStoryById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found',
      });
    }

    // Kiểm tra quyền chỉnh sửa ở cấp truyện: chỉ tác giả, cộng tác viên hoặc Admin
    const hasEditPermission = await isStoryCollaboratorOrOwnerOrAdmin(req.user, story);
    if (!hasEditPermission) {
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

    // Trường hợp chapterId không tìm thấy trong database
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

/**
 * Xóa chương (xóa thật khỏi database, không phải soft delete).
 * Khi xóa thành công, model tự động giảm total_chapters của truyện đi 1.
 */
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

/**
 * Lấy chi tiết một chương bằng storySlug và chapterNumber.
 * Kiểm tra trạng thái ẩn/hiện của truyện chứa chương này (phân quyền).
 */
async function getChapterBySlugAndNumber(req, res) {
  try {
    const { storySlug, chapterNumber } = req.params;
    const chapter = await Chapter.getChapterBySlugAndNumber(storySlug, chapterNumber);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    // Kiểm tra trạng thái ẩn/hiện của truyện chứa chương này
    if (!chapter.story_is_published || chapter.story_hidden_by_admin) {
      const isOwnerOrAdmin = req.user && (
        req.user.role === 'Admin' ||
        Number(req.user.id) === Number(chapter.story_author_id)
      );
      const isCollaborator = req.user && await StoryCollaborator.isCollaborator(chapter.story_id, req.user.id);
      if (!isOwnerOrAdmin && !isCollaborator) {
        return res.status(404).json({
          success: false,
          message: 'Chapter not found',
        });
      }
    }

    return res.status(200).json({
      success: true,
      chapter,
    });
  } catch (error) {
    console.error('[chapterController.getChapterBySlugAndNumber]', error);
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
  importChapterFile,
  updateChapter,
  deleteChapter,
  getChapterBySlugAndNumber,
};