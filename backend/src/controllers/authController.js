const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Joi: Thư viện validate dữ liệu đầu vào theo schema được định nghĩa trước
const Joi = require('joi');

const env = require('../config/environment');
const { User } = require('../models');

// Schema validate dữ liệu đăng ký tài khoản
// - username: 3-100 ký tự, bắt buộc
// - email: định dạng email hợp lệ, bắt buộc
// - password: tối thiểu 8 ký tự, bắt buộc (để đảm bảo bảo mật tối thiểu)
// - full_name: tùy chọn, cho phép chuỗi rỗng
const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().trim().max(255).allow('', null),
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
async function register(req, res) {
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
    username,
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
}

/**
 * Controller xử lý đăng nhập.
 * Luồng: Validate → Tìm user theo email → So sánh password → Cấp token
 */
async function login(req, res) {
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

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
};