// backend/src/config/redisConfig.js
const env = require('./environment');

const redisConfig = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};

module.exports = redisConfig;