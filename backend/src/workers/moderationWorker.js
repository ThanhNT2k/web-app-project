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
            // Always persist the detected tier into comments.rating (int4)
            const data = { rating: result.tier };
            switch (result.tier) {
                case 1:
                    data.status = 'rejected';
                    data.is_spam = false;
                    break;
                case 2:
                    data.status = 'masked';
                    break;
                case 3:
                    data.status = 'flagged';
                    data.is_spam = true;
                    break;
                default:
                    data.status = 'approved';
                    break;
            }

            await Comment.update(commentId, data);
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