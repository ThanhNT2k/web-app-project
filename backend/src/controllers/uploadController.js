const env = require('../config/environment');

function uploadCover(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
    }

    const baseUrl = env.API_URL.replace(/\/$/, '');
    const url = `${baseUrl}/uploads/covers/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      url,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error('[uploadController.uploadCover]', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
}

module.exports = {
  uploadCover,
};
