import { describe, expect, it } from 'vitest';

import { getNextChapterNumber } from './chapterNumber';

describe('getNextChapterNumber', () => {
  it('uses the highest chapter number instead of the chapter count', () => {
    expect(getNextChapterNumber([
      { chapter_number: 50 },
      { chapter_number: 51 },
      { chapter_number: 52 },
    ], 50)).toBe(53);
  });

  it('falls back to the stored chapter count when no chapters are returned', () => {
    expect(getNextChapterNumber([], 50)).toBe(51);
  });

  it('starts at one for a story without chapters', () => {
    expect(getNextChapterNumber([], 0)).toBe(1);
  });
});
