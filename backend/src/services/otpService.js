const Redis = require('ioredis');
const redisConfig = require('../config/redisConfig');

// Khởi tạo Redis client dùng chung, kết nối lazy (kết nối khi dùng lần đầu)
let client = null;

function getClient() {
  if (!client) {
    client = new Redis(redisConfig.url);
    client.on('error', (err) => console.error('[Redis OTP Error]', err));
  }
  return client;
}

// Prefix keys để tránh xung đột với các key Redis khác trong hệ thống
const KEY_OTP    = (email) => `otp:forgot:${email}`;
const KEY_VERIFY = (email) => `otp:verified:${email}`;

const OTP_TTL_SECONDS      = 5 * 60;  // OTP hết hạn sau 5 phút
const VERIFIED_TTL_SECONDS = 10 * 60; // Trạng thái verified hết hạn sau 10 phút (để đặt mật khẩu mới)

/**
 * Tạo mã OTP 6 chữ số ngẫu nhiên, lưu vào Redis với TTL 5 phút.
 * Mỗi lần gọi sẽ ghi đè OTP cũ (nếu có) → người dùng chỉ dùng được OTP mới nhất.
 *
 * @param {string} email - Email của người dùng
 * @returns {string} Mã OTP 6 chữ số dạng string (đảm bảo luôn có 6 ký tự kể cả số 0 đầu)
 */
async function generateAndStoreOtp(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 100000–999999
  const redis = getClient();
  await redis.set(KEY_OTP(email), otp, 'EX', OTP_TTL_SECONDS);
  return otp;
}

/**
 * Kiểm tra OTP người dùng nhập có khớp với OTP trong Redis không.
 * Nếu đúng: xóa OTP, đánh dấu email đã verified (TTL 10 phút) để dùng ở bước reset-password.
 * Nếu sai hoặc hết hạn: trả về false.
 *
 * @param {string} email
 * @param {string} otpInput - OTP người dùng nhập vào
 * @returns {boolean}
 */
async function verifyOtp(email, otpInput) {
  const redis = getClient();
  const stored = await redis.get(KEY_OTP(email));

  if (!stored || stored !== String(otpInput)) {
    return false;
  }

  // Xóa OTP ngay sau khi verify thành công → không thể tái sử dụng
  await redis.del(KEY_OTP(email));

  // Đánh dấu email đã verified → bước reset-password sẽ kiểm tra key này
  await redis.set(KEY_VERIFY(email), '1', 'EX', VERIFIED_TTL_SECONDS);

  return true;
}

/**
 * Kiểm tra email này đã qua bước verify OTP chưa.
 * Dùng trước khi cho phép đặt mật khẩu mới.
 *
 * @param {string} email
 * @returns {boolean}
 */
async function isVerified(email) {
  const redis = getClient();
  const val = await redis.get(KEY_VERIFY(email));
  return val === '1';
}

/**
 * Xóa toàn bộ OTP keys liên quan đến email sau khi đặt mật khẩu mới thành công.
 * Ngăn tái sử dụng.
 *
 * @param {string} email
 */
async function clearOtpKeys(email) {
  const redis = getClient();
  await redis.del(KEY_OTP(email));
  await redis.del(KEY_VERIFY(email));
}

module.exports = {
  generateAndStoreOtp,
  verifyOtp,
  isVerified,
  clearOtpKeys,
};
