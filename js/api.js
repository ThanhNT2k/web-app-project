/**
 * api.js - Gọi API từ Backend ASP.NET Core (.NET 10)
 * Tự động cấu hình linh hoạt giữa Local và Render Online
 * ĐÃ ĐỒNG BỘ CHUẨN ĐÉT VỚI DATABASE TRUYỆN TRANH (COMIC/CHAPTER/GENRE)
 */

// 🟢 TỰ ĐỘNG CẤU HÌNH ĐỊA CHỈ BASE URL THÔNG MINH
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5208'                               // Khi bạn chạy test ở máy cục bộ (Cập nhật lại port nếu cần, ví dụ: 5000 hoặc 5221)
    : 'https://webappbe-fzz7.onrender.com';                 // Địa chỉ Render của bạn

const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Hàm generic để gọi API
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Gửi Token bảo mật phục vụ Middleware Auth phân quyền
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Thêm xử lý bóc tách lỗi chi tiết từ AuthorizeRolesAttribute (401, 403)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * =========================================================================
 * 📚 PHẦN QUẢN LÝ TRUYỆN TRANH (ĐỒNG BỘ 100% VỚI COMICSCONTROLLER)
 * =========================================================================
 */

/**
 * Lấy danh sách tất cả các truyện (Có hỗ trợ phân trang và bộ lọc trạng thái)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng truyện mỗi trang
 * @param {string} status - Bộ lọc trạng thái ('Ongoing', 'Completed')
 * @param {string} sortBy - Sắp xếp theo ('created_at', 'total_views')
 */
async function getComics(page = 1, limit = 12, status = null, sortBy = 'created_at') {
  let url = `/comics?page=${page}&limit=${limit}&sortBy=${sortBy}`;
  if (status) url += `&status=${status}`;
  return apiCall(url);
}

/**
 * Lấy chi tiết một bộ truyện dựa vào Slug (Xử lý lỗi 404 cũ)
 * @param {string} slug - Đường dẫn định danh truyện (Ví dụ: 'solo-leveling')
 */
async function getComicBySlug(slug) {
  return apiCall(`/comics/${slug}`);
}

/**
 * API PHÂN QUYỀN: Tạo truyện mới (Yêu cầu quyền Uploader hoặc Admin)
 */
async function createComic(comicData) {
  return apiCall('/comics/create', 'POST', comicData);
}

/**
 * Lấy danh sách các thể loại truyện công khai
 */
async function getGenres() {
  return apiCall('/genres'); 
}

/**
 * Lấy danh sách chương của một bộ truyện dựa trên Comic ID
 * @param {number} comicId - ID của bộ truyện
 */
async function getChaptersByComic(comicId) {
  return apiCall(`/chapters/comic/${comicId}`); 
}

/**
 * Lấy nội dung chi tiết ảnh của một chương truyện
 * @param {number} chapterId - ID của chương cần đọc
 */
async function getChapterImages(chapterId) {
  return apiCall(`/chapters/${chapterId}`);
}

/**
 * Gọi gợi ý truyện từ AI thông minh (Đồng bộ AIController)
 */
async function getAIRecommendations(preference) {
  return apiCall(`/AI/recommend?preference=${encodeURIComponent(preference)}`);
}

/**
 * =========================================================================
 * 👤 PHẦN QUẢN LÝ USER, TƯƠNG TÁC & PHÂN QUYỀN (Đồng bộ UsersController)
 * =========================================================================
 */

/**
 * Lấy thông tin Profile cá nhân của người dùng đang đăng nhập
 */
async function getProfile() {
  return apiCall('/users');
}

/**
 * Cập nhật thông tin cá nhân (Username, Avatar)
 */
async function updateProfile(profileData) {
  return apiCall('/users/profile', 'PUT', profileData);
}

/**
 * Lấy lịch sử đọc truyện của User
 */
async function getReadingHistory() {  
  return apiCall('/users/history');
}

/**
 * Lưu lịch sử tiến độ khi User đọc đến một chương truyện cụ thể
 */
async function updateReadProgress(comicId, chapterId) {
  return apiCall('/users/history', 'POST', { comicId, chapterId });
}

/**
 * Lấy danh sách truyện đang theo dõi/yêu thích của User
 */
async function getFavoriteComics() {
  return apiCall('/users/favorites');
}

/**
 * Đổi trạng thái Theo dõi / Bỏ theo dõi một bộ truyện (Toggle Follow)
 */
async function toggleFollowComic(comicId) {
  return apiCall('/users/follow', 'POST', { comicId });
}

/**
 * Đăng bình luận mới vào một bộ truyện
 */
async function createComment(comicId, content, parentId = null) {
  return apiCall('/users/comment', 'POST', { comicId, content, parentId });
}

/**
 * =========================================================================
 * 🛡️ BIẾN ĐỘC QUYỀN CHO ADMIN (ADMIN MANAGEMENT)
 * =========================================================================
 */

/**
 * API HỦY DIỆT: Xóa toàn bộ thông tin một User ra khỏi hệ thống (Chỉ đích danh Admin)
 * @param {string} userId - UUID của User cần xóa
 */
async function adminDeleteUser(userId) {
  return apiCall(`/users/admin/manage-user/${userId}`, 'DELETE');
}
/**
 * =========================================================================
 * 🔐 AUTH & UTILS
 * =========================================================================
 */

// Lưu / lấy / xóa token tiện lợi
function setAuthToken(token) {
  if (token) localStorage.setItem('token', token);
}

function getAuthToken() {
  return localStorage.getItem('token');
}

function clearAuthToken() {
  localStorage.removeItem('token');
}

/**
 * Đăng nhập: gọi endpoint /auth/login (thường trả về object chứa token và user)
 * @param {string} email
 * @param {string} password
 */
async function login(email, password) {
  const payload = { email, password };
  const res = await apiCall('/auth/login', 'POST', payload);
  // Nếu backend trả về token ở property khác, bạn có thể điều chỉnh ở đây
  if (res && (res.token || res.accessToken)) {
    setAuthToken(res.token || res.accessToken);
  }
  return res;
}

/**
 * Đăng ký tài khoản mới (nếu backend có endpoint /auth/register)
 * @param {object} userData - { email, password, username, ... }
 */
async function register(userData) {
  return apiCall('/auth/register', 'POST', userData);
}

/**
 * Đăng xuất: gọi endpoint logout nếu có, luôn clear token local
 */
async function logout() {
  try {
    // Một số backend không cần endpoint logout, nhưng gọi nếu có
    await apiCall('/auth/logout', 'POST');
  } catch (e) {
    // ignore server errors on logout - vẫn xóa token client-side
  } finally {
    clearAuthToken();
  }
}

/**
 * Refresh token (nếu backend hỗ trợ)
 */
async function refreshToken() {
  const res = await apiCall('/auth/refresh', 'POST');
  if (res && (res.token || res.accessToken)) {
    setAuthToken(res.token || res.accessToken);
  }
  return res;
}

/**
 * TÌM KIẾM TRUYỆN
 * Tách hàm search để rõ ràng: gọi endpoint /comics/search?q=... (tùy backend)
 */
async function searchComics(query, page = 1, limit = 12) {
  const q = encodeURIComponent(query || '');
  return apiCall(`/comics/search?q=${q}&page=${page}&limit=${limit}`);
}

// Kết thúc file
/**
 * =========================================================================
 * 🌉 MANGAdex (public) - Bridge functions
 * Sử dụng trực tiếp API public của MangaDex để lấy dữ liệu (không qua backend).
 * Những hàm này giúp frontend gọi nhanh các endpoint như tìm truyện, lấy chapter,
 * lấy server hình ảnh (at-home) và cover art.
 * Docs: https://api.mangadex.org/docs/03-manga/
 * =========================================================================
 */

const MANGADEX_API = 'https://api.mangadex.org';

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  for (const key in params) {
    const val = params[key];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      // append as key[] to match MD style when appropriate
      val.forEach(v => usp.append(`${key}[]`, v));
    } else {
      usp.append(key, val);
    }
  }
  return usp.toString();
}

async function mdCall(path, params = null, method = 'GET', body = null) {
  let url = `${MANGADEX_API}${path}`;
  if (params) {
    const qs = (typeof params === 'string') ? params : buildQuery(params);
    if (qs) url += `?${qs}`;
  }

  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  if (body && method !== 'GET') options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Tìm truyện trên MangaDex theo title / tag
 * @param {string} title
 * @param {number} limit
 * @param {number} offset
 * @param {Array<string>} includes - e.g. ['author','artist','cover_art']
 */
async function mdSearchManga(title, limit = 10, offset = 0, includes = ['cover_art']) {
  const params = {
    title,
    limit,
    offset
  };
  if (includes && includes.length) params.includes = includes;
  return mdCall('/manga', params);
}

/**
 * Lấy chi tiết 1 manga theo id
 */
async function mdGetMangaById(mangaId, includes = ['author','artist','cover_art']) {
  const params = {};
  if (includes && includes.length) params.includes = includes;
  return mdCall(`/manga/${mangaId}`, params);
}

/**
 * Lấy feed (danh sách chapter) của 1 manga
 * order example: { 'chapter': 'desc' } => sử dụng key 'order[chapter]' khi buildQuery
 */
async function mdGetMangaFeed(mangaId, { limit = 20, offset = 0, translatedLanguage = ['en'], order = { 'chapter': 'desc' } } = {}) {
  const params = {
    limit,
    offset,
    'translatedLanguage': translatedLanguage
  };
  // hỗ trợ order map -> convert to order[FIELD]=value
  if (order && typeof order === 'object') {
    for (const k in order) {
      params[`order[${k}]`] = order[k];
    }
  }
  return mdCall(`/manga/${mangaId}/feed`, params);
}

/**
 * Lấy thông tin chapter
 */
async function mdGetChapter(chapterId) {
  return mdCall(`/chapter/${chapterId}`);
}

/**
 * Lấy At-Home server (đường dẫn base để tải hình ảnh cho 1 chapter)
 */
async function mdGetAtHomeServer(chapterId) {
  return mdCall(`/at-home/server/${chapterId}`);
}

/**
 * Lấy cover art theo manga id (trả về list cover resources)
 */
async function mdGetCoversByMangaId(mangaId, limit = 10, offset = 0) {
  const params = {
    'manga[]': [mangaId],
    limit,
    offset
  };
  return mdCall('/cover', params);
}

// ----------------------------
// FRONTEND-ONLY: direct provider fetch + CORS-fallback + parsers
// (for quick prototyping without backend changes)
// ----------------------------

const CORS_PROXY = 'https://api.allorigins.win/raw?url='; // fallback public proxy (for prototyping only)

/**
 * Try to fetch a URL directly; if it fails (CORS/network), try a CORS proxy fallback.
 * Returns response text.
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
 * Parse HTML string into Document
 */
function parseHTML(htmlText) {
  return new DOMParser().parseFromString(htmlText, 'text/html');
}

/**
 * Generic: fetch a provider page URL and run a parser(doc) => normalized object
 * parser should return { data:..., meta:... } or similar
 */
async function fetchAndParseUrl(url, parser, opts = {}) {
  const html = await tryFetchWithCorsFallback(url, opts);
  const doc = parseHTML(html);
  return parser(doc, html);
}

/* ============================
   Example parsers (templates)
   Adjust selectors per site. These are naive and intended for quick prototyping.
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
   Public wrapper functions
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
  // note: MangaDex cover endpoint also hỗ trợ id[]=...; buildQuery sẽ chuyển mảng thành id[]
  return mdCall('/cover', params);
}

/**
 * =========================================================================
 * 🌐 PROVIDER ADAPTERS FOR NOVEL SITES (truyện chữ)
 * These functions call your backend proxy endpoints under /api/provider/:provider/...
 * Backend should implement routes that fetch/normalize data from target novel sites.
 * If you later want direct client-side calls, adapt these functions to call provider URLs.
 * =========================================================================
 */

// List supported providers (informational)
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
 * Generic provider search via backend proxy
 * @param {string} provider - provider id (e.g. 'novelfull')
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
 * Get novel details from provider (via backend proxy)
 * @param {string} provider
 * @param {string} idOrSlug
 */
async function getNovelFromProvider(provider, idOrSlug) {
  const p = encodeURIComponent(provider || '');
  return apiCall(`/provider/${p}/novel/${encodeURIComponent(idOrSlug)}`);
}

/**
 * Get list of chapters for a novel from provider
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
 * Get chapter content (text) from provider
 * @param {string} provider
 * @param {string|number} chapterId
 */
async function getChapterContentFromProvider(provider, chapterId) {
  const p = encodeURIComponent(provider || '');
  return apiCall(`/provider/${p}/chapter/${encodeURIComponent(chapterId)}/content`);
}

/**
 * Fallback: attempt direct fetch to provider public API or page (use with caution: CORS)
 * Returns raw HTML/text; only use for prototyping when backend proxy not available.
 */
async function providerDirectFetch(url, opts = {}) {
  // Minimal wrapper around fetch for direct provider calls (no auth)
  const response = await fetch(url, { method: opts.method || 'GET', headers: opts.headers || {} });
  if (!response.ok) throw new Error(`Provider fetch failed: ${response.status}`);
  return response.text();
}

/* ---------------------------
   PROVIDER: unified wrappers for both read-only and stateful actions
   - Read-only: attempt direct provider call (providerDirect*), fallback to backend proxy (/api/provider/...)
   - Stateful (login/follow/bookmark): MUST call backend proxy to perform safely
   --------------------------- */

/**
 * Unified search: first try direct client fetch (providerDirectSearch),
 * if that fails (throws), fallback to backend proxy endpoint:
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
 * Unified get novel detail: try direct then backend
 */
async function providerGetNovelUnified(provider, idOrSlug) {
  try {
    return await providerDirectGetNovel(provider, idOrSlug);
  } catch (err) {
    return apiCall(`/provider/${encodeURIComponent(provider)}/novel/${encodeURIComponent(idOrSlug)}`);
  }
}

/**
 * Unified get chapters list
 */
async function providerGetChaptersUnified(provider, novelId, page = 1, limit = 200) {
  try {
    // try direct by fetching novel detail and extracting chapters
    const direct = await providerDirectGetNovel(provider, novelId);
    if (direct && direct.chapters) return { data: direct.chapters };
  } catch (err) {
    // ignore and fallback
  }
  return apiCall(`/provider/${encodeURIComponent(provider)}/novel/${encodeURIComponent(novelId)}/chapters?page=${page}&limit=${limit}`);
}

/**
 * Unified get chapter content
 */
async function providerGetChapterContentUnified(provider, chapterUrlOrId) {
  try {
    return await providerDirectGetChapterContent(provider, chapterUrlOrId);
  } catch (err) {
    return apiCall(`/provider/${encodeURIComponent(provider)}/chapter/${encodeURIComponent(chapterUrlOrId)}/content`);
  }
}

/* ---------------------------
   Stateful actions (LOGIN / FOLLOW / BOOKMARK)
   NOTE: these MUST be implemented via your backend for security and CORS reasons.
   Backend endpoints expected (example):
    - POST /api/provider/:provider/login   { username, password }
    - POST /api/provider/:provider/logout
    - POST /api/provider/:provider/follow  { novelId, action: 'follow'|'unfollow' }
    - POST /api/provider/:provider/bookmark { chapterId, note }
   The frontend wrappers below call these backend endpoints via apiCall(...)
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

