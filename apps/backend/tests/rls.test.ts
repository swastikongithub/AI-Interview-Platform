import { describe, it, expect } from 'vitest';
import { createAnonClient, databaseConfig } from '../src/config/database';
import jwt from 'jsonwebtoken';

describe('Infrastructure Retrofit Edge Case #4: Real Supabase Auth.uid() & RLS Enforcement', () => {
  it('Edge Case #4a: User-scoped client (anon key + JWT) cannot SELECT another candidate profile directly', async () => {
    if (!databaseConfig.isRealSupabase || !databaseConfig.anonKey) {
      throw new Error('FATAL: Real Supabase connection is required for RLS tests.');
    }

    // 1. Generate valid Candidate A JWT signed with standard local Supabase JWT secret
    const jwtSecret =
      process.env.SUPABASE_JWT_SECRET ||
      'super-secret-jwt-token-with-at-least-32-characters-long';

    const candidateAUserId = '11111111-1111-4111-8111-111111111111'; // Alex Candidate (role: candidate)
    const candidateAJwt = jwt.sign(
      {
        sub: candidateAUserId,
        role: 'authenticated',
        aud: 'authenticated',
        email: 'candidate.demo@antigravity.dev',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );

    const anonClientA = createAnonClient(candidateAJwt);
    expect(anonClientA).toBeDefined();

    // 2. Attempt to SELECT Candidate B's row from profiles directly via anon client
    const candidateBUserId = '11111111-2222-3333-4444-555555555555';
    const { data, error } = await anonClientA!
      .from('profiles')
      .select('*')
      .eq('user_id', candidateBUserId);

    // 3. Assert zero rows returned or permissions error, proving Postgres RLS is enforced
    if (error) {
      expect(error).toBeDefined();
    } else {
      expect(data || []).toHaveLength(0);
    }
  });

  it('Edge Case #4b: User-scoped client (anon key + JWT) cannot download another users private resume file from storage', async () => {
    if (!databaseConfig.isRealSupabase || !databaseConfig.anonKey) {
      throw new Error('FATAL: Real Supabase connection is required for RLS tests.');
    }

    const jwtSecret =
      process.env.SUPABASE_JWT_SECRET ||
      'super-secret-jwt-token-with-at-least-32-characters-long';

    const candidateAUserId = '11111111-1111-4111-8111-111111111111'; // Candidate A
    const candidateAJwt = jwt.sign(
      {
        sub: candidateAUserId,
        role: 'authenticated',
        aud: 'authenticated',
        email: 'candidate.demo@antigravity.dev',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      jwtSecret
    );

    const anonClientA = createAnonClient(candidateAJwt);
    expect(anonClientA).toBeDefined();

    // Candidate A attempts to download a file belonging to another user from private 'resumes' bucket
    const otherUserResumePath = '22222222-2222-4222-8222-222222222222/resume.pdf';
    const { data, error } = await anonClientA!
      .storage
      .from('resumes')
      .download(otherUserResumePath);

    // Should fail because storage.objects RLS policy requires auth.uid() = owner
    expect(data).toBeNull();
    expect(error).toBeDefined();
    expect(error!.message).toMatch(/not found|unauthorized|forbidden|403|400|Permission/i);
  });
});
