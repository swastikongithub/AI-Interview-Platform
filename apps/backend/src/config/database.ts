import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseEnv = process.env.SUPABASE_ENV || 'local';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (supabaseUrl && !supabaseServiceRoleKey) {
  throw new Error(
    'FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is required when SUPABASE_URL is defined. No hardcoded fallback is permitted.'
  );
}

export const databaseConfig = {
  env: supabaseEnv,
  url: supabaseUrl,
  serviceRoleKey: supabaseServiceRoleKey,
  anonKey: supabaseAnonKey,
  isRealSupabase: Boolean(
    supabaseUrl &&
      supabaseServiceRoleKey &&
      supabaseServiceRoleKey !== 'mock_key'
  ),
};

/**
 * Server-side privileged client for admin-level operations that bypass RLS.
 * MUST ONLY be used for trusted internal operations.
 */
export const supabaseAdmin: SupabaseClient | null = databaseConfig.isRealSupabase
  ? createClient(databaseConfig.url, databaseConfig.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/**
 * User-scoped client factory that uses the anon key + user JWT.
 * Guarantees that Postgres Row Level Security (RLS) policies are enforced.
 */
export const createAnonClient = (accessToken?: string): SupabaseClient | null => {
  if (!databaseConfig.isRealSupabase || !databaseConfig.anonKey) {
    return null;
  }
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return createClient(databaseConfig.url, databaseConfig.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers },
  });
};
