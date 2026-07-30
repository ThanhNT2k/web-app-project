const express = require('express');
const request = require('supertest');
const { uploadCover } = require('./upload');

function app() {
  const instance = express();
  instance.post('/cover', uploadCover.single('cover'), (req, res) => {
    res.status(200).json({ success: true, name: req.file.originalname });
  });
  instance.use((error, _req, res, _next) => {
    res.status(400).json({ success: false, code: error.code, message: error.message });
  });
  return instance;
}

describe('cover upload security', () => {
  it.each([
    ['cover.jpg', 'image/jpeg'],
    ['cover.png', 'image/png'],
    ['cover.webp', 'image/webp'],
  ])('accepts supported image %s', async (filename, contentType) => {
    const res = await request(app()).post('/cover').attach(
      'cover', Buffer.from('image bytes'), { filename, contentType },
    );
    expect(res.status).toBe(200);
  });

  it('rejects a script presented as a text file', async () => {
    const res = await request(app()).post('/cover').attach(
      'cover', Buffer.from('<script>alert(1)</script>'),
      { filename: '../attack.svg', contentType: 'text/html' },
    );
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects an image larger than 5 MB', async () => {
    const res = await request(app()).post('/cover').attach(
      'cover', Buffer.alloc((5 * 1024 * 1024) + 1),
      { filename: 'large.png', contentType: 'image/png' },
    );
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('LIMIT_FILE_SIZE');
  });
});
