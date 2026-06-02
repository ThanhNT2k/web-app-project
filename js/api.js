/**
 * api.js - Bộ wrapper HTTP cốt lõi cho frontend
 * Công khai một hàm apiCall() đơn giản và các hàm token được sử dụng trên các module.
 * Tự động chuyển đổi URL cơ sở cho phát triển cục bộ vs sản xuất.
 */

// CẤU HÌNH TỰ ĐỘNG: chọn backend host cho phát triển cục bộ vs sản xuất
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5208'
  : 'https://webappbe-fzz7.onrender.com';

const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Bộ wrapper API call chung
 * - Tự động gắn header Authorization khi token tồn tại
 * - Ném lỗi cho các response không OK, bao gồm lỗi phân tích cú pháp từ máy chủ nếu có
 */
export async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || errorData.message || `HTTP ${response.status}`;
      throw new Error(message);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error('API Error:', err.message || err);
    throw err;
  }
}

// Các hàm token đơn giản được sử dụng bởi module auth và những người gọi khác
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

// (Đã xóa) Tất cả các hàm legacy/bridge khác được xóa từ tệp này để giữ api.js tập trung

// ----------------------------
// FRONTEND-ONLY: tìm nạp provider trực tiếp + fallback CORS + parsers
// (để nguyên mẫu nhanh mà không thay đổi backend)
// ----------------------------

const CORS_PROXY = 'https://api.allorigins.win/raw?url='; // fallback public proxy (for prototyping only)

/**
 * Cố gắng tìm nạp URL trực tiếp; nếu thất bại (CORS/mạng), hãy thử fallback proxy CORS.
 * Trả về text phản hồi.
 */
async function tryFetchWithCorsFallback(url, options = {}) {
  try {
    const res = await fetch(url, { method: options.method || 'GET', headers: options.headers || {} });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (directErr) {
    try {
      const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
      const res2 = await fetch(proxied, { method: 'GET' });
      if (!res2.ok) throw new Error(`Proxy HTTP ${res2.status}`);
      return await res2.text();
    } catch (proxyErr) {
      throw new Error(`Both direct and proxy fetch failed: ${directErr.message} / ${proxyErr.message}`);
    }
  }
}

/**
 * Phân tích chuỗi HTML thành Document
 */
function parseHTML(htmlText) {
  return new DOMParser().parseFromString(htmlText, 'text/html');
}

/**
 * Chung: tìm nạp URL trang của nhà cung cấp và chạy một parser(doc) => đối tượng bình thường hóa
 * parser nên trả về { data:..., meta:... } hoặc tương tự
 */
 */
async function fetchAndParseUrl(url, parser, opts = {}) {
  const html = await tryFetchWithCorsFallback(url, opts);
  const doc = parseHTML(html);
  return parser(doc, html);
}

/* ============================
   Các ví dụ parser (template)
   Điều chỉnh bộ chọn cho mỗi trang. Đây là ngây thơ và dự định cho nguyên mẫu nhanh.
   ============================ */

function parseRoyalRoadSearch(doc) {
  const items = [];
  const rows = doc.querySelectorAll('.fiction-list .fiction-row, .fiction-row, .search-result');
  rows.forEach(r => {
    try {
      const a = r.querySelector('a.title') || r.querySelector('a[href*="/fiction/"]');
      const title = a ? a.textContent.trim() : (r.querySelector('.title')?.textContent?.trim() || '');
      const sourceUrl = a ? a.href : '';
      let id = sourceUrl.split('/').pop();
      const author = r.querySelector('.author')?.textContent?.trim() || r.querySelector('.author a')?.textContent?.trim() || '';
      const cover = r.querySelector('img')?.src || '';
      const shortDesc = r.querySelector('.fiction-summary')?.textContent?.trim() || '';
      items.push({ id, title, slug: id, author, coverUrl: cover, shortDesc, sourceUrl });
    } catch(e) { }
  });
  return { data: items, total: items.length };
}

function parseNovelFullDetail(doc) {
  const title = doc.querySelector('h1.title, h1[itemprop="name"]')?.textContent?.trim() || '';
  const author = doc.querySelector('.author, a[rel="author"]')?.textContent?.trim() || '';
  const cover = doc.querySelector('.book-cover img, .summary_image img')?.src || '';
  const desc = doc.querySelector('#description, .summary__content, .description')?.innerHTML?.trim() || doc.querySelector('#description')?.textContent?.trim() || '';
  const chapterNodes = doc.querySelectorAll('.chapter-list a, .chapters a, .chapter a');
  const chapters = Array.from(chapterNodes).map(a => ({ id: a.href.split('/').pop(), title: a.textContent.trim(), url: a.href }));
  return { id: '', title, authors: [author].filter(Boolean), description: desc, coverUrl: cover, chapters };
}

/* ============================
   Các hàm bọc công khai
   ============================ */

async function providerDirectSearch(provider, query, page = 1, limit = 12) {
  const q = encodeURIComponent(query || '');
  const map = {
    'royalroad': `https://www.royalroad.com/fictionsearch/autocomplete?query=${q}`,
    'royalroad_html': `https://www.royalroad.com/search?q=${q}`,
    'novelfull': `https://novelfull.com/search?keyword=${q}`,
    'lightnovelworld': `https://www.lightnovelworld.com/search?keyword=${q}`
  };

  try {
    if (provider === 'royalroad') {
      const jsonUrl = map['royalroad'];
      try {
        const res = await fetch(jsonUrl);
        if (res.ok) {
          const json = await res.json();
          const data = (json || []).map(item => ({ id: item.id || item.value || item.url, title: item.text || item.label || item.name, slug: item.url?.split?.('/')?.pop?.() || '', author: item.author || '', coverUrl: '', shortDesc: item.description || '' }));
          return { data, total: data.length };
        }
      } catch(e) {}
      const htmlUrl = map['royalroad_html'];
      const result = await fetchAndParseUrl(`${htmlUrl}`, parseRoyalRoadSearch);
      return result;
    }

    if (provider === 'novelfull' || provider === 'lightnovelworld') {
      const htmlUrl = map[provider];
      const docOrHtml = await tryFetchWithCorsFallback(htmlUrl);
      const doc = parseHTML(docOrHtml);
      return parseRoyalRoadSearch(doc);
    }

    const fallbackUrl = `https://www.${provider}.com/search?q=${q}`;
    const htmlText = await tryFetchWithCorsFallback(fallbackUrl);
    const doc = parseHTML(htmlText);
    return parseRoyalRoadSearch(doc);
  } catch (err) {
    throw err;
  }
}

async function providerDirectGetNovel(provider, idOrSlug) {
  const map = {
    'royalroad': `https://www.royalroad.com/fiction/${encodeURIComponent(idOrSlug)}`,
    'novelfull': `https://novelfull.com/${encodeURIComponent(idOrSlug)}`,
    'lightnovelworld': `https://www.lightnovelworld.com/novel/${encodeURIComponent(idOrSlug)}`
  };
  const url = map[provider] || idOrSlug;
  const html = await tryFetchWithCorsFallback(url);
  const doc = parseHTML(html);
  if (provider === 'novelfull') return parseNovelFullDetail(doc);
  if (provider === 'royalroad') return parseNovelFullDetail(doc);
  return parseNovelFullDetail(doc);
}

async function providerDirectGetChapterContent(provider, chapterUrlOrId) {
  const isUrl = String(chapterUrlOrId).startsWith('http');
  const url = isUrl ? chapterUrlOrId : chapterUrlOrId;
  const html = await tryFetchWithCorsFallback(url);
  const doc = parseHTML(html);
  const contentEl = doc.querySelector('.chapter-content, #chapter-content, .entry-content, .read-content, .cha-content') || doc.querySelector('article, .post, .content');
  const title = doc.querySelector('h1, h2.chapter-title, .chapter-title')?.textContent?.trim() || '';
  const contentHtml = contentEl ? contentEl.innerHTML.trim() : doc.body.innerHTML.trim();
  const plain = contentEl ? contentEl.textContent.trim() : doc.body.textContent.trim();
  return { id: chapterUrlOrId, chapterNumber: '', title, content: contentHtml, plainText: plain, sourceUrl: url };
}


/**
 * Lấy nhiều cover art theo danh sách id cover
 */
async function mdGetCoversByIds(coverIds = []) {
  if (!coverIds || !coverIds.length) return { data: [] };
  const params = { id: coverIds };
  // ghi chú: Điểm cuối cover của MangaDex cũng hỗ trợ id[]=...; buildQuery sẽ chuyển mảng thành id[]
  return mdCall('/cover', params);
}

/**
 * =========================================================================
 * 🌐 BỘ ĐIỀU HỢP NHÀ CUNG CẤP CHO CÁC TRANG TIỂU THUYẾT (truyện chữ)
 * Các hàm này gọi các endpoint proxy backend dưới /api/provider/:provider/...
 * Backend nên triển khai các route tìm nạp/bình thường hóa dữ liệu từ các trang tiểu thuyết mục tiêu.
 * Nếu sau này bạn muốn gọi phía client trực tiếp, hãy điều chỉnh các hàm này để gọi URL nhà cung cấp.
 * =========================================================================
 */

// Danh sách các nhà cung cấp được hỗ trợ (thông tin)
function listNovelProviders() {
  return [
    'novelfull',
    'royalroad',
    'wuxiaworld',
    'lightnovelworld',
    'lnmtl'
  ];
}

/**
 * Tìm kiếm nhà cung cấp chung thông qua proxy backend
 * @param {string} provider - id nhà cung cấp (ví dụ 'novelfull')
 * @param {string} query
 * @param {number} page
 * @param {number} limit
 */
async function providerSearch(provider, query, page = 1, limit = 12) {
  const p = encodeURIComponent(provider || '');
  const q = encodeURIComponent(query || '');
  return apiCall(`/provider/${p}/search?q=${q}&page=${page}&limit=${limit}`);
}

/**
 * Nhận chi tiết tiểu thuyết từ nhà cung cấp (thông qua proxy backend)
 * @param {string} provider
 * @param {string} idOrSlug
 */
async function getNovelFromProvider(provider, idOrSlug) {
  const p = encodeURIComponent(provider || '');
  return apiCall(`/provider/${p}/novel/${encodeURIComponent(idOrSlug)}`);
}

/**
 * Lấy danh sách các chương cho một tiểu thuyết từ nhà cung cấp
 * @param {string} provider
 * @param {string|number} novelId
 * @param {number} page
 * @param {number} limit
 */
async function getChaptersFromProvider(provider, novelId, page = 1, limit = 200) {
  const p = encodeURIComponent(provider || '');
  return apiCall(`/provider/${p}/novel/${encodeURIComponent(novelId)}/chapters?page=${page}&limit=${limit}`);
}

/**
 * Lấy nội dung chương (văn bản) từ nhà cung cấp
 * @param {string} provider
 * @param {string|number} chapterId
 */
async function getChapterContentFromProvider(provider, chapterId) {
  const p = encodeURIComponent(provider || '');
  return apiCall(`/provider/${p}/chapter/${encodeURIComponent(chapterId)}/content`);
}

/**
 * Fallback: cố gắng tìm nạp trực tiếp API công khai của nhà cung cấp hoặc trang (sử dụng cẩn thận: CORS)
 * Trả về HTML/text thô; chỉ sử dụng để nguyên mẫu khi proxy backend không có sẵn.
 */
async function providerDirectFetch(url, opts = {}) {
  // Bộ wrapper tối thiểu xung quanh fetch cho các cuộc gọi nhà cung cấp trực tiếp (không có auth)
  const response = await fetch(url, { method: opts.method || 'GET', headers: opts.headers || {} });
  if (!response.ok) throw new Error(`Provider fetch failed: ${response.status}`);
  return response.text();
}

/* ---------------------------
   NHÀ CUNG CẤP: bộ wrapper thống nhất cho các hành động chỉ đọc và có trạng thái
   - Chỉ đọc: cố gắng gọi nhà cung cấp trực tiếp (providerDirect*), fallback to backend proxy (/api/provider/...)
   - Có trạng thái (login/follow/bookmark): PHẢI gọi backend proxy để thực hiện an toàn
   --------------------------- */

/**
 * Tìm kiếm thống nhất: trước tiên hãy thử tìm nạp client trực tiếp (providerDirectSearch),
 * nếu thất bại (throws), fallback to backend proxy endpoint:
 * GET /api/provider/:provider/search?q=...&page=...&limit=...
 */
async function providerSearchUnified(provider, query, page = 1, limit = 12) {
  try {
    return await providerDirectSearch(provider, query, page, limit);
  } catch (err) {
    return apiCall(`/provider/${encodeURIComponent(provider)}/search?q=${encodeURIComponent(query || '')}&page=${page}&limit=${limit}`);
  }
}

/**
 * Nhận chi tiết tiểu thuyết thống nhất: thử trực tiếp rồi backend
 */
async function providerGetNovelUnified(provider, idOrSlug) {
  try {
    return await providerDirectGetNovel(provider, idOrSlug);
  } catch (err) {
    return apiCall(`/provider/${encodeURIComponent(provider)}/novel/${encodeURIComponent(idOrSlug)}`);
  }
}

/**
 * Danh sách các chương thống nhất
 */
async function providerGetChaptersUnified(provider, novelId, page = 1, limit = 200) {
  try {
    // thử trực tiếp bằng cách tìm nạp chi tiết tiểu thuyết và trích xuất các chương
    const direct = await providerDirectGetNovel(provider, novelId);
    if (direct && direct.chapters) return { data: direct.chapters };
  } catch (err) {
    // bỏ qua và fallback
  }
  return apiCall(`/provider/${encodeURIComponent(provider)}/novel/${encodeURIComponent(novelId)}/chapters?page=${page}&limit=${limit}`);
}

/**
 * Nội dung chương thống nhất
 */
async function providerGetChapterContentUnified(provider, chapterUrlOrId) {
  try {
    return await providerDirectGetChapterContent(provider, chapterUrlOrId);
  } catch (err) {
    return apiCall(`/provider/${encodeURIComponent(provider)}/chapter/${encodeURIComponent(chapterUrlOrId)}/content`);
  }
}

/* ---------------------------
   CÁC HÀNH ĐỘNG CÓ TRẠNG THÁI (LOGIN / FOLLOW / BOOKMARK)
   LƯU Ý: những điều này PHẢI được triển khai qua backend của bạn để bảo mật và lý do CORS.
   Các điểm cuối backend được mong đợi (ví dụ):
    - POST /api/provider/:provider/login   { username, password }
    - POST /api/provider/:provider/logout
    - POST /api/provider/:provider/follow  { novelId, action: 'follow'|'unfollow' }
    - POST /api/provider/:provider/bookmark { chapterId, note }
   Các bộ wrapper frontend bên dưới gọi các điểm cuối backend này thông qua apiCall(...)
   --------------------------- */

async function providerLogin(provider, credentials) {
  return apiCall(`/provider/${encodeURIComponent(provider)}/login`, 'POST', credentials);
}

async function providerLogout(provider) {
  return apiCall(`/provider/${encodeURIComponent(provider)}/logout`, 'POST');
}

async function providerFollowNovel(provider, novelId, action = 'follow') {
  return apiCall(`/provider/${encodeURIComponent(provider)}/follow`, 'POST', { novelId, action });
}

async function providerBookmarkChapter(provider, chapterId, note = '') {
  return apiCall(`/provider/${encodeURIComponent(provider)}/bookmark`, 'POST', { chapterId, note });
}

async function providerGetUserProfile(provider) {
  return apiCall(`/provider/${encodeURIComponent(provider)}/profile`);
}

// Kết thúc tệp
