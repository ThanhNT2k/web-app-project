const app = require('./app');
const env = require('./config/environment');

const server = app.listen(env.PORT, () => {
  console.log(`[Server] CMC Truyen backend listening on ${env.API_URL}`);
});

process.on('unhandledRejection', (error) => {
  console.error('[Server] Unhandled promise rejection:', error);
});

module.exports = server;