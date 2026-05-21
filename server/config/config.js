// server/config/config.js
// Cấu hình chung cho backend

module.exports = {
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/webapp',
  port: process.env.PORT || 3000,
};
