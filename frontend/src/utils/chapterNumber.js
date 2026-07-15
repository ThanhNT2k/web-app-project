export function getNextChapterNumber(chapters = [], fallbackTotal = 0) {
  const validChapterNumbers = chapters
    .map((chapter) => Number(chapter?.chapter_number))
    .filter((chapterNumber) => Number.isInteger(chapterNumber) && chapterNumber > 0);

  const numericFallback = Number(fallbackTotal);
  const safeFallback = Number.isInteger(numericFallback) && numericFallback > 0
    ? numericFallback
    : 0;

  return Math.max(safeFallback, 0, ...validChapterNumbers) + 1;
}
