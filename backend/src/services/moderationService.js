const AhoCorasick = require('aho-corasick');
// Import BadWord từ file model của bạn
const BadWord = require('../models/BadWord'); 

let acAutomaton;

async function loadModerationData() {
    try {
        // Vì bạn dùng SQL/Sequelize, không có hàm .find() với điều kiện object kiểu này.
        // Nếu bạn dùng Sequelize:
        const badWords = await BadWord.findAll({
            where: { isWhitelist: false } 
        });

        // Nếu bạn dùng SQL thuần (pool.query):
        // const { rows: badWords } = await pool.query('SELECT * FROM bad_words WHERE "isWhitelist" = false');

        const keywords = badWords.map(bw => bw.keyword);
        acAutomaton = new AhoCorasick(keywords);
        
        console.log("[Moderation] Loaded", keywords.length, "bad words.");
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu kiểm duyệt:", error);
        // Tránh làm crash server nếu không tải được, acAutomaton sẽ bị undefined
        // hoặc bạn có thể khởi tạo rỗng:
        acAutomaton = new AhoCorasick([]); 
    }
}


// Logic kiểm duyệt nội dung
const moderateContent = (text) => {
    // 1. Dùng utils/textUtils để normalize
    // 2. acAutomaton.search(text)
    // 3. Trả về kết quả { isSafe: boolean, tier: number, maskedText: string }
};

module.exports = { loadModerationData, moderateContent };