const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Joi: Thư viện validate dữ liệu đầu vào theo schema được định nghĩa trước
const Joi = require('joi');

const env = require('../config/environment');
const { User } = require('../models');
const { verifyGoogleToken, generateUniqueUsername } = require('../services/googleAuthService');
const { generateAndStoreOtp, verifyOtp: checkOtp, isVerified, clearOtpKeys } = require('../services/otpService');
const { sendOtpEmail } = require('../services/emailService');

// Schema validate dữ liệu đăng ký tài khoản
// - username: bắt đầu bằng chữ cái, 3-100 ký tự, bắt buộc, không chứa ký tự đặc biệt ngoài _ và -
// - email: định dạng email hợp lệ, bắt buộc
// - password: tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
// - full_name: bắt buộc
const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const passwordPatternMessage = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt.';

const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(100)
    .pattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/)
    .required()
    .messages({
      'string.pattern.base': 'Tên đăng nhập phải bắt đầu bằng chữ cái và chỉ chứa chữ cái không dấu, chữ số, dấu gạch dưới (_) và gạch ngang (-).',
      'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự.',
      'string.max': 'Tên đăng nhập không được vượt quá 100 ký tự.',
      'any.required': 'Tên đăng nhập là bắt buộc.',
    }),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': passwordPatternMessage }),
  full_name: Joi.string().trim().min(1).max(255).required(),
});

// Schema validate dữ liệu đăng nhập (đơn giản hơn register)
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

/**
 * Tạo JWT token từ thông tin user.
 * Token này được gửi về client và dùng để xác thực các request tiếp theo.
 * Payload chứa các thông tin cần thiết để không phải query DB mỗi request.
 *
 * @param {object} user - Object user từ database
 * @returns {string} JWT token đã được ký
 */
function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    env.JWT_SECRET,    // Secret key để ký token
    { expiresIn: env.JWT_EXPIRE } // Thời gian hết hạn (mặc định 7 ngày)
  );
}

/**
 * Loại bỏ trường password khỏi object user trước khi trả về client.
 * Bảo mật: KHÔNG BAO GIỜ trả về hash password về phía client,
 * kể cả đã được hash bằng bcrypt.
 *
 * @param {object} user - Object user từ database (có thể chứa password)
 * @returns {object|null} User object không có trường password
 */
function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  // Keep the payload stable for frontend usage and remove password hashes.
  // Dùng destructuring để loại bỏ password khỏi object, giữ lại tất cả các trường còn lại
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Controller xử lý đăng ký tài khoản mới.
 * Luồng: Validate → Kiểm tra email trùng → Hash password → Tạo user → Cấp token
 */
async function register(req, res, next) {
  try {
    // Bước 1: Validate dữ liệu đầu vào theo schema
    // abortEarly: false => thu thập TẤT CẢ lỗi validation thay vì dừng ở lỗi đầu tiên
    // stripUnknown: true => loại bỏ các field không được khai báo trong schema (bảo mật)
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { username, email, password, full_name } = value;
    const lowerUsername = username.toLowerCase();

    // Kiểm tra username đã tồn tại trong hệ thống chưa (Case-insensitive check)
    const existingUsername = await User.findByUsername(lowerUsername);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username đã tồn tại. Vui lòng chọn tên khác.',
      });
    }

    // Bước 2: Kiểm tra email đã tồn tại trong hệ thống chưa
    // Tránh tạo tài khoản trùng email, trả về 409 Conflict
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Bước 3: Hash password với bcrypt sử dụng salt rounds = 10
    // Salt rounds = 10 là cân bằng tốt giữa bảo mật và hiệu suất
    // (mỗi tăng 1 salt round, thời gian hash tăng gấp đôi)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Bước 4: Tạo user mới trong database với password đã hash
    // Role mặc định là 'User'; chỉ Admin mới có thể nâng role
    const createdUser = await User.createUser({
      username: lowerUsername,
      email,
      password: hashedPassword,
      fullName: full_name,
      role: 'User',
    });

    // Bước 5: Tạo JWT token và trả về cùng thông tin user đã sanitize
    const token = createToken(createdUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitizeUser(createdUser),
    });
  } catch (err) {
    console.error('[authController.register]', err);
    next(err);
  }
}

/**
 * Controller xử lý đăng nhập.
 * Luồng: Validate → Tìm user theo email → So sánh password → Cấp token
 */
async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { email, password } = value;

    // Bước 1: Tìm user theo email trong database
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa bởi Admin.',
      });
    }

    // Bước 2: So sánh password nhập vào với hash trong database dùng bcrypt.compare
    // bcrypt.compare tự xử lý salt, không cần tách thủ công
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Bước 3: Tạo JWT token và trả về
    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('[authController.login]', err);
    next(err);
  }
}

/**
 * Controller xử lý đăng xuất.
 * JWT là stateless nên không cần xóa session phía server.
 * Client tự xóa token khỏi localStorage/cookies.
 * Endpoint này chỉ trả về thông báo thành công để frontend biết đã logout.
 */
function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * Controller lấy thông tin user hiện tại từ JWT đã xác thực.
 * Dùng để frontend kiểm tra trạng thái đăng nhập khi load lại trang.
 * Ưu tiên lấy dữ liệu mới nhất từ DB (để có thông tin cập nhật như avatar, bio mới)
 * thay vì dùng payload JWT có thể đã cũ.
 */
async function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  // Nếu payload JWT có id, query DB để lấy thông tin user mới nhất
  // Tránh trường hợp user đổi avatar/bio sau khi token được tạo mà payload không cập nhật
  const currentUser = req.user.id ? await User.findById(req.user.id) : req.user;

  if (!currentUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Kiểm tra tài khoản có bị khóa không
  if (currentUser.is_active === false) {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản của bạn đã bị khóa bởi Admin.',
    });
  }

  return res.status(200).json({
    success: true,
    user: sanitizeUser(currentUser),
  });
}

// Schema validate dữ liệu cập nhật profile
// Tất cả các trường đều optional, cho phép cập nhật từng phần (partial update)
const updateProfileSchema = Joi.object({
  full_name: Joi.string().trim().max(255).allow('', null).optional(),
  avatar_url: Joi.string().trim().max(500).allow('', null).optional(),
  bio: Joi.string().trim().max(1000).allow('', null).optional(),
});

/**
 * Controller cập nhật thông tin profile của user đang đăng nhập.
 * Chỉ cập nhật các trường: full_name, avatar_url, bio.
 * Không cho phép đổi email hay role thông qua endpoint này.
 */
async function updateProfile(req, res) {
  // Kiểm tra xác thực: req.user phải tồn tại và có id (được set bởi authenticateToken middleware)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  try {
    // Gọi model để cập nhật profile, chỉ cập nhật các trường được gửi lên (COALESCE trong SQL)
    const updatedUser = await User.updateProfile(req.user.id, value);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error('[authController.updateProfile]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Schema validate đổi mật khẩu từ Profile
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({ 'any.required': 'Vui lòng nhập mật khẩu cũ.' }),
  newPassword: Joi.string().min(8).pattern(passwordPattern).required()
    .messages({ 'string.pattern.base': passwordPatternMessage }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'Xác nhập mật khẩu không khớp.' }),
});

/**
 * Google OAuth: đăng nhập hoặc bắt đầu đăng ký bằng Google.
 * POST /auth/google
 *
 * Luồng:
 * 1. Verify Google ID Token bằng google-auth-library
 * 2. Tìm user theo google_id → có: đăng nhập ngay
 * 3. Tìm user theo email → có (tài khoản local cũ): link google_id, đăng nhập
 * 4. Không có: trả về isNewUser=true + tempToken + suggestedData để FE hiển thị form đặt mật khẩu
 */
async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required.' });
    }

    const googleData = await verifyGoogleToken(idToken);
    const { googleId, email, name, picture } = googleData;

    // TH1: Đã có tài khoản link với google_id này → đăng nhập luôn
    const existingByGoogleId = await User.findByGoogleId(googleId);
    if (existingByGoogleId) {
      if (existingByGoogleId.is_active === false) {
        return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa bởi Admin.' });
      }
      const token = createToken(existingByGoogleId);
      return res.status(200).json({ success: true, token, user: sanitizeUser(existingByGoogleId) });
    }

    // TH2: Email đã có trong DB (tài khoản local) → tự động link google_id vào
    const existingByEmail = await User.findByEmail(email);
    if (existingByEmail) {
      if (existingByEmail.is_active === false) {
        return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa bởi Admin.' });
      }
      const linked = await User.linkGoogleId(existingByEmail.id, googleId);
      const token = createToken(linked);
      return res.status(200).json({ success: true, token, user: sanitizeUser(linked) });
    }

    // TH3: Chưa có tài khoản → cần đăng ký — FE sẽ hiển thị form đặt mật khẩu
    // tempToken: JWT ngắn hạn 10 phút chứa googleId → bước /google/complete dùng để xác thực
    const tempToken = jwt.sign(
      { googleId, email, name, picture, type: 'google_register' },
      env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      success: true,
      isNewUser: true,
      tempToken,
      suggestedData: { email, full_name: name, avatar_url: picture },
    });
  } catch (err) {
    console.error('[authController.googleAuth]', err);
    if (err.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Google token không hợp lệ.' });
    }
    next(err);
  }
}

/**
 * Hoàn tất đăng ký Google: đặt mật khẩu và tạo tài khoản.
 * POST /auth/google/complete
 */
async function googleRegisterComplete(req, res, next) {
  try {
    const { tempToken, password, confirmPassword } = req.body;

    if (!tempToken || !password) {
      return res.status(400).json({ success: false, message: 'thiếu thông tin.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Xác nhập mật khẩu không khớp.' });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({ success: false, message: passwordPatternMessage });
    }

    // Verify tempToken — lấy thông tin Google từ token ngắn hạn
    let payload;
    try {
      payload = jwt.verify(tempToken, env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Phương thức xác thực đã hết hiệu lực, vui lòng thử lại.' });
    }

    if (payload.type !== 'google_register') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }

    const { googleId, email, name, picture } = payload;

    // Kiểm tra email chưa bị ai đăng ký trong thời gian chờ (race condition)
    const doubleCheck = await User.findByEmail(email);
    if (doubleCheck) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const username = await generateUniqueUsername(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.createGoogleUser({
      googleId,
      email,
      password: hashedPassword,
      fullName: name,
      avatarUrl: picture,
      username,
    });

    const token = createToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Tài khoản đã được tạo thành công.',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error('[authController.googleRegisterComplete]', err);
    next(err);
  }
}

/**
 * Quên mật khẩu: gửi OTP về email.
 * POST /auth/forgot-password
 *
 * Bảo mật: luôn trả về cùng một message dù email có tồn tại hay không
 * → tránh email enumeration attack (kẻ tấn công dò xem email nào đã đăng ký)
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Tìm user (nếu không có thì vẫn trả về success — không lộ thông tin)
    const user = await User.findByEmail(normalizedEmail);
    if (user && user.is_active !== false) {
      const otp = await generateAndStoreOtp(normalizedEmail);
      try {
        await sendOtpEmail(normalizedEmail, otp);
      } catch (mailErr) {
        console.error('[forgotPassword] Gửi email thất bại:', mailErr);
        // Không throw — tránh lộ thông tin, log để debug
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư.',
    });
  } catch (err) {
    console.error('[authController.forgotPassword]', err);
    next(err);
  }
}

/**
 * Xác thực OTP được gửi về email.
 * POST /auth/verify-otp
 */
async function verifyOtpHandler(req, res, next) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email và mã OTP là bắt buộc.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const valid = await checkOtp(normalizedEmail, String(otp).trim());

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hiệu lực. Vui lòng thử lại.' });
    }

    return res.status(200).json({ success: true, message: 'Xác thực OTP thành công.' });
  } catch (err) {
    console.error('[authController.verifyOtpHandler]', err);
    next(err);
  }
}

/**
 * Đặt mật khẩu mới sau khi đã verify OTP.
 * POST /auth/reset-password
 */
async function resetPassword(req, res, next) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Xác nhập mật khẩu không khớp.' });
    }

    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({ success: false, message: passwordPatternMessage });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra OTP đã được verify chưa
    const verified = await isVerified(normalizedEmail);
    if (!verified) {
      return res.status(403).json({
        success: false,
        message: 'Chưa xác thực OTP hoặc phiên đã hết hiệu lực. Vui lòng bắt đầu lại.',
      });
    }

    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashedPassword);
    await clearOtpKeys(normalizedEmail); // Dọn sạch tất cả OTP key

    return res.status(200).json({ success: true, message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    console.error('[authController.resetPassword]', err);
    next(err);
  }
}

/**
 * Đổi mật khẩu từ trang Profile (yêu cầu đăng nhập).
 * PUT /auth/change-password
 *
 * Yêu cầu nhập mật khẩu cũ để xác thực trước khi cho phép đổi.
 */
async function changePassword(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
    }

    const { oldPassword, newPassword } = value;

    // Lấy user với password hash từ DB
    const user = await User.findByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    // So sánh mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác.' });
    }

    // Không cho đổi sang mật khẩu giống cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashedPassword);

    return res.status(200).json({ success: true, message: 'Mật khẩu đã được cập nhật thành công.' });
  } catch (err) {
    console.error('[authController.changePassword]', err);
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  googleAuth,
  googleRegisterComplete,
  forgotPassword,
  verifyOtpHandler,
  resetPassword,
  changePassword,
};