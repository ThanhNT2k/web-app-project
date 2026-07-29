const Wallet = require('../models/Wallet');

async function getWallet(req, res) {
  try {
    const wallet = await Wallet.getWallet(req.user.id, req.query.page, req.query.limit);
    return res.status(200).json({ success: true, ...wallet });
  } catch (error) {
    console.error('[walletController.getWallet]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { getWallet };
