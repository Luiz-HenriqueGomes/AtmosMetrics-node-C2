import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Reading Endpoints — Integration', () => {
  let token: string;
  let otherToken: string;
  let stationId: string;
  let readingId: string;

  beforeAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();

    // Create main user
    const res = await request(app).post('/api/auth/register').send({
      name: 'Reading User',
      email: 'reading@example.com',
      password: 'password123',
    });
    token = res.body.token;

    // Create second user
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Other Reading User',
      email: 'other-reading@example.com',
      password: 'password123',
    });
    otherToken = res2.body.token;

    // Create a station
    const stationRes = await request(app)
      .post('/api/stations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sensor 1',
        location: 'Garden',
      });
    stationId = stationRes.body.id;
  });

  afterAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();
  });

  // Test 1: Create a reading
  it('should create a new reading', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        temperature: 25.5,
        humidity: 60,
        airQuality: 42,
        stationId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('temperature', 25.5);
    readingId = res.body.id;
  });

  // Test 2: Create reading on other user's station → 403
  it('should return 403 when creating reading on another user station', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        temperature: 30,
        humidity: 50,
        stationId,
      });

    expect(res.statusCode).toEqual(403);
  });

  // Test 3: Create reading on non-existent station → 404
  it('should return 404 when creating reading on non-existent station', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        temperature: 30,
        humidity: 50,
        stationId: 'non-existent-id',
      });

    expect(res.statusCode).toEqual(404);
  });

  // Test 4: Get readings by station
  it('should get readings by station', async () => {
    const res = await request(app)
      .get(`/api/readings/station/${stationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test 5: Get reading by ID (with station include)
  it('should get reading by ID with station data included', async () => {
    const res = await request(app)
      .get(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', readingId);
    expect(res.body).toHaveProperty('station');
    expect(res.body.station).toHaveProperty('name', 'Sensor 1');
  });

  // Test 6: Get reading by ID — not found
  it('should return 404 for non-existent reading', async () => {
    const res = await request(app)
      .get('/api/readings/non-existent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });

  // Test 7: Other user tries to get reading → 403
  it('should return 403 when another user tries to access reading', async () => {
    const res = await request(app)
      .get(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toEqual(403);
  });
});
