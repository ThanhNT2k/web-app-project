const {
  parseStoryTextToChapters,
  parseStoryUploadFile,
} = require('./storyFileImportService');

describe('storyFileImportService', () => {
  it('splits plain text into chapters from chapter headings', () => {
    const chapters = parseStoryTextToChapters(`
      Chapter 1: The Beginning
      First chapter content.

      Chapter 2 - The Return
      Second chapter content.
    `);

    expect(chapters).toEqual([
      { title: 'The Beginning', content: 'First chapter content.' },
      { title: 'The Return', content: 'Second chapter content.' },
    ]);
  });

  it('returns a single chapter when splitting is disabled', () => {
    const chapters = parseStoryTextToChapters('Line 1\nLine 2', {
      splitChapters: false,
      singleTitle: 'Uploaded Chapter',
    });

    expect(chapters).toEqual([
      { title: 'Uploaded Chapter', content: 'Line 1\nLine 2' },
    ]);
  });

  it('uses the uploaded filename as fallback title', () => {
    const chapters = parseStoryUploadFile({
      originalname: 'my_story_chapter.txt',
      buffer: Buffer.from('No heading here'),
    });

    expect(chapters).toEqual([
      { title: 'my story chapter', content: 'No heading here' },
    ]);
  });

  it('throws when uploaded file is missing', () => {
    expect(() => parseStoryUploadFile(null)).toThrow('Missing upload file');
  });
});
