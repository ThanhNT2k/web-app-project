const path = require('path');
const JSZip = require('jszip');

function decodeTextBuffer(buffer) {
  if (!buffer || !buffer.length) return '';

  // UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.toString('utf8', 3);
  }

  // UTF-16 LE BOM
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le', 2);
  }

  // UTF-16 BE BOM
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const converted = Buffer.allocUnsafe(buffer.length - 2);
    for (let i = 2; i < buffer.length; i += 2) {
      converted[i - 2] = buffer[i + 1] || 0;
      converted[i - 1] = buffer[i] || 0;
    }
    return converted.toString('utf16le');
  }

  return buffer.toString('utf8');
}

function sanitizeTitleFromFilename(filename) {
  const baseName = path.basename(filename || '', path.extname(filename || ''));
  const normalized = baseName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized || 'Chuong 1';
}

function normalizeText(rawText) {
  return (rawText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000\uFEFF\u200B\u200C\u200D]/g, '')
    .trim();
}

function buildChapterTitle(matchedTitle, fallbackIndex) {
  const cleaned = (matchedTitle || '')
    .trim()
    .replace(/^[\s:.)\-–—]+/, '')
    .replace(/^#+\s*/, '')
    .trim();
  return cleaned || 'Chương không tên';
}

function normalizeChapterContent(content) {
  return (content || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseChapterHeader(line) {
  let candidate = String(line || '').trim();
  if (!candidate) return null;

  candidate = candidate.replace(/^[-*+]\s+/, '').trim();
  const hasHashMarker = /^#{1,6}/.test(candidate);
  candidate = candidate.replace(/^#{1,6}\s*/, '').trim();

  // Một số nguồn đánh số heading riêng trước số chương, ví dụ:
  // "#50. Chương 48. Tiểu Liễu". Số 50 chỉ là marker của nguồn.
  const externalIndex = candidate.match(/^(\d+(?:\.\d+)?)\s*[.)\-–—:]\s*(?=(?:chuong|chương|chapter)\b)/i);
  if (externalIndex) candidate = candidate.slice(externalIndex[0].length).trim();

  const chapterMarker = candidate.match(
    /^(?:chuong|chương|chapter)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:[.:)\-–—]+\s*)?(.*)$/i,
  );
  if (chapterMarker) {
    return {
      chapterNumber: chapterMarker[1],
      titleHint: chapterMarker[2] || '',
    };
  }

  // Markdown heading dạng "#50. Tiểu Liễu" hoặc "## Tiểu Liễu".
  if (hasHashMarker) {
    const hashHeading = candidate.match(/^(?:([0-9]+(?:\.[0-9]+)?)\s*[.:)\-–—]?\s*)?(.*)$/);
    if (hashHeading && hashHeading[2]?.trim()) {
      return {
        chapterNumber: hashHeading[1] || '',
        titleHint: hashHeading[2],
      };
    }
  }

  return null;
}

function parseChapterSections(text) {
  const lines = text.split('\n');
  const sections = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const header = parseChapterHeader(line);
    if (!header) continue;

    sections.push({
      lineIndex: i,
      chapterNumber: (header.chapterNumber || '').trim(),
      titleHint: (header.titleHint || '').trim(),
    });
  }

  if (sections.length === 0) return [];

  const chapters = [];
  for (let i = 0; i < sections.length; i += 1) {
    const current = sections[i];
    const next = sections[i + 1];
    const start = current.lineIndex + 1;
    const end = next ? next.lineIndex : lines.length;
    const content = normalizeChapterContent(lines.slice(start, end).join('\n'));

    const fallbackIndex = current.chapterNumber || String(i + 1);

    chapters.push({
      title: buildChapterTitle(current.titleHint, fallbackIndex),
      content,
    });
  }

  return chapters;
}

function parseStoryTextToChapters(text, options = {}) {
  const normalized = normalizeText(text);
  if (!normalized) {
    throw new Error('No readable content found in file');
  }

  const splitChapters = options.splitChapters !== false;
  const fallbackTitle = (options.singleTitle || '').trim() || 'Chuong 1';

  if (!splitChapters) {
    return [{ title: fallbackTitle, content: normalized }];
  }

  const parsedChapters = parseChapterSections(normalized);
  if (parsedChapters.length > 0) {
    return parsedChapters;
  }

  return [{ title: fallbackTitle, content: normalized }];
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    ndash: '–', mdash: '—', hellip: '…', ldquo: '“', rdquo: '”',
    lsquo: '‘', rsquo: '’',
  };

  return String(value || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return namedEntities[entity.toLowerCase()] ?? match;
  });
}

function htmlToPlainText(html) {
  return normalizeChapterContent(decodeHtmlEntities(
    String(html || '')
      .replace(/<(script|style|nav|head)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|section|article|li|h[1-6]|blockquote)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
  ));
}

function getXmlAttribute(source, name) {
  const match = String(source || '').match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1] || '';
}

function resolveZipPath(baseFile, relativeFile) {
  const decoded = decodeURIComponent(String(relativeFile || '').split('#')[0]);
  return path.posix.normalize(path.posix.join(path.posix.dirname(baseFile), decoded));
}

function extractDocumentTitle(html, fallbackTitle) {
  const heading = String(html || '').match(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/i)
    || String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = heading ? htmlToPlainText(heading[1]).replace(/\s+/g, ' ').trim() : '';
  const parsedHeader = parseChapterHeader(title);
  return parsedHeader ? buildChapterTitle(parsedHeader.titleHint, parsedHeader.chapterNumber) : (title || fallbackTitle);
}

async function parseEpubToChapters(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const containerEntry = zip.file('META-INF/container.xml');
  if (!containerEntry) throw new Error('EPUB không có META-INF/container.xml hợp lệ');

  const containerXml = await containerEntry.async('string');
  const rootfileMatch = containerXml.match(/<rootfile\b[^>]*>/i);
  const packagePath = getXmlAttribute(rootfileMatch?.[0], 'full-path');
  if (!packagePath) throw new Error('Không tìm thấy package document trong EPUB');

  const packageEntry = zip.file(packagePath);
  if (!packageEntry) throw new Error('Không đọc được package document trong EPUB');
  const packageXml = await packageEntry.async('string');

  const manifest = new Map();
  for (const itemTag of packageXml.match(/<item\b[^>]*>/gi) || []) {
    const id = getXmlAttribute(itemTag, 'id');
    const href = getXmlAttribute(itemTag, 'href');
    const mediaType = getXmlAttribute(itemTag, 'media-type');
    if (id && href) manifest.set(id, { href, mediaType });
  }

  const spineIds = (packageXml.match(/<itemref\b[^>]*>/gi) || [])
    .filter((itemRef) => getXmlAttribute(itemRef, 'linear').toLowerCase() !== 'no')
    .map((itemRef) => getXmlAttribute(itemRef, 'idref'))
    .filter(Boolean);

  const chapters = [];
  for (const id of spineIds) {
    const item = manifest.get(id);
    if (!item || !/xhtml|html/i.test(item.mediaType || item.href)) continue;
    const documentPath = resolveZipPath(packagePath, item.href);
    const entry = zip.file(documentPath);
    if (!entry) continue;

    const html = await entry.async('string');
    const fallbackTitle = sanitizeTitleFromFilename(item.href) || `Chuong ${chapters.length + 1}`;
    const title = extractDocumentTitle(html, fallbackTitle);
    const content = htmlToPlainText(html.replace(/<h[1-2][^>]*>[\s\S]*?<\/h[1-2]>/i, ''));
    if (!content) continue;

    chapters.push({ title, content });
  }

  if (!chapters.length) throw new Error('Không tìm thấy nội dung chương có thể đọc trong EPUB');
  return chapters;
}

async function parseStoryUploadFile(file, options = {}) {
  if (!file || !file.buffer) {
    throw new Error('Missing upload file');
  }

  if (path.extname(file.originalname || '').toLowerCase() === '.epub') {
    return parseEpubToChapters(file.buffer);
  }

  const text = decodeTextBuffer(file.buffer);
  const defaultTitle = sanitizeTitleFromFilename(file.originalname);
  const chapters = parseStoryTextToChapters(text, {
    splitChapters: options.splitChapters,
    singleTitle: options.singleTitle || defaultTitle,
  });

  if (!chapters.length) {
    throw new Error('Cannot extract chapter content from file');
  }

  return chapters;
}

module.exports = {
  parseEpubToChapters,
  parseStoryTextToChapters,
  parseStoryUploadFile,
};
