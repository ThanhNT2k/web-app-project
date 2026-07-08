const redisStore = new Map();
const mockRedis = {
  on: jest.fn(),
  set: jest.fn(async (key, value) => {
    redisStore.set(key, value);
    return 'OK';
  }),
  get: jest.fn(async (key) => redisStore.get(key) || null),
  del: jest.fn(async (...keys) => {
    keys.forEach((key) => redisStore.delete(key));
    return keys.length;
  }),
};

jest.mock('ioredis', () => jest.fn(() => mockRedis));

const {
  clearOtpKeys,
  generateAndStoreOtp,
  isVerified,
  verifyOtp,
} = require('./otpService');

describe('otpService', () => {
  beforeEach(() => {
    redisStore.clear();
    jest.clearAllMocks();
  });

  it('generates a 6-digit OTP and stores it with expiration', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);

    const otp = await generateAndStoreOtp('reader@example.com');

    expect(otp).toBe('211110');
    expect(mockRedis.set).toHaveBeenCalledWith('otp:forgot:reader@example.com', otp, 'EX', 300);

    Math.random.mockRestore();
  });

  it('verifies a matching OTP, deletes it, and marks the email verified', async () => {
    redisStore.set('otp:forgot:reader@example.com', '123456');

    const result = await verifyOtp('reader@example.com', '123456');

    expect(result).toBe(true);
    expect(redisStore.has('otp:forgot:reader@example.com')).toBe(false);
    expect(mockRedis.set).toHaveBeenCalledWith('otp:verified:reader@example.com', '1', 'EX', 600);
  });

  it('rejects a wrong OTP without marking the email verified', async () => {
    redisStore.set('otp:forgot:reader@example.com', '123456');

    await expect(verifyOtp('reader@example.com', '000000')).resolves.toBe(false);
    await expect(isVerified('reader@example.com')).resolves.toBe(false);
  });

  it('clears OTP and verified keys after password reset', async () => {
    redisStore.set('otp:forgot:reader@example.com', '123456');
    redisStore.set('otp:verified:reader@example.com', '1');

    await clearOtpKeys('reader@example.com');

    expect(redisStore.has('otp:forgot:reader@example.com')).toBe(false);
    expect(redisStore.has('otp:verified:reader@example.com')).toBe(false);
  });
});
