const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('Auth API', () => {
  beforeAll(async () => {
    // connect to in-memory mongo or test db if configured
    // For brevity: expecting test env provides MONGODB_URI_TEST
    const uri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('POST /api/auth/login returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '' });
    expect(res.statusCode).toBe(400);
  });
});

