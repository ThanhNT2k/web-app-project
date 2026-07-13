jest.mock('../models', () => ({
  BadWord: {
    update: jest.fn(),
  },
}));

jest.mock('../services/moderationService', () => ({
  loadModerationData: jest.fn(),
}));

const { BadWord } = require('../models');
const { loadModerationData } = require('../services/moderationService');
const { update } = require('./badWordController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('badWordController.update', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates the tier and reloads moderation rules', async () => {
    BadWord.update.mockResolvedValueOnce({ id: 4, keyword: 'spam', tier: 3 });
    const req = { params: { id: '4' }, body: { tier: 3 } };
    const res = createResponse();

    await update(req, res);

    expect(BadWord.update).toHaveBeenCalledWith('4', { tier: 3 });
    expect(loadModerationData).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects unsupported tiers', async () => {
    const req = { params: { id: '4' }, body: { tier: 5 } };
    const res = createResponse();

    await update(req, res);

    expect(BadWord.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
