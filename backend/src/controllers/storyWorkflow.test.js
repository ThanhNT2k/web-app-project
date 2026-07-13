jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn() })),
}));

jest.mock('../config/redisConfig', () => ({}));

jest.mock('../models', () => ({
  Story: {
    getStoryById: jest.fn(),
    createStory: jest.fn(),
  },
  Chapter: {
    createChapter: jest.fn(),
  },
  User: {},
  StoryCollaborator: {
    isCollaborator: jest.fn(),
  },
  StoryRating: {},
}));

jest.mock('../models/Tag', () => ({
  setStoryTags: jest.fn().mockResolvedValue([]),
}));

const { Story, Chapter } = require('../models');
const chapterController = require('./chapterController');
const storyController = require('./storyController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('story moderation workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks an uploader from adding a chapter before moderator approval', async () => {
    Story.getStoryById.mockResolvedValueOnce({
      id: 20,
      author_id: 7,
      is_published: false,
      hidden_by_admin: false,
      moderation_status: 'pending',
    });
    const req = {
      params: { storyId: '20' },
      user: { id: 7, role: 'Uploader' },
      body: { chapter_number: 1, title: 'Mở đầu', content: 'Nội dung' },
    };
    const res = createResponse();

    await chapterController.createChapter(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(Chapter.createChapter).not.toHaveBeenCalled();
  });

  it('prevents an uploader from publishing a story through visibility toggle', async () => {
    const req = {
      params: { id: '20' },
      user: { id: 7, role: 'Uploader' },
    };
    const res = createResponse();

    await storyController.toggleStoryVisibility(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Story.getStoryById).not.toHaveBeenCalled();
  });

  it('stores the work author separately from the uploader account', async () => {
    Story.createStory.mockResolvedValueOnce({ id: 21, title: 'Ỷ Thiên Đồ Long Ký' });
    const req = {
      user: { id: 7, role: 'Uploader' },
      body: {
        title: 'Ỷ Thiên Đồ Long Ký',
        slug: 'y-thien-do-long-ky',
        author_name: 'Kim Dung',
        description: 'Mô tả truyện đủ dài.',
      },
    };
    const res = createResponse();

    await storyController.createStory(req, res);

    expect(Story.createStory).toHaveBeenCalledWith(expect.objectContaining({
      author_id: 7,
      author_name: 'Kim Dung',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('previews a story file without creating chapters', async () => {
    Story.getStoryById.mockResolvedValueOnce({
      id: 20,
      author_id: 7,
      is_published: true,
      hidden_by_admin: false,
      moderation_status: 'approved',
    });
    const req = {
      params: { storyId: '20' },
      user: { id: 7, role: 'Uploader' },
      body: { split_chapters: 'true' },
      file: {
        originalname: 'demo.txt',
        buffer: Buffer.from('# Chương 1. Khởi đầu\nNội dung xem trước.', 'utf8'),
      },
    };
    const res = createResponse();

    await chapterController.previewChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      chapter_count: 1,
      chapters: [expect.objectContaining({ title: 'Khởi đầu' })],
    }));
    expect(Chapter.createChapter).not.toHaveBeenCalled();
  });
});
