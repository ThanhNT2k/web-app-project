const { authorizeRole } = require('./roleMiddleware');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('authorizeRole', () => {
  it('allows a user with one of the accepted roles', () => {
    const req = { user: { role: 'Moderator' } };
    const res = createResponse();
    const next = jest.fn();

    authorizeRole('Admin', 'Moderator')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('compares roles case-insensitively', () => {
    const req = { user: { role: 'admin' } };
    const res = createResponse();
    const next = jest.fn();

    authorizeRole('Admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects requests without role information', () => {
    const req = { user: {} };
    const res = createResponse();
    const next = jest.fn();

    authorizeRole('Admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied: No role information found',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects users with insufficient permissions', () => {
    const req = { user: { role: 'User' } };
    const res = createResponse();
    const next = jest.fn();

    authorizeRole('Admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied: Insufficient permissions',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
