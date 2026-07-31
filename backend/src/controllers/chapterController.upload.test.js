jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn().mockResolvedValue(undefined) })),
}));
jest.mock('../config/redisConfig', () => ({}));
jest.mock('../models', () => ({
  Story: { getStoryById: jest.fn() },
  Chapter: {
    getMaxChapterNumberByStory: jest.fn(),
    createChaptersBatch: jest.fn(),
  },
  StoryCollaborator: { isCollaborator: jest.fn() },
  Wallet: {},
}));

const { Story, Chapter, StoryCollaborator } = require('../models');
const { importChapterFile, previewChapterFile } = require('./chapterController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function approvedStory() {
  return {
    id: 20,
    title: 'Truyện kiểm thử',
    slug: 'truyen-kiem-thu',
    author_id: 7,
    moderation_status: 'approved',
    is_published: true,
    hidden_by_admin: false,
  };
}

function textFile(buffer = Buffer.from('# Chương 1: Khởi đầu\nNội dung chương.', 'utf8')) {
  return {
    originalname: 'truyen.txt',
    mimetype: 'text/plain',
    buffer,
  };
}

describe('chapter story-file upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('imports a valid story file into an approved owned story', async () => {
    Story.getStoryById.mockResolvedValue(approvedStory());
    Chapter.getMaxChapterNumberByStory.mockResolvedValue(0);
    Chapter.createChaptersBatch.mockResolvedValue([
      { id: 101, story_id: 20, chapter_number: 1, title: 'Khởi đầu' },
    ]);
    const req = {
      user: { id: 7, role: 'Uploader' },
      params: { storyId: '20' },
      body: { split_chapters: 'true' },
      file: textFile(),
    };
    const res = createResponse();

    await importChapterFile(req, res);

    expect(Chapter.createChaptersBatch).toHaveBeenCalledWith(
      '20',
      [expect.objectContaining({ title: 'Khởi đầu', content: 'Nội dung chương.' })],
      expect.objectContaining({ startChapterNumber: 1 }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      imported_count: 1,
      next_chapter_number: 2,
    }));
  });

  it('reads a UTF-16 LE file with Vietnamese characters correctly', async () => {
    Story.getStoryById.mockResolvedValue(approvedStory());
    const utf16Body = Buffer.from('# Chương 1: Tiếng Việt\nNội dung có dấu.', 'utf16le');
    const req = {
      user: { id: 7, role: 'Uploader' },
      params: { storyId: '20' },
      body: { split_chapters: 'true' },
      file: textFile(Buffer.concat([Buffer.from([0xff, 0xfe]), utf16Body])),
    };
    const res = createResponse();

    await previewChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      chapters: [expect.objectContaining({
        title: 'Tiếng Việt',
        content_preview: 'Nội dung có dấu.',
      })],
    }));
  });

  it('returns 400 when no file is uploaded', async () => {
    Story.getStoryById.mockResolvedValue(approvedStory());
    const req = {
      user: { id: 7, role: 'Uploader' },
      params: { storyId: '20' },
      body: {},
    };
    const res = createResponse();

    await importChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Chapter.createChaptersBatch).not.toHaveBeenCalled();
  });

  it('returns 400 when the file has no readable content', async () => {
    Story.getStoryById.mockResolvedValue(approvedStory());
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      user: { id: 7, role: 'Uploader' },
      params: { storyId: '20' },
      body: {},
      file: textFile(Buffer.from([0x00, 0x00, 0x00, 0x00])),
    };
    const res = createResponse();

    await previewChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
    consoleError.mockRestore();
  });

  it('returns 401 when the uploader is not logged in', async () => {
    const req = { params: { storyId: '20' }, body: {}, file: textFile() };
    const res = createResponse();

    await importChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(Story.getStoryById).not.toHaveBeenCalled();
  });

  it('returns 403 when the uploader does not own or collaborate on the story', async () => {
    Story.getStoryById.mockResolvedValue(approvedStory());
    StoryCollaborator.isCollaborator.mockResolvedValue(false);
    const req = {
      user: { id: 99, role: 'Uploader' },
      params: { storyId: '20' },
      body: {},
      file: textFile(),
    };
    const res = createResponse();

    await importChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Chapter.createChaptersBatch).not.toHaveBeenCalled();
  });

  it('returns 409 when the story has not been approved', async () => {
    Story.getStoryById.mockResolvedValue({
      ...approvedStory(),
      moderation_status: 'pending',
      is_published: false,
    });
    const req = {
      user: { id: 7, role: 'Uploader' },
      params: { storyId: '20' },
      body: {},
      file: textFile(),
    };
    const res = createResponse();

    await importChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(Chapter.createChaptersBatch).not.toHaveBeenCalled();
  });

  it('returns 500 and no success result when the database import fails', async () => {
    Story.getStoryById.mockResolvedValue(approvedStory());
    Chapter.getMaxChapterNumberByStory.mockResolvedValue(0);
    Chapter.createChaptersBatch.mockRejectedValue(new Error('Database unavailable'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      user: { id: 7, role: 'Uploader' },
      params: { storyId: '20' },
      body: {},
      file: textFile(),
    };
    const res = createResponse();

    await importChapterFile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Database unavailable',
    });
    consoleError.mockRestore();
  });
});
