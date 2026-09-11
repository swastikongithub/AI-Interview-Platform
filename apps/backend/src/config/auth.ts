import dotenv from 'dotenv';
dotenv.config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'dev-super-secret-jwt-key-do-not-use-in-prod',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '24h',
  demoMode: process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_URL,
};
