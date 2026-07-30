jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({ add: jest.fn() })),
}));
jest.mock('../config/redisConfig', () => ({}));
jest.mock('../models', () => ({
  Chapter: { getChapterById: jest.fn() },
  Story: {},
  StoryCollaborator: {},
  Wallet: {
    UNLOCK_COST: 10,
    unlockChapter: jest.fn(),
  },
}));
jest.mock('../services/chapterAccessService', () => ({
  getChapterAccess: jest.fn(),
  lockedChapterResponse: jest.fn(),
}));

const { Chapter, Wallet } = require('../models');
const { getChapterAccess } = require('../services/chapterAccessService');
const { unlockChapter } = require('./chapterController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('paid chapter unlocking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 for a missing chapter', async () => {
    Chapter.getChapterById.mockResolvedValue(null);
    const res = response();
    await unlockChapter({ user: { id: 2 }, params: { id: '50' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('does not charge for a free chapter', async () => {
    Chapter.getChapterById.mockResolvedValue({ id: 50, is_paid: false });
    getChapterAccess.mockResolvedValue({ canRead: true, reason: 'FREE' });
    const res = response();
    await unlockChapter({ user: { id: 2 }, params: { id: '50' } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(Wallet.unlockChapter).not.toHaveBeenCalled();
  });

  it('charges once for a locked chapter', async () => {
    Chapter.getChapterById.mockResolvedValue({ id: 50, is_paid: true });
    getChapterAccess.mockResolvedValue({ canRead: false, reason: 'PAYMENT_REQUIRED' });
    Wallet.unlockChapter.mockResolvedValue({ already_unlocked: false, crystal_balance: 90 });
    const res = response();
    await unlockChapter({ user: { id: 2 }, params: { id: '50' } }, res);
    expect(Wallet.unlockChapter).toHaveBeenCalledWith(2, 50);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'CHAPTER_UNLOCKED', crystal_balance: 90, unlock_cost: 10,
    }));
  });

  it('returns zero cost when a concurrent request already unlocked the chapter', async () => {
    Chapter.getChapterById.mockResolvedValue({ id: 50, is_paid: true });
    getChapterAccess.mockResolvedValue({ canRead: false, reason: 'PAYMENT_REQUIRED' });
    Wallet.unlockChapter.mockResolvedValue({ already_unlocked: true, crystal_balance: 90 });
    const res = response();
    await unlockChapter({ user: { id: 2 }, params: { id: '50' } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'CHAPTER_ALREADY_UNLOCKED', unlock_cost: 0,
    }));
  });

  it('returns current balance when crystals are insufficient', async () => {
    Chapter.getChapterById.mockResolvedValue({ id: 50, is_paid: true });
    getChapterAccess.mockResolvedValue({ canRead: false, reason: 'PAYMENT_REQUIRED' });
    Wallet.unlockChapter.mockRejectedValue(Object.assign(new Error('low balance'), {
      code: 'INSUFFICIENT_CRYSTALS', crystalBalance: 4,
    }));
    const res = response();
    await unlockChapter({ user: { id: 2 }, params: { id: '50' } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'INSUFFICIENT_CRYSTALS', crystal_balance: 4,
    }));
  });

  it('does not expose database errors', async () => {
    Chapter.getChapterById.mockRejectedValue(new Error('password=secret'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = response();
    await unlockChapter({ user: { id: 2 }, params: { id: '50' } }, res);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
    log.mockRestore();
  });
});
