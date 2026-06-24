// backend/src/config/redisConfig.js
// Cấu hình kết nối Redis dùng chung cho BullMQ (Queue/Worker) và ioredis trực tiếp.
// BullMQ truyền connection options thẳng vào ioredis, nhưng ioredis KHÔNG hỗ trợ
// property "url" trong options object. Cần parse URL thành host/port/password.
const env = require('./environment');

function parseRedisUrl(url) {
  if (!url) return {};
  try {
    const parsed = new URL(url);
    const opts = {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 6379,
    };
    if (parsed.password) opts.password = decodeURIComponent(parsed.password);
    if (parsed.username && parsed.username !== 'default') opts.username = parsed.username;
    // rediss:// = TLS (ví dụ Upstash, Aiven)
    if (parsed.protocol === 'rediss:') opts.tls = {};
    return opts;
  } catch {
    return {};
  }
}

const redisConfig = {
  // Giữ url gốc cho các consumer dùng trực tiếp: new Redis(redisConfig.url)
  url: env.REDIS_URL,
  // Parse ra host/port/password để BullMQ Queue/Worker dùng được
  ...parseRedisUrl(env.REDIS_URL),
  maxRetriesPerRequest: null,
};

module.exports = redisConfig;