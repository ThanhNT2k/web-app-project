const env = require('../config/environment');
const UserFollow = require('../models/UserFollow');

/**
 * Lấy danh sách truyện mà user hiện tại đang theo dõi.
 * Dùng để hiển thị ở trang "Truyện theo dõi" hoặc dashboard.
 */
async function getMyFollows(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const stories = await UserFollow.getFollowedStories(req.user.id);
    return res.status(200).json({ success: true, stories });
  } catch (err) {
    console.error('[followController.getMyFollows]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      // Trong môi trường development, thêm chi tiết lỗi để debug
      ...(env.isDevelopment && { detail: err.message }),
    });
  }
}

/**
 * Kiểm tra xem user hiện tại có đang theo dõi truyện không.
 * KHÔNG yêu cầu đăng nhập: trả về following = false cho guest thay vì lỗi 401.
 * Cho phép frontend hiển thị trạng thái nút Follow/Unfollow mà không cần biết user đã đăng nhập chưa.
 */
async function checkFollow(req, res) {
  try {
    // Nếu chưa đăng nhập, trả về false (chưa theo dõi) thay vì từ chối truy cập
    if (!req.user?.id) {
      return res.status(200).json({ success: true, following: false });
    }

    const storyId = parseInt(req.params.storyId, 10);
    // Validate storyId hợp lệ, trả về false thay vì lỗi nếu ID không hợp lệ
    if (!storyId || Number.isNaN(storyId)) {
      return res.status(200).json({ success: true, following: false });
    }

    const following = await UserFollow.isFollowing(req.user.id, storyId);
    return res.status(200).json({ success: true, following });
  } catch (err) {
    console.error('[followController.checkFollow]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(env.isDevelopment && { detail: err.message }),
    });
  }
}

/**
 * Theo dõi một truyện.
 * Model sử dụng ON CONFLICT DO NOTHING nên an toàn khi follow trùng (idempotent).
 */
async function followStory(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const storyId = parseInt(req.params.storyId, 10);
    // Validate storyId trước khi insert vào database
    if (!storyId || Number.isNaN(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    await UserFollow.follow(req.user.id, storyId);
    return res.status(200).json({ success: true, message: 'Đã theo dõi truyện' });
  } catch (err) {
    console.error('[followController.followStory]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(env.isDevelopment && { detail: err.message }),
    });
  }
}

/**
 * Bỏ theo dõi một truyện.
 * Thực hiện DELETE từ bảng user_follows.
 * Idempotent: gọi nhiều lần cũng không gây lỗi nếu đã bỏ theo dõi trước đó.
 */
async function unfollowStory(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const storyId = parseInt(req.params.storyId, 10);
    if (!storyId || Number.isNaN(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid story ID' });
    }

    await UserFollow.unfollow(req.user.id, storyId);
    return res.status(200).json({ success: true, message: 'Đã bỏ theo dõi' });
  } catch (err) {
    console.error('[followController.unfollowStory]', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(env.isDevelopment && { detail: err.message }),
    });
  }
}

module.exports = {
  getMyFollows,
  checkFollow,
  followStory,
  unfollowStory,
};
