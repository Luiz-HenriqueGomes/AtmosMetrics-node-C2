import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Station Endpoints — Integration', () => {
  let userToken: string;
  let otherUserToken: string;
  let stationId: string;

  beforeAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();

    // Create main user
    const res = await request(app).post('/api/auth/register').send({
      name: 'Station User',
      email: 'station@example.com',
      password: 'password123',
    });
    userToken = res.body.token;

    // Create second user (for ownership tests)
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
    });
    otherUserToken = res2.body.token;
  });

  afterAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();
  });

  // Test 1: Create station
  it('should create a new station', async () => {
    const res = await request(app)
      .post('/api/stations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Main Station',
        location: 'Rooftop',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Main Station');
    stationId = res.body.id;
  });

  // Test 2: List user stations
  it('should get all stations for authenticated user', async () => {
    const res = await request(app)
      .get('/api/stations')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test 3: Get station by ID (with readings included)
  it('should get station by ID with readings included', async () => {
    const res = await request(app)
      .get(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', stationId);
    expect(res.body).toHaveProperty('readings');
    expect(Array.isArray(res.body.readings)).toBe(true);
  });

  // Test 4: Get station by ID — not found
  it('should return 404 for non-existent station', async () => {
    const res = await request(app)
      .get('/api/stations/non-existent-id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(404);
  });

  // Test 5: Update station (owner)
  it('should update station as owner', async () => {
    const res = await request(app)
      .put(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Updated Station',
        location: 'Basement',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Station');
    expect(res.body).toHaveProperty('location', 'Basement');
  });

  // Test 6: Update station — OTHER user tries to edit (ownership → 403)
  it('should return 403 when another user tries to update station', async () => {
    const res = await request(app)
      .put(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        name: 'Hacked Station',
      });

    expect(res.statusCode).toEqual(403);
  });

  // Test 7: Delete station — OTHER user tries to delete (ownership → 403)
  it('should return 403 when another user tries to delete station', async () => {
    const res = await request(app)
      .delete(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.statusCode).toEqual(403);
  });

  // Test 8: USER tries to access ADMIN route (GET /all) → 403
  it('should return 403 when USER tries to access admin route GET /all', async () => {
    const res = await request(app)
      .get('/api/stations/all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
  });

  // Test 9: ADMIN can access GET /all
  it('should allow ADMIN to access GET /all', async () => {
    // Promote user to ADMIN directly in DB
    const user = await prisma.user.findFirst({ where: { email: 'station@example.com' } });
    await prisma.user.update({ where: { id: user!.id }, data: { role: 'ADMIN' } });

    const res = await request(app)
      .get('/api/stations/all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Revert role back to USER
    await prisma.user.update({ where: { id: user!.id }, data: { role: 'USER' } });
  });

  // Test 10: Delete station (owner) — returns 204
  it('should delete station as owner and return 204', async () => {
    const res = await request(app)
      .delete(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(204);
  });

  // Test 11: Get deleted station returns 404
  it('should return 404 after station is deleted', async () => {
    const res = await request(app)
      .get(`/api/stations/${stationId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(404);
  });
});
