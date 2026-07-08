const BadWord = require('../models/BadWord');

let badWordsData = []; // Lưu danh sách {keyword, tier}
let isLoaded = false;

async function loadModerationData() {
    try {
        console.log("[Moderation] Đang tải dữ liệu từ database...");
        const badWords = await BadWord.findAll({ where: { isWhitelist: false } });

        badWordsData = badWords.map(bw => ({
            keyword: bw.keyword.trim().toLowerCase(),
            tier: bw.tier || 1
        }));
        
        isLoaded = true;
        console.log(`[Moderation] Đã nạp ${badWordsData.length} từ khóa.`);
    } catch (error) {
        console.error("Lỗi:", error);
        isLoaded = true;
    }
}

const moderateContent = (text) => {
    if (!isLoaded) return { isSafe: true, tier: 0, maskedContent: text };

    const lowerText = text.toLowerCase();
    let maxTier = 0;
    let maskedContent = text;

    // Duyệt qua danh sách để tìm từ khóa
    badWordsData.forEach(bw => {
        if (lowerText.includes(bw.keyword)) {
            if (bw.tier > maxTier) maxTier = bw.tier;

            // Nếu tier >= 2, tiến hành che mờ
            if (bw.tier >= 2) {
                const reg = new RegExp(bw.keyword, 'gi');
                maskedContent = maskedContent.replace(reg, '*'.repeat(bw.keyword.length));
            }
        }
    });

    return { 
        isSafe: maxTier === 0, 
        tier: maxTier, 
        maskedContent: maskedContent 
    };
};

loadModerationData();

module.exports = { loadModerationData, moderateContent };
