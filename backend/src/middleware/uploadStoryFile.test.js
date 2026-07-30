const express = require('express');
const request = require('supertest');

const { uploadStoryFile } = require('./upload');

function createUploadApp() {
  const app = express();
  app.post('/upload', uploadStoryFile.single('file'), (req, res) => {
    res.status(200).json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size,
    });
  });
  app.use((error, _req, res, _next) => {
    res.status(400).json({
      success: false,
      code: error.code || 'INVALID_FILE',
      message: error.message,
    });
  });
  return app;
}

describe('uploadStoryFile middleware', () => {
  const app = createUploadApp();

  it('accepts a valid UTF-8 TXT story file', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('Chương 1\nNội dung truyện.', 'utf8'), {
        filename: 'truyen.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      success: true,
      filename: 'truyen.txt',
    }));
  });

  it('rejects a file with an unsupported extension', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('not a story'), {
        filename: 'truyen.exe',
        contentType: 'application/octet-stream',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('.txt');
  });

  it('rejects a valid extension with an unsupported MIME type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('fake image'), {
        filename: 'truyen.txt',
        contentType: 'image/png',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Định dạng file không hợp lệ');
  });

  it('rejects a story file larger than 25 MB', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.alloc((25 * 1024 * 1024) + 1, 0x61), {
        filename: 'truyen.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      success: false,
      code: 'LIMIT_FILE_SIZE',
    }));
  });
});
