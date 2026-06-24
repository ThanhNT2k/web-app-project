const { OAuth2Client } = require('google-auth-library');
const env = require('../config/environment');
const User = require('../models/user');

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Xác thực Google ID Token (credential) trả về từ Google Identity Services.
 * Dùng thư viện chính thức của Google → đảm bảo token hợp lệ, chưa hết hạn,
 * và được ký bởi Google (không bị giả mạo).
 *
 * @param {string} idToken - Google ID Token nhận từ frontend
 * @returns {{ googleId, email, name, picture }} Thông tin người dùng từ Google
 * @throws {Error} Nếu token không hợp lệ
 */
async function verifyGoogleToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,          // Google unique user ID (không đổi)
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,             // Tên hiển thị đầy đủ từ Google
    picture: payload.picture,       // URL avatar từ Google
  };
}

/**
 * Tạo username unique từ email Google.
 * Lấy phần trước @, sanitize, rồi kiểm tra DB.
 * Thử tối đa 5 lần với suffix ngẫu nhiên trước khi fallback UUID ngắn.
 *
 * Ví dụ: "nguyen.van.a@gmail.com"
 *   → "nguyenvana"
 *   → "nguyenvana_k7f2" (nếu trùng)
 *   → "user_1a2b3c" (fallback)
 *
 * @param {string} email
 * @returns {string} Username unique đã được kiểm tra trong DB
 */
async function generateUniqueUsername(email) {
  // Lấy phần trước @, bỏ ký tự đặc biệt (dấu chấm, gạch ngang...), lowercase, giới hạn 20 ký tự
  const base = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .slice(0, 20);

  // Đảm bảo base bắt đầu bằng chữ cái (yêu cầu của username schema hiện tại)
  const safeBase = /^[a-z]/.test(base) ? base : `user${base}`;

  // Thử dùng base trước
  const existing = await User.findByUsername(safeBase);
  if (!existing) return safeBase;

  // Thử với suffix ngẫu nhiên 4 ký tự (tối đa 5 lần)
  for (let i = 0; i < 5; i++) {
    const suffix = Math.random().toString(36).slice(2, 6); // "k7f2"
    const candidate = `${safeBase}_${suffix}`;
    const exists = await User.findByUsername(candidate);
    if (!exists) return candidate;
  }

  // Fallback cuối cùng: timestamp base36 (gần như không thể trùng)
  return `user_${Date.now().toString(36)}`;
}

module.exports = { verifyGoogleToken, generateUniqueUsername };
