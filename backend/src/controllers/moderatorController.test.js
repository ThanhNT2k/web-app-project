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

jest.mock('../models/Notification', () => ({
  create: jest.fn(),
}));

const db = require('../config/database');
const Notification = require('../models/Notification');
const { approvePendingStory, processPendingStory, getComments } = require('./moderatorController');

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
      [11, null]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('moderatorController.processPendingStory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests changes with a required reason and notifies the uploader', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 12,
        title: 'Needs work',
        slug: 'needs-work',
        author_id: 8,
        is_published: false,
        moderation_status: 'changes_requested',
        moderation_note: 'Bổ sung mô tả',
      }],
    });
    Notification.create.mockResolvedValueOnce({ id: 1 });
    const req = {
      params: { id: '12' },
      body: { action: 'request_changes', note: 'Bổ sung mô tả' },
      user: { id: 3 },
    };
    const res = createResponse();

    await processPendingStory(req, res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("COALESCE(moderation_status, 'pending') = 'pending'"),
      [12, false, 'changes_requested', 'Bổ sung mô tả', 3]
    );
    expect(Notification.create).toHaveBeenCalledWith(
      8,
      12,
      null,
      expect.stringContaining('Bổ sung mô tả'),
      '/dashboard',
      'system'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects request changes without a reason', async () => {
    const req = {
      params: { id: '12' },
      body: { action: 'request_changes', note: '   ' },
      user: { id: 3 },
    };
    const res = createResponse();

    await processPendingStory(req, res);

    expect(db.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
