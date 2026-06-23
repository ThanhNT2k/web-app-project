const rankingService = require('../services/rankingService');

async function getRankings(req, res) {
  try {
    const payload = await rankingService.getRankings({
      type: req.query.type,
      period: req.query.period,
      limit: req.query.limit,
      forceRefresh: req.query.refresh === 'true',
    });

    return res.status(200).json({
      success: true,
      ...payload,
    });
  } catch (error) {
    console.error('[rankingController.getRankings]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = {
  getRankings,
};
