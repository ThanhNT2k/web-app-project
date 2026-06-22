const path = require('path');

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
  const cleaned = (matchedTitle || '').trim().replace(/^[:\-\s]+/, '').trim();
  return cleaned || `Chuong ${fallbackIndex}`;
}

function normalizeChapterContent(content) {
  return (content || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseChapterSections(text) {
  const lines = text.split('\n');
  const chapterHeaderRegex = /^\s{0,8}(?:[-*+]\s*)?(?:#{1,6}\s*)?(?:chuong|chương|chapter)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:[:.)\-]\s*)?(.*)$/i;
  const sections = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(chapterHeaderRegex);
    if (!match) continue;

    sections.push({
      lineIndex: i,
      chapterNumber: (match[1] || '').trim(),
      titleHint: (match[2] || '').trim(),
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

function parseStoryUploadFile(file, options = {}) {
  if (!file || !file.buffer) {
    throw new Error('Missing upload file');
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
  parseStoryTextToChapters,
  parseStoryUploadFile,
};
