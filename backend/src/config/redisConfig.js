// backend/src/config/redisConfig.js
const env = require('./environment');

const redisConfig = {
  host: env.REDIS_HOST || 'localhost',
  port: env.REDIS_PORT || 6379,
  // Thêm password nếu bạn có cấu hình trong file .env
  // password: env.REDIS_PASSWORD 
};

module.exports = redisConfig;