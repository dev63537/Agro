const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('Billing flow', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('POST /api/billing without auth should be 401', async () => {
    const res = await request(app).post('/api/billing').send({});
    expect(res.statusCode).toBe(401);
  });
});
