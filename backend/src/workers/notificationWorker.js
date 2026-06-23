const { Worker } = require('bullmq');
const redisConfig = require('../config/redisConfig');
const notificationService = require('../services/notificationService');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');

const connection = redisConfig.url;

console.log('[Notification Worker] Initializing with Redis config:', connection);

// Khởi tạo worker để xử lý job từ notification queue
const worker = new Worker(
  'notificationQueue',
  async (job) => {
    const { type, data } = job.data;

    try {
      switch (type) {
        case 'new_chapter': {
          // data: { chapterId, chapterId, storyId, title, chapter_number, storyTitle, storySlug }
          const { storyId, storyTitle, storySlug, chapterId, chapter_number, title } = data;

          const message = `Chương ${chapter_number}${title ? ` - ${title}` : ''} của "${storyTitle}" vừa được đăng tải`;
          const link = `/story/${storySlug}/chapter/${chapter_number}`;

          // Lấy danh sách followers
          const followers = await notificationService.getFollowersOfStory(storyId);

          if (followers.length > 0) {
            // Lọc theo cài đặt thông báo
            const enabledUsers = await notificationService.filterUsersByNotificationPreferences(followers);

            // Tạo thông báo trong database
            if (enabledUsers.length > 0) {
              await Notification.createBatch(
                enabledUsers,
                storyId,
                chapterId,
                message,
                link
              );

              console.log(
                `[Notification Worker] Sent notifications for new chapter: story_id=${storyId}, notified_users=${enabledUsers.length}`
              );
            }
          }

          break;
        }

        case 'system': {
          // data: { message, link, userIds }
          const { message, link, userIds } = data;

          let targetUsers = userIds;
          if (!userIds || !userIds.length) {
            // Gửi cho tất cả active users
            const result = await require('../config/database').query(
              'SELECT id FROM users WHERE is_active = true'
            );
            targetUsers = result.rows.map((row) => row.id);
          }

          if (targetUsers.length > 0) {
            await Notification.createBatch(targetUsers, 0, null, message, link || null);
            console.log(
              `[Notification Worker] Sent system notifications to ${targetUsers.length} users`
            );
          }

          break;
        }

        default:
          console.warn(`[Notification Worker] Unknown notification type: ${type}`);
      }

      return { success: true, type, processed_at: new Date() };
    } catch (error) {
      console.error(
        `[Notification Worker] Error processing ${type} notification:`,
        error
      );
      throw error;
    }
  },
  {
    connection: {
      url: connection,
    },
  }
);

worker.on('ready', () => {
  console.log('[Notification Worker] Connected to Redis and listening for jobs');
});

worker.on('failed', (job, err) => {
  console.error(
    `[Notification Worker] Job ${job.id} failed with error:`,
    err.message
  );
});

worker.on('completed', (job) => {
  console.log(`[Notification Worker] Job ${job.id} completed successfully`);
});

console.log('[Notification Worker] Started and waiting for jobs');
