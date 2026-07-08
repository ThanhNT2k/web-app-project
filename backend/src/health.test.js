const request = require('supertest');

jest.mock('./services/moderationService', () => ({
  loadModerationData: jest.fn(),
  moderateContent: jest.fn((content) => ({ isAllowed: true, content })),
}));

const app = require('./app');

describe('GET /health', () => {
  it('returns backend health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'CMC Truyen backend is running',
      environment: 'test',
    });
  });
});
