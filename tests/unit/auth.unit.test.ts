import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../../src/utils/auth';

describe('Auth Helpers — Unit Tests', () => {
  // Test 1: Hash is different from plain text
  it('should hash password differently from plain text', async () => {
    const password = 'mySecret123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  // Test 2: comparePassword returns true for correct password
  it('should return true when comparing correct password', async () => {
    const password = 'mySecret123';
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });

  // Test 3: comparePassword returns false for incorrect password
  it('should return false when comparing incorrect password', async () => {
    const password = 'mySecret123';
    const hash = await hashPassword(password);
    const result = await comparePassword('wrongPassword', hash);

    expect(result).toBe(false);
  });

  // Test 4: generateToken returns a non-empty string
  it('should generate a non-empty JWT token', () => {
    const token = generateToken('user-123');

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  // Test 5: verifyToken decodes the correct payload
  it('should verify token and return correct userId', () => {
    const userId = 'user-abc-456';
    const token = generateToken(userId);
    const decoded = verifyToken(token);

    expect(decoded).toHaveProperty('userId', userId);
  });

  // Test 6: verifyToken throws on invalid token
  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
