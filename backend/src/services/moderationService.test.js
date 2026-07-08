jest.mock('../models/BadWord', () => ({
  findAll: jest.fn(async () => []),
}));

const BadWord = require('../models/BadWord');
const { loadModerationData, moderateContent } = require('./moderationService');

describe('moderationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks clean content as safe', async () => {
    BadWord.findAll.mockResolvedValue([]);

    await loadModerationData();

    expect(moderateContent('A normal comment')).toEqual({
      isSafe: true,
      tier: 0,
      maskedContent: 'A normal comment',
    });
  });

  it('detects bad words and masks tier 2 words', async () => {
    BadWord.findAll.mockResolvedValue([
      { keyword: 'spam', tier: 1 },
      { keyword: 'danger', tier: 2 },
    ]);

    await loadModerationData();

    expect(moderateContent('This spam has danger inside')).toEqual({
      isSafe: false,
      tier: 2,
      maskedContent: 'This spam has ****** inside',
    });
  });
});
