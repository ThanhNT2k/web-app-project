const { Worker } = require('bullmq');
const { moderateContent } = require('../services/moderationService');

const worker = new Worker('moderationQueue', async job => {
    const { content, storyId } = job.data;
    const result = moderateContent(content);
    
    // Nếu Tier 1/2 thì cập nhật trực tiếp vào DB của Story/Comment
    if (!result.isSafe) {
        // Cập nhật Database dựa trên Tier
    }
}, { connection: { host: 'localhost', port: 6379 } });