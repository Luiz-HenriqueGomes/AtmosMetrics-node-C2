import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../src/schemas/auth.schema.js';
import { createStationSchema } from '../../src/schemas/station.schema.js';
import { createReadingSchema } from '../../src/schemas/reading.schema.js';

describe('Zod Schema Validations — Unit Tests', () => {
  // Test 1: Register schema accepts valid input
  it('should accept valid register input', () => {
    const result = registerSchema.safeParse({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      },
    });

    expect(result.success).toBe(true);
  });

  // Test 2: Register schema rejects invalid email
  it('should reject register with invalid email', () => {
    const result = registerSchema.safeParse({
      body: {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'password123',
      },
    });

    expect(result.success).toBe(false);
  });

  // Test 3: Register schema rejects short password
  it('should reject register with short password', () => {
    const result = registerSchema.safeParse({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      },
    });

    expect(result.success).toBe(false);
  });

  // Test 4: Login schema accepts valid input
  it('should accept valid login input', () => {
    const result = loginSchema.safeParse({
      body: {
        email: 'john@example.com',
        password: 'password123',
      },
    });

    expect(result.success).toBe(true);
  });

  // Test 5: Login schema rejects missing email
  it('should reject login without email', () => {
    const result = loginSchema.safeParse({
      body: {
        password: 'password123',
      },
    });

    expect(result.success).toBe(false);
  });

  // Test 6: Station schema accepts valid input
  it('should accept valid station input', () => {
    const result = createStationSchema.safeParse({
      body: {
        name: 'Station Alpha',
        location: 'Rooftop',
      },
    });

    expect(result.success).toBe(true);
  });

  // Test 7: Station schema rejects missing name
  it('should reject station without name', () => {
    const result = createStationSchema.safeParse({
      body: {
        location: 'Rooftop',
      },
    });

    expect(result.success).toBe(false);
  });

  // Test 8: Reading schema accepts valid input
  it('should accept valid reading input', () => {
    const result = createReadingSchema.safeParse({
      body: {
        temperature: 25.5,
        humidity: 60,
        stationId: 'station-123',
      },
    });

    expect(result.success).toBe(true);
  });

  // Test 9: Reading schema rejects missing temperature
  it('should reject reading without temperature', () => {
    const result = createReadingSchema.safeParse({
      body: {
        humidity: 60,
        stationId: 'station-123',
      },
    });

    expect(result.success).toBe(false);
  });
});
