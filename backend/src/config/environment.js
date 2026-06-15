// Tải biến môi trường từ file .env vào process.env
// Phải gọi trước khi sử dụng bất kỳ process.env nào trong ứng dụng
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Object tập trung tất cả biến môi trường của ứng dụng
// Tránh truy cập trực tiếp process.env rải rác trong codebase để dễ quản lý và kiểm tra
const env = {
  // Xác định môi trường hiện tại: 'development', 'production', hoặc 'test'
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Cổng server lắng nghe - Render.com và các hosting khác tự inject PORT
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // URL công khai của API (dùng để tạo URL placeholder khi Supabase chưa cấu hình)
  API_URL: process.env.API_URL || 'http://localhost:5000',

  // Database
  // DATABASE_URL ưu tiên cao hơn các biến riêng lẻ (Render.com thường inject DATABASE_URL)
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_NAME: process.env.DB_NAME || 'cmc_truyen',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  // JWT - Dùng để ký và xác thực token xác thực người dùng
  // JWT_SECRET phải là chuỗi bí mật phức tạp trong production
  // JWT_EXPIRE: thời gian hết hạn token (7 ngày mặc định)
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // Gemini AI - API key để gọi Google Gemini (dự phòng khi không có Groq)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Groq AI - API key để gọi Groq (ưu tiên dùng vì nhanh hơn Gemini)
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  // Supabase Storage - Dùng để lưu ảnh bìa truyện trên cloud
  // SUPABASE_SERVICE_KEY là service role key (có toàn quyền, không phải anon key)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',

  // Frontend - URL của ứng dụng React (dùng để cấu hình whitelist CORS)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Redis / BullMQ
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // Các helper boolean để kiểm tra môi trường nhanh trong code
  // isDevelopment: true khi chạy local (npm run dev)
  // isProduction: true khi deploy lên server thật
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

module.exports = env;
