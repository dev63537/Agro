const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('Ledger tests', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('GET /api/ledger should return 401 without auth', async () => {
    const res = await request(app).get('/api/ledger/someid/2025');
    expect(res.statusCode).toBe(401);
  });
});
