const db = require('../config/database');

const MIN_CRYSTAL_PAYOUT = 5000;
const CRYSTAL_TO_VND_RATE = 250; // Example: Uploader gets 250 VNĐ per crystal

async function requestPayout(req, res) {
  try {
    const userId = req.user.id;
    const { crystalAmount, bankName, accountNumber, accountHolder } = req.body;

    if (!crystalAmount || crystalAmount < MIN_CRYSTAL_PAYOUT) {
      return res.status(400).json({ 
        success: false, 
        message: `Số lượng rút tối thiểu là ${MIN_CRYSTAL_PAYOUT} Tinh thạch.` 
      });
    }

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin ngân hàng.' });
    }

    // Check user's crystal_earned balance
    const userResult = await db.query('SELECT crystal_earned FROM users WHERE id = $1', [userId]);
    const balance = userResult.rows[0]?.crystal_earned || 0;

    if (crystalAmount > balance) {
      return res.status(400).json({ success: false, message: 'Số dư tinh thạch kiếm được không đủ.' });
    }

    // Create payout request
    const vndAmount = crystalAmount * CRYSTAL_TO_VND_RATE;
    
    await db.query(
      `INSERT INTO payout_requests (user_id, crystal_amount, vnd_amount, bank_name, account_number, account_holder)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, crystalAmount, vndAmount, bankName, accountNumber, accountHolder]
    );

    return res.status(201).json({
      success: true,
      message: 'Yêu cầu rút tiền đã được gửi. Quản trị viên sẽ xử lý trong thời gian sớm nhất.'
    });
  } catch (error) {
    console.error('[payoutController.requestPayout]', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo yêu cầu rút tiền.' });
  }
}

async function getMyPayouts(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM payout_requests WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('[payoutController.getMyPayouts]', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

async function getAllPayoutsAdmin(req, res) {
  try {
    const result = await db.query(`
      SELECT p.*, u.username, u.email 
      FROM payout_requests p
      JOIN users u ON u.id = p.user_id
      ORDER BY 
        CASE WHEN p.status = 'PENDING' THEN 1 ELSE 2 END,
        p.created_at DESC
    `);
    return res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('[payoutController.getAllPayoutsAdmin]', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

async function processPayoutAdmin(req, res) {
  const client = await db.connect();
  try {
    const { id } = req.params;
    const { action, rejectReason } = req.body; // 'approve' or 'reject'

    await client.query('BEGIN');

    const payoutResult = await client.query('SELECT * FROM payout_requests WHERE id = $1 FOR UPDATE', [id]);
    const payout = payoutResult.rows[0];

    if (!payout) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại.' });
    }

    if (payout.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Yêu cầu này đã được xử lý.' });
    }

    if (action === 'approve') {
      // Deduct from crystal_earned
      const userResult = await client.query('SELECT crystal_earned FROM users WHERE id = $1', [payout.user_id]);
      const currentBalance = userResult.rows[0]?.crystal_earned || 0;

      if (currentBalance < payout.crystal_amount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Người dùng không còn đủ Tinh thạch để duyệt yêu cầu này.' });
      }

      await client.query('UPDATE users SET crystal_earned = crystal_earned - $1 WHERE id = $2', [payout.crystal_amount, payout.user_id]);
      await client.query('UPDATE payout_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['COMPLETED', id]);
      
    } else if (action === 'reject') {
      await client.query('UPDATE payout_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['REJECTED', id]);
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Hành động không hợp lệ.' });
    }

    await client.query('COMMIT');
    return res.json({ success: true, message: action === 'approve' ? 'Đã duyệt yêu cầu rút tiền.' : 'Đã từ chối yêu cầu.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[payoutController.processPayoutAdmin]', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý yêu cầu.' });
  } finally {
    client.release();
  }
}

module.exports = {
  requestPayout,
  getMyPayouts,
  getAllPayoutsAdmin,
  processPayoutAdmin
};
