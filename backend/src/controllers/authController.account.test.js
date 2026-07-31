jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'safe-token') }));
jest.mock('../models', () => ({
  User: {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    updatePassword: jest.fn(),
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
jest.mock('../services/emailService', () => ({ sendOtpEmail: jest.fn() }));
jest.mock('../services/storageService', () => ({ deleteStorageObjectByUrl: jest.fn() }));

const bcrypt = require('bcryptjs');
const { User } = require('../models');
const otpService = require('../services/otpService');
const { sendOtpEmail } = require('../services/emailService');
const {
  register,
  forgotPassword,
  verifyOtpHandler,
  resetPassword,
} = require('./authController');

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
const registration = (overrides = {}) => ({
  username: 'Reader_01',
  email: 'reader@example.com',
  password: 'Password1!',
  full_name: 'Reader Test',
  ...overrides,
});

describe('account registration and password recovery', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['invalid email', { email: 'reader-at-example.com' }],
    ['accented username', { username: 'độc_giả' }],
    ['username with spaces', { username: 'reader one' }],
    ['weak password', { password: 'password' }],
  ])('rejects registration with %s', async (_name, overrides) => {
    const res = response();
    await register({ body: registration(overrides) }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.createUser).not.toHaveBeenCalled();
  });

  it('rejects a duplicate username before checking email', async () => {
    User.findByUsername.mockResolvedValue({ id: 1 });
    const res = response();
    await register({ body: registration() }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(User.findByEmail).not.toHaveBeenCalled();
  });

  it('rejects a duplicate email', async () => {
    User.findByUsername.mockResolvedValue(null);
    User.findByEmail.mockResolvedValue({ id: 1 });
    const res = response();
    await register({ body: registration() }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('ignores mass-assigned role and never returns a password hash', async () => {
    User.findByUsername.mockResolvedValue(null);
    User.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    User.createUser.mockResolvedValue({
      id: 2, username: 'reader_01', email: 'reader@example.com',
      password: 'hashed', role: 'User',
    });
    const res = response();
    await register({ body: registration({ role: 'Admin', is_active: false }) }, res, jest.fn());
    expect(User.createUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'User' }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.not.objectContaining({ password: expect.anything() }),
    }));
  });

  it('returns the same forgot-password response for existing and missing emails', async () => {
    const calls = [];
    for (const user of [{ id: 1, is_active: true }, null]) {
      User.findByEmail.mockResolvedValueOnce(user);
      otpService.generateAndStoreOtp.mockResolvedValueOnce('123456');
      const res = response();
      await forgotPassword({ body: { email: 'reader@example.com' } }, res, jest.fn());
      calls.push(res.json.mock.calls[0][0]);
    }
    expect(calls[0]).toEqual(calls[1]);
  });

  it('does not fail or reveal account state when email delivery fails', async () => {
    User.findByEmail.mockResolvedValue({ id: 1, is_active: true });
    otpService.generateAndStoreOtp.mockResolvedValue('123456');
    sendOtpEmail.mockRejectedValue(new Error('mail offline'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = response();
    await forgotPassword({ body: { email: 'reader@example.com' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    log.mockRestore();
  });

  it('rejects an invalid or expired OTP', async () => {
    otpService.verifyOtp.mockResolvedValue(false);
    const res = response();
    await verifyOtpHandler({ body: { email: 'reader@example.com', otp: '000000' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('requires OTP verification and a strong matching password before reset', async () => {
    const mismatch = response();
    await resetPassword({
      body: { email: 'reader@example.com', newPassword: 'Password1!', confirmPassword: 'Password2!' },
    }, mismatch, jest.fn());
    expect(mismatch.status).toHaveBeenCalledWith(400);

    otpService.isVerified.mockResolvedValue(false);
    const unverified = response();
    await resetPassword({
      body: { email: 'reader@example.com', newPassword: 'Password1!', confirmPassword: 'Password1!' },
    }, unverified, jest.fn());
    expect(unverified.status).toHaveBeenCalledWith(403);
  });

  it('updates the password and clears OTP keys after a verified reset', async () => {
    otpService.isVerified.mockResolvedValue(true);
    User.findByEmail.mockResolvedValue({ id: 9 });
    bcrypt.hash.mockResolvedValue('new-hash');
    const res = response();
    await resetPassword({
      body: { email: 'READER@example.com', newPassword: 'Password1!', confirmPassword: 'Password1!' },
    }, res, jest.fn());
    expect(User.updatePassword).toHaveBeenCalledWith(9, 'new-hash');
    expect(otpService.clearOtpKeys).toHaveBeenCalledWith('reader@example.com');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
