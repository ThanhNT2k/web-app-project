jest.mock('../models/UserFollow', () => ({
  getFollowedStories: jest.fn(),
  isFollowing: jest.fn(),
  follow: jest.fn(),
  unfollow: jest.fn(),
}));
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn().mockResolvedValue(undefined) })),
}));
jest.mock('../config/redisConfig', () => ({}));
jest.mock('../models/Comment', () => ({
  create: jest.fn(), getByStory: jest.fn(), findById: jest.fn(),
  vote: jest.fn(), remove: jest.fn(),
}));

const UserFollow = require('../models/UserFollow');
const Comment = require('../models/Comment');
const followController = require('./followController');
const commentController = require('./commentController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('follow interactions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns following false for a guest', async () => {
    const res = response();
    await followController.checkFollow({ params: { storyId: '1' } }, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, following: false });
  });

  it('keeps repeated follow and unfollow requests idempotent', async () => {
    const req = { user: { id: 3 }, params: { storyId: '8' } };
    for (let i = 0; i < 2; i += 1) await followController.followStory(req, response());
    for (let i = 0; i < 2; i += 1) await followController.unfollowStory(req, response());
    expect(UserFollow.follow).toHaveBeenCalledTimes(2);
    expect(UserFollow.unfollow).toHaveBeenCalledTimes(2);
  });

  it.each(['0', '-1', 'abc'])('rejects invalid story id %s', async (storyId) => {
    const res = response();
    await followController.followStory({ user: { id: 3 }, params: { storyId } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('comment validation and ownership', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    [{ story_id: 1, content: '   ' }],
    [{ story_id: 1, content: 'x'.repeat(2001) }],
    [{ story_id: 1, content: 'valid', rating: 6 }],
  ])('rejects invalid comment payload %#', async (body) => {
    const res = response();
    await commentController.create({ user: { id: 2 }, body }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Comment.create).not.toHaveBeenCalled();
  });

  it('rejects a reply whose parent belongs to another thread', async () => {
    Comment.findById.mockResolvedValue({ id: 5, story_id: 99, chapter_id: null });
    const res = response();
    await commentController.create({
      user: { id: 2 },
      body: { story_id: 1, chapter_id: null, parent_comment_id: 5, content: 'reply' },
    }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('prevents a user from deleting another user comment', async () => {
    Comment.findById.mockResolvedValue({ id: 5, user_id: 10 });
    const res = response();
    await commentController.remove({ user: { id: 2, role: 'User' }, params: { id: '5' } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(Comment.remove).not.toHaveBeenCalled();
  });

  it('allows an admin to delete another user comment', async () => {
    Comment.findById.mockResolvedValue({ id: 5, user_id: 10 });
    const res = response();
    await commentController.remove({ user: { id: 1, role: 'Admin' }, params: { id: '5' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Comment.remove).toHaveBeenCalledWith('5');
  });

  it.each([0, 2, -2])('rejects unsupported vote value %s', async (value) => {
    const res = response();
    await commentController.vote({ user: { id: 1 }, params: { id: '5' }, body: { value } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
