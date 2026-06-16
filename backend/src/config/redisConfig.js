// backend/src/config/redisConfig.js
const env = require('./environment');

const redisConfig = {
  url: env.REDIS_URL,
};

module.exports = redisConfig;