/**
 * api.js - Core HTTP wrapper for the frontend
 * Exposes a simple apiCall() helper and token helpers used across modules.
 * Automatically switches base URL for local development vs production.
 */

// AUTO-CONFIG: choose backend host for local vs production
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5208'
  : 'https://webappbe-fzz7.onrender.com';

const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Generic API call wrapper
 * - Automatically attaches Authorization header when token exists
 * - Throws on non-OK responses, including parsed server error message when available
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

// Simple token helpers used by auth module and other callers
export function setToken(token) {
  if (token) localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

// (Truncated) All other legacy/bridge helpers removed from this file to keep api.js focused

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
// End of file (cleaned merge remnants)
>>>>>>> origin/emDuong
