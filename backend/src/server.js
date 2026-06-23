require('dotenv').config();
require('./workers/moderationWorker');
require('./workers/notificationWorker');
const { startRankingCron } = require('./workers/rankingCron');

// Nhập vào ứng dụng Express đã được cấu hình đầy đủ từ app.js
const app = require('./app');

// Nhập cấu hình môi trường (PORT, API_URL, ...) từ environment.js
const env = require('./config/environment');

// Khởi động HTTP server và lắng nghe trên cổng được định nghĩa trong file .env
// env.PORT thường là 5000 (development) hoặc do Render/Heroku cung cấp khi deploy
const server = app.listen(env.PORT, () => {
  console.log(`[Server] CMC Truyen backend listening on ${env.API_URL}`);
  startRankingCron();
});

// Bắt các lỗi Promise không được xử lý (unhandled rejection) ở cấp độ process
// Tránh để lỗi bất đồng bộ làm crash toàn bộ server mà không để lại log rõ ràng
process.on('unhandledRejection', (error) => {
  console.error('[Server] Unhandled promise rejection:', error);
});

module.exports = server;