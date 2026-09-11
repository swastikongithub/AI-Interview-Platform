import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { getTestBearerToken } from './helpers/testToken';

describe('Auth & Health Endpoints', () => {
  let bearerToken: string;

  beforeAll(async () => {
    bearerToken = await getTestBearerToken();
  });

  it('GET /api/v1/health should return healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/auth/me should return 401 Unauthorized when no credentials are provided', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('GET /api/v1/auth/me should return current candidate user and profile when authenticated with Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('candidate');
    expect(res.body.profile.name).toBe('Alex Candidate');
  });

  it('PUT /api/v1/auth/role should update the user role', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', bearerToken)
      .send({ role: 'recruiter' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('recruiter');

    // Reset back to candidate for subsequent tests
    await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', bearerToken)
      .send({ role: 'candidate' });
  });

  it('PUT /api/v1/auth/role should fail with 400 on invalid role string (Zod validation)', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', bearerToken)
      .send({ role: 'super-hacker' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
