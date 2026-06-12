const AhoCorasick = require('aho-corasick');
const BadWord = require('../models/BadWord');

let acAutomaton;

// Load từ khóa từ DB khi server bắt đầu chạy (gọi ở server.js)
async function loadModerationData() {
    const badWords = await BadWord.find({ isWhitelist: false });
    const keywords = badWords.map(bw => bw.keyword);
    acAutomaton = new AhoCorasick(keywords);
}

// Logic kiểm duyệt nội dung
const moderateContent = (text) => {
    // 1. Dùng utils/textUtils để normalize
    // 2. acAutomaton.search(text)
    // 3. Trả về kết quả { isSafe: boolean, tier: number, maskedText: string }
};

module.exports = { loadModerationData, moderateContent };