import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import config from '../src/config';

describe('Infrastructure Retrofit Edge Cases (1, 2, 3)', () => {
  let originalEnv: string;
  let originalIsRealSupabase: boolean;
  let originalSupabaseAdmin: any;

  beforeEach(() => {
    originalEnv = config.env;
    originalIsRealSupabase = config.database.isRealSupabase;
    originalSupabaseAdmin = config.supabaseAdmin;
  });

  afterEach(() => {
    config.env = originalEnv;
    config.database.isRealSupabase = originalIsRealSupabase;
    config.supabaseAdmin = originalSupabaseAdmin;
  });

  it('Edge Case #1: /ready returns 503 (not 200) in production with broken DB connection', async () => {
    config.env = 'production';
    config.database.isRealSupabase = true;

    // Simulate broken database client where query returns error
    config.supabaseAdmin = {
      from: () => ({
        select: () => ({
          limit: async () => ({
            error: { message: 'connect ECONNREFUSED 127.0.0.1:5432' },
          }),
        }),
      }),
    } as any;

    const response = await request(app).get('/ready');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'unavailable',
      error: 'Service dependencies unreachable',
    });
  });

  it('Edge Case #2: Swagger UI at /api/docs is hard-gated and returns 404 in production/test', async () => {
    const response = await request(app).get('/api/docs');
    expect(response.status).toBe(404);
  });


  it('Edge Case #3: Error responses log server-side and return ONLY errorId to client', async () => {
    const response = await request(app).get('/api/v1/test-error');
    expect(response.status).toBe(500);

    expect(response.body).toHaveProperty('errorId');
    expect(typeof response.body.errorId).toBe('string');
    expect(response.body.message).toBe(
      'An internal server error occurred. Please contact support with this error ID.'
    );
    // Ensure zero sensitive details leaked
    expect(JSON.stringify(response.body)).not.toContain('Sensitive database');
    expect(JSON.stringify(response.body)).not.toContain('/var/www/app');
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('details');
  });
});
