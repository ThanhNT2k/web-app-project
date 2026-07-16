const crypto = require('crypto');

const axios = require('axios');

const env = require('../config/environment');

// Hạn thời gian tối đa cho một yêu cầu gọi API đến AI (Groq hoặc Gemini)
// Nếu quá 30 giây mà không phản hồi, kết nối sẽ bị hủy để tránh treo luồng xử lý
const REQUEST_TIMEOUT_MS = 30000;

// Sử dụng Map làm bộ nhớ cache tạm thời trong RAM (In-memory cache)
// Giúp tránh việc gọi API trùng lặp cho cùng một nội dung, tiết kiệm chi phí và tăng tốc độ phản hồi
const memoryCache = new Map();

/**
 * Tạo key cho cache dựa trên tiền tố (prefix) và mã băm SHA-256 của giá trị đầu vào
 * @param {string} prefix - Loại thực thể cần lưu (ví dụ: 'chapter', 'story', 'recs')
 * @param {string|object} value - Dữ liệu dùng làm khóa định danh nội dung
 * @returns {string} Key cache dạng chuỗi ngắn gọn đã được băm để tối ưu bộ nhớ
 */
function cacheKey(prefix, value) {
  const hash = crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
  return `${prefix}:${hash}`;
}

/**
 * Lấy dữ liệu từ bộ nhớ cache tạm trong RAM
 * @param {string} key - Cache key được tạo từ hàm cacheKey
 * @returns {any|null} Trả về dữ liệu nếu còn hạn, hoặc null nếu không tồn tại hoặc đã hết hạn (expired)
 */
function getFromMemoryCache(key) {
  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }
  // Kiểm tra thời gian hết hạn của cache entry để giải phóng bộ nhớ nếu cần thiết
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Lưu dữ liệu vào bộ nhớ cache tạm trong RAM với thời gian hết hạn (TTL) mặc định là 1 giờ
 * @param {string} key - Cache key định danh duy nhất
 * @param {any} value - Nội dung dữ liệu cần lưu trữ
 * @param {number} ttlMs - Thời gian sống của cache tính bằng mili-giây (Mặc định: 1 tiếng)
 */
function setMemoryCache(key, value, ttlMs = 1000 * 60 * 60) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Hàm chung thực hiện gọi AI API theo thứ tự ưu tiên: Groq API trước, nếu thất bại hoặc không cấu hình thì chuyển sang Gemini API
 * @param {string} prompt - Câu lệnh chỉ thị gửi tới mô hình AI
 * @returns {Promise<string>} Kết quả tóm tắt hoặc gợi ý dạng văn bản từ AI
 */
async function callAI(prompt) {
  // 1. Ưu tiên sử dụng Groq API nếu cấu hình GROQ_API_KEY hợp lệ trong môi trường
  if (env.GROQ_API_KEY && env.GROQ_API_KEY !== 'your_groq_api_key_here') {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant', // Sử dụng model Llama 3.1 8B tốc độ cao của Groq
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Thiết lập temperature thấp (0.3) để kết quả trả về mang tính chính xác và nhất quán hơn
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
      }
    );
    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Groq API returned an empty response');
    }
    return text.trim();
  }

  // 2. Dự phòng (Fallback) sang Gemini API nếu không có khóa Groq nhưng có khóa Gemini
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    const GEMINI_MODEL = 'gemini-1.5-flash'; // Sử dụng mô hình gemini-1.5-flash tối ưu chi phí và tốc độ
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        params: { key: env.GEMINI_API_KEY },
        timeout: REQUEST_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API returned an empty response');
    }
    return text.trim();
  }

  // Nếu cả hai khóa API đều không được cấu hình, ném ra lỗi để xử lý fallback thủ công ở luồng ngoài
  throw new Error('No AI API key (Groq or Gemini) is configured');
}

/**
 * Trình tạo tóm tắt chương dự phòng khi không thể kết nối tới AI (API lỗi hoặc chưa cấu hình)
 * @param {string} chapterContent - Nội dung gốc của chương
 * @returns {string} Chuỗi tóm tắt mẫu trích xuất từ 200 ký tự đầu của chương truyện
 */
function fallbackChapterSummary(chapterContent) {
  const excerpt = String(chapterContent || '').slice(0, 200).trim();
  return [
    'Đây là bản tóm tắt mẫu (chưa kết nối AI API hoặc API key chưa được cấu hình).',
    excerpt
      ? `Nội dung chương bắt đầu với: "${excerpt}${chapterContent.length > 200 ? '...' : ''}"`
      : 'Chương này chưa có nội dung để tóm tắt chi tiết.',
    'Hãy cấu hình GROQ_API_KEY hoặc GEMINI_API_KEY vào file .env để kích hoạt AI.',
  ].join('\n\n');
}

/**
 * Thực hiện tóm tắt tự động nội dung một chương truyện bằng AI
 * @param {string} chapterContent - Toàn bộ nội dung chữ của chương truyện
 * @returns {Promise<string>} Nội dung tóm tắt chương dài 2-3 đoạn văn bằng tiếng Việt
 */
async function generateChapterSummary(chapterContent) {
  const contentStr = String(chapterContent || '').trim();
  
  // Kiểm tra điều kiện: Nếu chương quá ngắn (dưới 400 ký tự), không cần gọi AI nhằm tiết kiệm tài nguyên
  if (contentStr.length < 400) {
    return 'Chương truyện quá ngắn để có thể tạo tóm tắt tự động.';
  }

  // Tra cứu trong cache để trả về kết quả nhanh nếu chương này đã từng được tóm tắt trước đó
  const key = cacheKey('chapter', contentStr);
  const cached = getFromMemoryCache(key);
  if (cached) {
    return cached;
  }

  // Xây dựng prompt định hướng cách hành văn, ngôn ngữ và cấu trúc của bản tóm tắt
  const prompt = `Bạn là trợ lý đọc truyện. Hãy viết tóm tắt 2-3 đoạn văn bằng tiếng Việt cho chương truyện sau. Tập trung vào diễn biến chính, nhân vật và kết quả của chương. Không thêm tiêu đề hay gạch đầu dòng.\n\nNội dung chương:\n${contentStr}`;

  try {
    const summary = await callAI(prompt);
    // Lưu kết quả thành công vào cache vĩnh viễn (mặc định 1 giờ) để tái sử dụng
    setMemoryCache(key, summary);
    return summary;
  } catch (error) {
    // Khi gọi AI thất bại (do API Key sai, mạng lỗi...), ghi log lỗi và tạo nội dung tóm tắt dự phòng (fallback)
    console.error('[aiService.generateChapterSummary]', error.message);
    const summary = fallbackChapterSummary(contentStr);
    // Lưu kết quả dự phòng vào cache trong thời gian ngắn hơn (5 phút) để thử lại sớm hơn
    setMemoryCache(key, summary, 1000 * 60 * 5);
    return summary;
  }
}

/**
 * Tóm tắt tổng quan cốt truyện của toàn bộ tác phẩm dựa trên nội dung tổng hợp các chương
 * @param {string} storyTitle - Tiêu đề của truyện
 * @param {string[]|string} allChaptersContent - Mảng chứa nội dung các chương hoặc chuỗi văn bản gộp
 * @returns {Promise<string>} Nội dung tóm tắt cốt truyện tổng quan
 */
async function generateStorySummary(storyTitle, allChaptersContent) {
  // Gộp nội dung tất cả các chương lại thành một chuỗi duy nhất để gửi cho AI
  const combined = Array.isArray(allChaptersContent)
    ? allChaptersContent.join('\n\n---\n\n')
    : String(allChaptersContent || '');
  
  // Điều kiện kiểm tra: Nội dung tích lũy của các chương phải tối thiểu 600 ký tự mới đủ dữ liệu tóm tắt tổng quát
  if (combined.trim().length < 600) {
    return 'Nội dung các chương hiện tại quá ngắn để tạo tóm tắt tổng quan.';
  }

  // Tạo khóa cache dựa trên tên truyện kết hợp với 500 ký tự đầu của chuỗi nội dung để đảm bảo tính nhất quán
  const key = cacheKey('story', `${storyTitle}:${combined.slice(0, 500)}`);
  const cached = getFromMemoryCache(key);
  if (cached) {
    return cached;
  }

  // Chỉ cắt lấy 12000 ký tự đầu tiên để tránh lỗi vượt quá giới hạn Token (context window) của API AI
  const prompt = `Viết tóm tắt tổng quan bằng tiếng Việt (3-4 đoạn) cho truyện "${storyTitle}" dựa trên các chương sau:\n\n${combined.slice(0, 12000)}`;

  try {
    const summary = await callAI(prompt);
    setMemoryCache(key, summary);
    return summary;
  } catch (error) {
    console.error('[aiService.generateStorySummary]', error.message);
    return `Tóm tắt mẫu cho "${storyTitle}": truyện gồm nhiều chương với các tình tiết hấp dẫn. Cấu hình AI API key để nhận tóm tắt AI đầy đủ.`;
  }
}

/**
 * Gợi ý danh sách ID truyện được đề xuất dựa trên lịch sử đọc truyện của người dùng
 * @param {Array<object>} userReadingHistory - Danh sách lịch sử đọc của người dùng chứa thông tin category, author_id, story_id
 * @returns {Promise<number[]>} Mảng chứa tối đa 5 ID truyện được đề xuất
 */
async function generatePersonalRecommendations(userReadingHistory) {
  const history = Array.isArray(userReadingHistory) ? userReadingHistory : [];
  
  // Tạo khóa cache dựa trên mảng IDs các truyện đã đọc để tránh tính toán lại khi lịch sử không đổi
  const key = cacheKey('recs', JSON.stringify(history.map((h) => h.story_id)));
  const cached = getFromMemoryCache(key);
  if (cached) {
    return cached;
  }

  // Nếu người dùng chưa đọc truyện nào, trả về mảng rỗng để luồng ngoài tự áp dụng gợi ý truyện phổ biến
  if (history.length === 0) {
    return [];
  }

  try {
    // Import Story model để query recommendations từ database
    const Story = require('../models/Story');

    // Lấy danh sách story IDs đã đọc để loại bỏ khỏi gợi ý
    const readStoryIds = history.map((h) => h.story_id);

    // Query database để tìm stories có cùng tags/preferences, loại bỏ những đã đọc
    // Logic: phân tích tags từ reading history, tìm stories khác có cùng tags, sắp xếp theo rating cao
    const recommendedStories = await Story.getStoriesForRecommendations(
      history,      // Reading history with tags info
      readStoryIds, // Exclude already read stories
      10            // Limit to 10 recommendations (display more)
    );

    // Extract story IDs từ recommended stories
    const storyIds = recommendedStories.map((s) => s.id);
    
    // Lưu vào cache để tránh query lại nếu lịch sử không đổi
    setMemoryCache(key, storyIds);
    return storyIds;
  } catch (error) {
    console.error('[aiService.generatePersonalRecommendations]', error.message);
  }

  // Khôi phục dự phòng (Fallback): Lấy related_story_id hoặc chính story_id từ lịch sử làm gợi ý nếu query lỗi
  const fallback = history
    .map((h) => h.related_story_id || h.story_id)
    .filter((id, index, arr) => id && arr.indexOf(id) === index)
    .slice(0, 10);
  setMemoryCache(key, fallback);
  return fallback;
}

module.exports = {
  generateChapterSummary,
  generateStorySummary,
  generatePersonalRecommendations,
  generateRecommendationPayload: generatePersonalRecommendations,
};
