const { Worker } = require('bullmq');
const redisConfig = require('../config/redisConfig');
const { loadModerationData, moderateContent } = require('../services/moderationService');
const Comment = require('../models/Comment');

const connection = {
    host: redisConfig.host,
    port: redisConfig.port
};

loadModerationData().then(() => {
    const worker = new Worker('moderationQueue', async job => {
        const { content, commentId } = job.data;
        
        // 1. Kiểm duyệt: Với "dmm", moderateContent trả về tier: 2
        const result = moderateContent(content);
        
        // 2. Định nghĩa status dựa trên tier
        // T1 -> rejected, T2 -> masked, T3 -> flagged
        const statusMap = {
            1: 'rejected',
            2: 'masked',
            3: 'flagged'
        };
        
        // Nếu tier là 0 (sạch), giữ là 'approved', nếu khác thì lấy từ map
        const newStatus = statusMap[result.tier] || 'approved';

        try {
            // 3. Cập nhật vào DB
            await Comment.update(commentId, {
                status: newStatus,
                is_spam: result.tier === 3
            });
            console.log(`[Worker] Comment ${commentId} đã cập nhật status: ${newStatus} (Tier: ${result.tier})`);
        } catch (err) {
            console.error(`[Worker] Lỗi update DB comment ${commentId}:`, err);
            throw err;
        }
    }, { connection });

    worker.on('ready', () => console.log("Worker đã kết nối Redis!"));
}).catch(err => console.error("Lỗi khởi động Worker:", err));