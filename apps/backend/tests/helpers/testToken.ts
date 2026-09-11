import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { databaseConfig } from '../../src/config/database';

const anonClient = databaseConfig.url && databaseConfig.anonKey
  ? createClient(databaseConfig.url, databaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export async function getTestBearerToken(
  email: string = 'candidate.demo@antigravity.dev',
  password: string = 'password123',
  fallbackUserId: string = '11111111-1111-4111-8111-111111111111'
): Promise<string> {
  if (!databaseConfig.isRealSupabase || !anonClient) {
    const secret =
      process.env.SUPABASE_JWT_SECRET ||
      'super-secret-jwt-token-with-at-least-32-characters-long';
    const token = jwt.sign(
      {
        sub: fallbackUserId,
        aud: 'authenticated',
        role: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      secret
    );
    return `Bearer ${token}`;
  }

  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(`Failed to get test access token for ${email}: ${error?.message}`);
  }

  return `Bearer ${data.session.access_token}`;
}
