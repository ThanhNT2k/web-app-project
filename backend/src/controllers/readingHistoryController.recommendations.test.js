jest.mock('../services/aiService', () => ({
  generatePersonalRecommendations: jest.fn(),
}));

jest.mock('../models', () => ({
  Chapter: {},
  Story: {
    getStoryById: jest.fn(),
    getAllStories: jest.fn(),
  },
}));

jest.mock('../models/ReadingHistory', () => ({
  getReadingHistory: jest.fn(),
}));

jest.mock('../models/UserChapterRead', () => ({}));
jest.mock('../models/AISummary', () => ({}));

const aiService = require('../services/aiService');
const { Story } = require('../models');
const ReadingHistory = require('../models/ReadingHistory');
const { getRecommendations } = require('./readingHistoryController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function story(id) {
  return {
    id,
    title: `Story ${id}`,
    is_published: true,
    hidden_by_admin: false,
  };
}

describe('readingHistoryController.getRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fills the list to 10 with other public stories when unread stories are insufficient', async () => {
    const publicStories = Array.from({ length: 10 }, (_, index) => story(index + 1));
    ReadingHistory.getReadingHistory.mockResolvedValue([{ story_id: 1 }, { story_id: 2 }]);
    aiService.generatePersonalRecommendations.mockResolvedValue([3]);
    Story.getStoryById.mockResolvedValue(story(3));
    Story.getAllStories.mockResolvedValue({
      stories: publicStories,
      pagination: { totalPages: 1 },
    });
    const res = createResponse();

    await getRecommendations({ user: { id: 7 }, query: { limit: '10' } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.stories).toHaveLength(10);
    expect(payload.storyIds).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 1, 2]);
  });

  it('caps the recommendation response at 10 stories', async () => {
    ReadingHistory.getReadingHistory.mockResolvedValue([]);
    Story.getAllStories.mockResolvedValue({
      stories: Array.from({ length: 12 }, (_, index) => story(index + 1)),
      pagination: { totalPages: 1 },
    });
    const res = createResponse();

    await getRecommendations({ user: { id: 7 }, query: { limit: '20' } }, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.stories).toHaveLength(10);
    expect(payload.storyIds).toHaveLength(10);
  });
});
