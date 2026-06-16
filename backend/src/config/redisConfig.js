// backend/src/config/redisConfig.js
const env = require('./environment');

const redisConfig = {
  url: env.REDIS_URL,

  host: env.REDIS_HOST || '127.0.0.1', // Dùng 127.0.0.1 thay cho localhost đôi khi ổn định hơn trên Windows
  port: parseInt(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
};

module.exports = redisConfig;