jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const db = require('../config/database');
const {
  createReport,
  getReports,
  updateReportStatus,
} = require('./reportController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('reportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a story report when payload is valid', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    const req = {
      user: { id: 5 },
      body: {
        reason: 'Copyright',
        description: 'Copied content',
        story_id: 10,
        chapter_id: null,
        comment_id: null,
      },
    };
    const res = createResponse();

    await createReport(req, res);

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO reports'),
      [5, 10, null, null, 'Copyright', 'Copied content']
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejects report spam within one hour', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ count: '10' }] });

    const req = {
      user: { id: 5 },
      body: {
        reason: 'Spam',
        description: 'Too many reports',
        story_id: 10,
        chapter_id: null,
        comment_id: null,
      },
    };
    const res = createResponse();

    await createReport(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('returns filtered reports by status', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'NEW' }] });
    const req = { query: { status: 'NEW' } };
    const res = createResponse();

    await getReports(req, res);

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE r.status = $1'), ['NEW']);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ reports: [{ id: 1, status: 'NEW' }] });
  });

  it('returns 404 when updating a missing report', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });
    const req = { params: { id: '404' }, body: { status: 'RESOLVED' } };
    const res = createResponse();

    await updateReportStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
