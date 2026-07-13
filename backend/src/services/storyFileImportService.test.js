const {
  parseEpubToChapters,
  parseStoryTextToChapters,
  parseStoryUploadFile,
} = require('./storyFileImportService');
const JSZip = require('jszip');

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

  it('removes source indexes and chapter markers from generated titles', () => {
    const chapters = parseStoryTextToChapters(`
      #50. Chương 48. Tiểu Liễu
      Nội dung chương 48.

      ## Chương 49: Gặp lại
      Nội dung chương 49.

      #50. Một tiêu đề Markdown
      Nội dung chương kế tiếp.
    `);

    expect(chapters).toEqual([
      { title: 'Tiểu Liễu', content: 'Nội dung chương 48.' },
      { title: 'Gặp lại', content: 'Nội dung chương 49.' },
      { title: 'Một tiêu đề Markdown', content: 'Nội dung chương kế tiếp.' },
    ]);
  });

  it('does not reuse a chapter marker as the chapter title', () => {
    const chapters = parseStoryTextToChapters('Chương 12\nNội dung không có tiêu đề.');
    expect(chapters[0].title).toBe('Chương không tên');
  });

  it('uses the uploaded filename as fallback title', async () => {
    const chapters = await parseStoryUploadFile({
      originalname: 'my_story_chapter.txt',
      buffer: Buffer.from('No heading here'),
    });

    expect(chapters).toEqual([
      { title: 'my story chapter', content: 'No heading here' },
    ]);
  });

  it('extracts EPUB documents in spine order', async () => {
    const zip = new JSZip();
    zip.file('META-INF/container.xml', `
      <container><rootfiles><rootfile full-path="OPS/content.opf" /></rootfiles></container>
    `);
    zip.file('OPS/content.opf', `
      <package>
        <manifest>
          <item id="chapter-1" href="chapters/one.xhtml" media-type="application/xhtml+xml" />
          <item id="chapter-2" href="chapters/two.xhtml" media-type="application/xhtml+xml" />
        </manifest>
        <spine><itemref idref="chapter-2" /><itemref idref="chapter-1" /></spine>
      </package>
    `);
    zip.file('OPS/chapters/one.xhtml', '<html><body><h1>Chương một</h1><p>Nội dung đầu.</p></body></html>');
    zip.file('OPS/chapters/two.xhtml', '<html><body><h1>Chương hai</h1><p>Nội dung sau.</p></body></html>');
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    await expect(parseEpubToChapters(buffer)).resolves.toEqual([
      { title: 'Chương hai', content: 'Nội dung sau.' },
      { title: 'Chương một', content: 'Nội dung đầu.' },
    ]);
  });

  it('throws when uploaded file is missing', async () => {
    await expect(parseStoryUploadFile(null)).rejects.toThrow('Missing upload file');
  });
});
