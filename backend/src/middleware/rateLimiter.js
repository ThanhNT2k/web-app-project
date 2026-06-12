const { rateLimit } = require('express-rate-limit');

const reportRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: "Bạn đã báo cáo quá nhiều lần." },
    validate: { trustProxy: false }
});

module.exports = { reportRateLimiter };