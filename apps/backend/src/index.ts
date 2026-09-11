import 'dotenv/config';
import app from './app';
import { isRealSupabase } from './services/supabase.service';
import { databaseConfig } from './config/database';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 AI Interview Platform Backend running on port ${PORT}`);
  console.log(
    `📦 Database Mode: ${
      isRealSupabase
        ? databaseConfig.env === 'local'
          ? 'Local Supabase CLI (Postgres + Auth)'
          : 'Remote Supabase (PostgreSQL)'
        : 'Local Dev/Demo Mode'
    }`
  );
});

