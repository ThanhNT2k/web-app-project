const crypto = require('crypto');

const axios = require('axios');

const env = require('../config/environment');

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 30000;

const memoryCache = new Map();

function cacheKey(prefix, value) {
  const hash = crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
  return `${prefix}:${hash}`;
}

function getFromMemoryCache(key) {
  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function setMemoryCache(key, value, ttlMs = 1000 * 60 * 60) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function callGemini(prompt) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

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

function fallbackChapterSummary(chapterContent) {
  const excerpt = String(chapterContent || '').slice(0, 200).trim();
  return [
    'Đây là bản tóm tắt mẫu (chưa kết nối Gemini API hoặc API key chưa được cấu hình).',
    excerpt
      ? `Nội dung chương bắt đầu với: "${excerpt}${chapterContent.length > 200 ? '...' : ''}"`
      : 'Chương này chưa có nội dung để tóm tắt chi tiết.',
    'Hãy thêm GEMINI_API_KEY vào file .env của backend để nhận tóm tắt AI bằng tiếng Việt.',
  ].join('\n\n');
}

async function generateChapterSummary(chapterContent) {
  const key = cacheKey('chapter', chapterContent);
  const cached = getFromMemoryCache(key);
  if (cached) {
    return cached;
  }

  const prompt = `Bạn là trợ lý đọc truyện. Hãy viết tóm tắt 2-3 đoạn văn bằng tiếng Việt cho chương truyện sau. Tập trung vào diễn biến chính, nhân vật và kết quả của chương. Không thêm tiêu đề hay gạch đầu dòng.\n\nNội dung chương:\n${chapterContent}`;

  try {
    const summary = await callGemini(prompt);
    setMemoryCache(key, summary);
    return summary;
  } catch (error) {
    console.error('[aiService.generateChapterSummary]', error.message);
    const summary = fallbackChapterSummary(chapterContent);
    setMemoryCache(key, summary, 1000 * 60 * 5);
    return summary;
  }
}

async function generateStorySummary(storyTitle, allChaptersContent) {
  const combined = Array.isArray(allChaptersContent)
    ? allChaptersContent.join('\n\n---\n\n')
    : String(allChaptersContent || '');
  const key = cacheKey('story', `${storyTitle}:${combined.slice(0, 500)}`);
  const cached = getFromMemoryCache(key);
  if (cached) {
    return cached;
  }

  const prompt = `Viết tóm tắt tổng quan bằng tiếng Việt (3-4 đoạn) cho truyện "${storyTitle}" dựa trên các chương sau:\n\n${combined.slice(0, 12000)}`;

  try {
    const summary = await callGemini(prompt);
    setMemoryCache(key, summary);
    return summary;
  } catch (error) {
    console.error('[aiService.generateStorySummary]', error.message);
    return `Tóm tắt mẫu cho "${storyTitle}": truyện gồm nhiều chương với các tình tiết hấp dẫn. Cấu hình GEMINI_API_KEY để nhận tóm tắt AI đầy đủ.`;
  }
}

async function generatePersonalRecommendations(userReadingHistory) {
  const history = Array.isArray(userReadingHistory) ? userReadingHistory : [];
  const key = cacheKey('recs', JSON.stringify(history.map((h) => h.story_id)));
  const cached = getFromMemoryCache(key);
  if (cached) {
    return cached;
  }

  if (history.length === 0) {
    return [];
  }

  const categories = [...new Set(history.map((h) => h.category).filter(Boolean))];
  const authors = [...new Set(history.map((h) => h.author_id).filter(Boolean))];

  const prompt = `Dựa trên lịch sử đọc (thể loại: ${categories.join(', ') || 'nhiều thể loại'}, tác giả yêu thích: ${authors.join(', ') || 'đa dạng'}), hãy trả về CHÍNH XÁC 5 số nguyên là ID truyện được đề xuất từ danh sách sau (chỉ trả về JSON array, ví dụ [1,2,3,4,5]):\n${JSON.stringify(
    history.map((h) => ({ id: h.story_id, title: h.title, category: h.category }))
  )}`;

  try {
    const text = await callGemini(prompt);
    const match = text.match(/\[[\d,\s]+\]/);
    if (match) {
      const ids = JSON.parse(match[0]).filter((id) => Number.isInteger(id)).slice(0, 5);
      setMemoryCache(key, ids);
      return ids;
    }
  } catch (error) {
    console.error('[aiService.generatePersonalRecommendations]', error.message);
  }

  const fallback = history
    .map((h) => h.related_story_id || h.story_id)
    .filter((id, index, arr) => id && arr.indexOf(id) === index)
    .slice(0, 5);
  setMemoryCache(key, fallback);
  return fallback;
}

module.exports = {
  generateChapterSummary,
  generateStorySummary,
  generatePersonalRecommendations,
  generateRecommendationPayload: generatePersonalRecommendations,
};
