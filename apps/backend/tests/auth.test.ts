import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { getTestBearerToken } from './helpers/testToken';

const CANDIDATE_ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_ID = '44444444-4444-4444-8444-444444444444';

describe('Auth & Health Endpoints', () => {
  let candidateToken: string;
  let adminToken: string;

  beforeAll(async () => {
    candidateToken = await getTestBearerToken(
      'candidate.demo@antigravity.dev',
      'password123',
      CANDIDATE_ID
    );
    adminToken = await getTestBearerToken(
      'admin.demo@antigravity.dev',
      'password123',
      ADMIN_ID
    );
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
      .set('Authorization', candidateToken);

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('candidate');
    expect(res.body.profile.name).toBe('Alex Candidate');
  });

  // Regression test: a candidate must never be able to change their own (or anyone
  // else's) role. This endpoint previously allowed any authenticated user to set
  // `role` on their own account with no authorization check whatsoever.
  it('PUT /api/v1/auth/role should return 403 when called by a non-admin user', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', candidateToken)
      .send({ userId: CANDIDATE_ID, role: 'admin' });

    expect(res.status).toBe(403);
  });

  it('PUT /api/v1/auth/role should allow an admin to change another user\'s role', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', adminToken)
      .send({ userId: CANDIDATE_ID, role: 'recruiter' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('recruiter');

    // Reset back to candidate for subsequent tests
    await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', adminToken)
      .send({ userId: CANDIDATE_ID, role: 'candidate' });
  });

  it('PUT /api/v1/auth/role should fail with 400 on invalid role string (Zod validation)', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', adminToken)
      .send({ userId: CANDIDATE_ID, role: 'super-hacker' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PUT /api/v1/auth/role should fail with 400 when userId is missing', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', adminToken)
      .send({ role: 'candidate' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('PUT /api/v1/auth/role should return 404 for a non-existent target user', async () => {
    const res = await request(app)
      .put('/api/v1/auth/role')
      .set('Authorization', adminToken)
      .send({ userId: '99999999-9999-4999-8999-999999999999', role: 'candidate' });

    expect(res.status).toBe(404);
  });
});
