jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const db = require('../../config/database');
const Wallet = require('../Wallet');

describe('Wallet model', () => {
  beforeEach(() => jest.clearAllMocks());

  test('hasUnlocked returns false for guests without querying', async () => {
    await expect(Wallet.hasUnlocked(null, 10)).resolves.toBe(false);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('getWallet returns balance and paginated transactions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ crystal_balance: 48 }] })
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          type: 'CHAPTER_UNLOCK',
          amount: -2,
          balance_after: 48,
          total_count: '1',
        }],
      });

    const result = await Wallet.getWallet(7);
    expect(result.crystal_balance).toBe(48);
    expect(result.transactions).toHaveLength(1);
    expect(result.pagination.totalItems).toBe(1);
  });

  test('unlockChapter rolls back when balance is insufficient', async () => {
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({
          rows: [{
            id: 9,
            is_paid: true,
            is_published: true,
            story_is_published: true,
            hidden_by_admin: false,
          }],
        })
        .mockResolvedValueOnce({ rows: [{ crystal_balance: 1 }] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({}),
      release: jest.fn(),
    };
    db.connect.mockResolvedValue(client);

    await expect(Wallet.unlockChapter(2, 9)).rejects.toMatchObject({
      code: 'INSUFFICIENT_CRYSTALS',
    });
    expect(client.query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });
});
