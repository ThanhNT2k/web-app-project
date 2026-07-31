jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'test-jwt-token'),
}));

jest.mock('../models', () => ({
  User: {
    findByEmail: jest.fn(),
  },
}));

jest.mock('../services/googleAuthService', () => ({
  verifyGoogleToken: jest.fn(),
  generateUniqueUsername: jest.fn(),
}));
jest.mock('../services/otpService', () => ({
  generateAndStoreOtp: jest.fn(),
  verifyOtp: jest.fn(),
  isVerified: jest.fn(),
  clearOtpKeys: jest.fn(),
}));
jest.mock('../services/emailService', () => ({
  sendOtpEmail: jest.fn(),
}));
jest.mock('../services/storageService', () => ({
  deleteStorageObjectByUrl: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { login } = require('./authController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function validUser() {
  return {
    id: 1,
    username: 'reader',
    email: 'reader@example.com',
    password: '$2a$10$hashed-password',
    role: 'User',
    full_name: 'Reader',
    is_active: true,
  };
}

describe('authController.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and a sanitized user for a valid email and password', async () => {
    User.findByEmail.mockResolvedValue(validUser());
    bcrypt.compare.mockResolvedValue(true);
    const req = { body: { email: 'reader@example.com', password: 'Password1!' } };
    const res = createResponse();

    await login(req, res, jest.fn());

    expect(User.findByEmail).toHaveBeenCalledWith('reader@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('Password1!', '$2a$10$hashed-password');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      token: 'test-jwt-token',
      user: expect.not.objectContaining({ password: expect.anything() }),
    }));
  });

  it('returns 401 when the email is correct but the password is wrong', async () => {
    User.findByEmail.mockResolvedValue(validUser());
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { email: 'reader@example.com', password: 'WrongPassword1!' } };
    const res = createResponse();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid credentials',
    });
  });

  it('returns 401 when the email is wrong even if the password matches another account', async () => {
    User.findByEmail.mockResolvedValue(null);
    const req = { body: { email: 'unknown@example.com', password: 'Password1!' } };
    const res = createResponse();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid credentials',
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it.each([
    ['full-width Unicode font', 'ｒｅａｄｅｒ＠ｅｘａｍｐｌｅ．ｃｏｍ'],
    ['invalid email format', 'reader-at-example.com'],
  ])('returns 400 for %s', async (_caseName, email) => {
    const req = { body: { email, password: 'Password1!' } };
    const res = createResponse();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Validation failed',
      errors: expect.any(Array),
    }));
    expect(User.findByEmail).not.toHaveBeenCalled();
  });

  it('passes an unexpected database error to the error middleware', async () => {
    const databaseError = new Error('Database unavailable');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    User.findByEmail.mockRejectedValue(databaseError);
    const req = { body: { email: 'reader@example.com', password: 'Password1!' } };
    const res = createResponse();
    const next = jest.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
    expect(res.status).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('[authController.login]', databaseError);
    consoleError.mockRestore();
  });
});
