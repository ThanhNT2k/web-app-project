const { Worker } = require('bullmq');
const redisConfig = require('../config/redisConfig');
const { loadModerationData, moderateContent } = require('../services/moderationService');
const Comment = require('../models/Comment');

const connection = redisConfig.url;

console.log("Worker đang khởi tạo với cấu hình:", connection);

// Đợi dữ liệu từ DB nạp xong xuôi rồi mới khởi động Worker
loadModerationData().then(() => {

    const worker = new Worker('moderationQueue', async job => {
        
        const { content, commentId } = job.data;
        
        const result = moderateContent(content);
        
        try {
            switch (result.tier) {
                case 1:
                    await Comment.update(commentId, {
                        status: 'rejected',
                        is_spam: false
                    });
                    break;
                case 2:
                    await Comment.update(commentId, {
                        status: 'masked'
                    });
                    break;

                case 3:
                    await Comment.update(commentId, {
                        is_spam: true,
                        status: 'flagged'
                    });
                    break;

                default:
                    await Comment.update(commentId, {
                        status: 'approved'
                    });
                    break;
            }
        } catch (err) {
            console.error(`[Moderation] LỖI khi update DB:`, err);
        }
        
    }, { 
        connection: {
        url: connection
        } 
        });

    worker.on('ready', () => console.log("Worker đã kết nối Redis thành công và đang lắng nghe job!"));
    worker.on('error', (err) => console.error("Worker lỗi:", err));
    
}).catch(err => {
    console.error("Không thể khởi động Worker do lỗi tải dữ liệu:", err);
});