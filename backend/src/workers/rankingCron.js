const env = require('../config/environment');
const rankingService = require('../services/rankingService');

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
let started = false;

function startRankingCron() {
  if (started || env.NODE_ENV === 'test') return;
  started = true;

  const runRefresh = async () => {
    try {
      await rankingService.refreshAllRankingCaches();
      console.log('[rankingCron] Rankings cache refreshed');
    } catch (error) {
      console.error('[rankingCron] Refresh failed:', error.message);
    }
  };

  runRefresh();
  setInterval(runRefresh, REFRESH_INTERVAL_MS);
}

module.exports = {
  startRankingCron,
};
