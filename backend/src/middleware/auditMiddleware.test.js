jest.mock('../models/AuditLog', () => ({
  create: jest.fn().mockResolvedValue({ id: 1 }),
  findAll: jest.fn(),
}));

const AuditLog = require('../models/AuditLog');
const { auditAction, sanitizeDetails } = require('./auditMiddleware');
const { getAuditLogs } = require('../controllers/auditLogController');

describe('audit logging', () => {
  beforeEach(() => jest.clearAllMocks());

  it('records successful management mutations and removes sensitive fields', async () => {
    let finishHandler;
    const req = {
      user: { id: 9, role: 'Admin' },
      params: { id: '14' },
      body: { role: 'Moderator', password: 'secret', token: 'secret-token' },
      ip: '127.0.0.1',
    };
    const res = {
      statusCode: 200,
      on: jest.fn((event, handler) => { if (event === 'finish') finishHandler = handler; }),
    };
    const next = jest.fn();

    auditAction('UPDATE_USER_ROLE', 'user')(req, res, next);
    finishHandler();
    await Promise.resolve();

    expect(next).toHaveBeenCalled();
    expect(AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 9,
      actorRole: 'Admin',
      entityId: '14',
      details: { role: 'Moderator' },
    }));
  });

  it('does not record failed requests', () => {
    let finishHandler;
    const res = { statusCode: 400, on: jest.fn((event, handler) => { finishHandler = handler; }) };
    auditAction('PROCESS_REPORT', 'report')({ user: { id: 2, role: 'Moderator' }, params: {}, body: {} }, res, jest.fn());
    finishHandler();
    expect(AuditLog.create).not.toHaveBeenCalled();
  });

  it('forces moderators to see only moderator audit records', async () => {
    AuditLog.findAll.mockResolvedValueOnce({ logs: [], pagination: { page: 1, totalPages: 0, totalItems: 0 } });
    const req = { user: { id: 2, role: 'Moderator' }, query: { role: 'Admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

    await getAuditLogs(req, res);

    expect(AuditLog.findAll).toHaveBeenCalledWith(expect.objectContaining({ actorRole: 'Moderator' }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('sanitizes nested request-sized values without exposing credentials', () => {
    expect(sanitizeDetails({ otp: '123456', keyword: 'test' })).toEqual({ keyword: 'test' });
  });
});
