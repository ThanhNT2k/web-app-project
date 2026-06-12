const { Worker } = require('bullmq');
const redisConfig = require('../config/redisConfig');
const { moderateContent } = require('../services/moderationService');
const Comment = require('../models/Comment'); // Chú ý: không cần ngoặc nhọn nếu export default/module.exports

const worker = new Worker('moderationQueue', async job => {
    // 1. Lấy dữ liệu từ job (đảm bảo đồng bộ với tên key trong Controller)
    const { content, commentId } = job.data;
    
    // 2. Gọi service kiểm duyệt
    // Giả sử result trả về: { isSafe: boolean, tier: number, maskedContent: string }
    const result = moderateContent(content);
    
    if (!result.isSafe) {
        // Tier 1: Cấm tuyệt đối -> Xóa bình luận
        if (result.tier === 1) {
            await Comment.remove(commentId);
            console.log(`[Moderation] Comment ${commentId} removed (Tier 1).`);
        } 
        
        // Tier 2: Nhạy cảm -> Che mờ (masking)
        else if (result.tier === 2) {
            await Comment.update(commentId, { content: result.maskedContent });
            console.log(`[Moderation] Comment ${commentId} masked (Tier 2).`);
        }
        
        // Tier 3: Spam -> Gắn thẻ (cần thêm cột 'isSpam' hoặc 'status' trong DB)
        else if (result.tier === 3) {
            await Comment.update(commentId, { isSpam: true });
            console.log(`[Moderation] Comment ${commentId} flagged as spam (Tier 3).`);
        }
    }
}, { connection: redisConfig });
