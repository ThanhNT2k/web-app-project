jest.mock('../models', () => ({
  Story: { searchStories: jest.fn(), getStoryById: jest.fn() },
  User: {},
  StoryCollaborator: { isCollaborator: jest.fn() },
  StoryRating: {
    upsertStoryRating: jest.fn(),
    deleteStoryRating: jest.fn(),
    getStoryRatingSummary: jest.fn(),
  },
}));
jest.mock('../models/Tag', () => ({ setStoryTags: jest.fn() }));
jest.mock('../services/storageService', () => ({ deleteStorageObjectByUrl: jest.fn() }));

const { Story, StoryRating } = require('../models');
const {
  searchStories, rateStory, deleteStoryRating, getStoryBySlug,
} = require('./storyController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
const published = { id: 4, is_published: true, hidden_by_admin: false };

describe('story discovery and ratings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes combined search, tag and pagination filters to the model', async () => {
    Story.searchStories.mockResolvedValue({ stories: [], pagination: { page: 2, totalPages: 0 } });
    const res = response();
    await searchStories({
      query: { q: `  kiếm %_' OR 1=1 --  `, category: 'Fantasy', tag_slug: 'kiem-hiep', page: '2', limit: '12' },
    }, res);
    expect(Story.searchStories).toHaveBeenCalledWith(
      `  kiếm %_' OR 1=1 --  `, 'Fantasy', 'kiem-hiep', '2', '12',
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns an empty search result without treating it as an error', async () => {
    Story.searchStories.mockResolvedValue({ stories: [], pagination: { page: 1, totalPages: 0 } });
    const res = response();
    await searchStories({ query: { q: 'không tồn tại' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, stories: [] }));
  });

  it('hides unpublished stories from guests', async () => {
    Story.getStoryBySlug = jest.fn().mockResolvedValue({
      id: 5, author_id: 9, is_published: false, hidden_by_admin: false,
    });
    const res = response();
    await getStoryBySlug({ params: { slug: 'draft' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it.each([0, 6, 1.5, 'five'])('rejects rating value %s', async (rating) => {
    Story.getStoryById.mockResolvedValue(published);
    const res = response();
    await rateStory({ user: { id: 2 }, params: { id: '4' }, body: { rating } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(StoryRating.upsertStoryRating).not.toHaveBeenCalled();
  });

  it('upserts a valid rating and returns the new summary', async () => {
    Story.getStoryById.mockResolvedValue(published);
    StoryRating.getStoryRatingSummary.mockResolvedValue({ average: 5, user_rating: 5 });
    const res = response();
    await rateStory({ user: { id: 2 }, params: { id: '4' }, body: { rating: 5 } }, res);
    expect(StoryRating.upsertStoryRating).toHaveBeenCalledWith('4', 2, 5);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('only deletes the current user rating', async () => {
    Story.getStoryById.mockResolvedValue(published);
    StoryRating.getStoryRatingSummary.mockResolvedValue({ average: 0, user_rating: null });
    const res = response();
    await deleteStoryRating({ user: { id: 2 }, params: { id: '4' } }, res);
    expect(StoryRating.deleteStoryRating).toHaveBeenCalledWith('4', 2);
  });
});
