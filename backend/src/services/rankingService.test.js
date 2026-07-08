jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const db = require('../config/database');
const {
  normalizeLimit,
  normalizePeriod,
  normalizeType,
  queryRankings,
} = require('./rankingService');

describe('rankingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes invalid ranking inputs to safe defaults', () => {
    expect(normalizeType('bad-type')).toBe('trending');
    expect(normalizePeriod('bad-period')).toBe('week');
    expect(normalizeLimit('abc')).toBe(20);
    expect(normalizeLimit(500)).toBe(100);
  });

  it('keeps valid ranking inputs', () => {
    expect(normalizeType('rating')).toBe('rating');
    expect(normalizePeriod('month')).toBe('month');
    expect(normalizeLimit(12)).toBe(12);
  });

  it('adds rank and top badges to queried rankings', async () => {
    db.query.mockResolvedValue({
      rows: [
        { id: 1, title: 'Top Story' },
        { id: 2, title: 'Second Story' },
        { id: 3, title: 'Third Story' },
        { id: 4, title: 'Fourth Story' },
      ],
    });

    const result = await queryRankings('views', 'week', 4);

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY views_metric DESC'), [4]);
    expect(result.map((story) => story.rank)).toEqual([1, 2, 3, 4]);
    expect(result.map((story) => story.badge)).toEqual(['top1', 'top2', 'top3', null]);
  });
});
