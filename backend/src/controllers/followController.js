const env = require('../config/environment');
const UserFollow = require('../models/UserFollow');

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
      ...(env.isDevelopment && { detail: err.message }),
    });
  }
}

async function checkFollow(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(200).json({ success: true, following: false });
    }
    const storyId = parseInt(req.params.storyId, 10);
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

async function followStory(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const storyId = parseInt(req.params.storyId, 10);
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

