const jwt = require('jsonwebtoken');

const env = require('../config/environment');
const { authenticateToken, authorizeAdmin, optionalAuth } = require('./authMiddleware');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('authMiddleware', () => {
  it('rejects requests without a bearer token', () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches decoded user data for a valid token', () => {
    const payload = { id: 7, email: 'reader@example.com', role: 'User' };
    const token = jwt.sign(payload, env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('treats missing optional auth as a guest request', () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows admins through authorizeAdmin', () => {
    const req = { user: { role: 'Admin' } };
    const res = createResponse();
    const next = jest.fn();

    authorizeAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects non-admin users in authorizeAdmin', () => {
    const req = { user: { role: 'User' } };
    const res = createResponse();
    const next = jest.fn();

    authorizeAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. Admins only.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
