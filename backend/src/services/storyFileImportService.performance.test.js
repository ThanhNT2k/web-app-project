const { parseStoryTextToChapters } = require('./storyFileImportService');

describe('story import performance guardrails', () => {
  it('parses 1,000 chapters within a practical unit-test budget', () => {
    const source = Array.from(
      { length: 1000 },
      (_, index) => `Chương ${index + 1}: Tiêu đề ${index + 1}\nNội dung ${index + 1}.`,
    ).join('\n\n');

    const startedAt = Date.now();
    const chapters = parseStoryTextToChapters(source);
    const elapsed = Date.now() - startedAt;

    expect(chapters).toHaveLength(1000);
    expect(chapters[999]).toEqual({ title: 'Tiêu đề 1000', content: 'Nội dung 1000.' });
    expect(elapsed).toBeLessThan(2000);
  });
});
