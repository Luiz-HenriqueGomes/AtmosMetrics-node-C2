import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

describe('Auth Endpoints — Integration', () => {
  let token: string;

  beforeAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.reading.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();
  });

  // Test 1: Register with success
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body.user).toHaveProperty('role', 'USER');
    // Password must NOT appear in response
    expect(res.body.user).not.toHaveProperty('password');
    token = res.body.token;
  });

  // Test 2: Register fails with duplicate email
  it('should fail to register duplicate user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(400);
  });

  // Test 3: Register fails with short password (validation)
  it('should fail to register with short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'new@example.com',
      password: '123',
    });
    expect(res.statusCode).toEqual(400);
  });

  // Test 4: Login with success
  it('should login an existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('role', 'USER');
    // Password must NOT appear in response
    expect(res.body.user).not.toHaveProperty('password');
  });

  // Test 5: Login fails with wrong password
  it('should fail with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrong',
    });
    expect(res.statusCode).toEqual(401);
  });

  // Test 6: Login fails with non-existent email
  it('should fail with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toEqual(401);
  });

  // Test 7: Access without token returns 401
  it('should return 401 when accessing protected route without token', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.statusCode).toEqual(401);
  });

  // Test 8: Access with invalid token returns 401
  it('should return 401 when accessing protected route with invalid token', async () => {
    const res = await request(app)
      .get('/api/stations')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toEqual(401);
  });

  // Test 9: GET /auth/me returns user data
  it('should return user data from GET /auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('role', 'USER');
    // Password must NEVER appear
    expect(res.body).not.toHaveProperty('password');
  });

  // Test 10: GET /auth/me without token returns 401
  it('should return 401 for GET /auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toEqual(401);
  });
});
