jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

jest.mock('../models', () => ({
  Story: {},
  Comment: { updateStatus: jest.fn() },
}));

jest.mock('../models/Tag', () => ({
  getTagsForStory: jest.fn(),
}));

const db = require('../config/database');
const { approvePendingStory, getComments } = require('./moderatorController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('moderatorController.getComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters comments on the server and returns global status counts', async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [{
          id: 7,
          content: 'spam content',
          status: 'flagged',
          total_count: '1',
        }],
      })
      .mockResolvedValueOnce({
        rows: [{ total: 12, approved: 7, masked: 2, flagged: 2, rejected: 1 }],
      });

    const req = {
      query: { page: '2', limit: '20', status: 'flagged', search: 'spam' },
    };
    const res = createResponse();

    await getComments(req, res);

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('c.content ILIKE'),
      ['flagged', '%spam%', 20, 20]
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      comments: [{ id: 7, content: 'spam content', status: 'flagged' }],
      stats: { total: 12, approved: 7, masked: 2, flagged: 2, rejected: 1 },
      pagination: { page: 2, limit: 20, totalItems: 1, totalPages: 1 },
    });
  });
});

describe('moderatorController.approvePendingStory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes a story only when it is in the moderation queue', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 11, title: 'Pending story', slug: 'pending-story', is_published: true }],
    });
    const req = { params: { id: '11' } };
    const res = createResponse();

    await approvePendingStory(req, res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('hidden_by_admin = false'),
      [11]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
