import dotenv from 'dotenv';
import { authConfig } from './auth';
import { databaseConfig, supabaseAdmin, createAnonClient } from './database';
import { storageConfig } from './storage';
import { redisConfig } from './redis';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT || 4000);

// Fail fast if running in production without required database credentials
if (env === 'production' && !databaseConfig.isRealSupabase) {
  throw new Error(
    'FATAL CONFIG ERROR: NODE_ENV is production but SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are missing or invalid.'
  );
}

export const config = {
  env,
  port,
  auth: authConfig,
  database: databaseConfig,
  storage: storageConfig,
  redis: redisConfig,
  supabaseAdmin,
  createAnonClient,
};

export default config;
