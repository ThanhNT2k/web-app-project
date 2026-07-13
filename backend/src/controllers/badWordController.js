const db = require('../models');
const BadWord = db.BadWord;
const { loadModerationData } = require('../services/moderationService');

async function getAll(req, res) {
  try {
    // Sequelize dùng findAll() thay vì find()
    const words = await BadWord.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: words });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}

async function create(req, res) {
  try {
    const { keyword, tier } = req.body;
    // Nếu dùng Sequelize:
    const word = await BadWord.create({ keyword, tier });
    
    await loadModerationData();
    // Gửi đúng object, không bọc thêm tầng không cần thiết nếu axios không yêu cầu
    res.status(201).json(word); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi thêm từ khóa' });
  }
}

async function remove(req, res) {
  try {
    // Sequelize dùng destroy() thay vì deleteOne()
    await BadWord.destroy({ where: { id: req.params.id } });
    await loadModerationData();
    res.status(200).json({ success: true, message: 'Đã xóa từ khóa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa từ khóa' });
  }
}

async function update(req, res) {
  try {
    const tier = Number(req.body.tier);
    if (![1, 2, 3].includes(tier)) {
      return res.status(400).json({ success: false, message: 'Cấp độ từ khóa không hợp lệ' });
    }
    const word = await BadWord.update(req.params.id, { tier });
    if (!word) return res.status(404).json({ success: false, message: 'Không tìm thấy từ khóa' });
    await loadModerationData();
    return res.status(200).json({ success: true, data: word });
  } catch (err) {
    console.error('[badWordController.update]', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật từ khóa' });
  }
}

module.exports = { getAll, create, remove, update };
