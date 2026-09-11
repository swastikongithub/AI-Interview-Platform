import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { DEMO_ACCOUNTS_LIST } from '../apps/backend/src/config/demoAccounts';

// Load environment variables from apps/backend/.env
dotenv.config({ path: path.resolve(__dirname, '../apps/backend/.env') });

async function seedDemoUsers() {
  console.log('--- Starting Local Demo Users Seed via Supabase Auth Admin API ---');

  // 1. Structural exclusion from staging/production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: seed-demo-users.ts cannot be run in production environment.');
  }

  const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  if (!url.includes('127.0.0.1') && !url.includes('localhost')) {
    throw new Error(
      `FATAL: seed-demo-users.ts can only run against local Supabase instance (localhost/127.0.0.1). Detected URL: ${url}`
    );
  }

  // 2. Require service-role key from environment (no hardcoded fallbacks)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'FATAL: SUPABASE_SERVICE_ROLE_KEY is required in environment to seed demo users.'
    );
  }

  const supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 3. Create or update each of the 4 demo accounts using Admin API
  for (const account of DEMO_ACCOUNTS_LIST) {
    console.log(`Seeding auth user for role [${account.role}] (${account.email})...`);

    // First check if user exists by listing users or creating directly
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      id: account.id,
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        role: account.role,
        name: account.label,
      },
    });

    if (createError) {
      if (
        createError.message.includes('already been registered') ||
        createError.message.includes('already exists') ||
        createError.status === 422 ||
        createError.status === 400
      ) {
        console.log(`User ${account.email} already exists. Updating password & attributes...`);
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          account.id,
          {
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: {
              role: account.role,
              name: account.label,
            },
          }
        );
        if (updateError) {
          console.error(`Failed to update existing user ${account.email}:`, updateError.message);
        } else {
          console.log(`[SUCCESS] Updated existing auth user: ${updateData.user.email} (${updateData.user.id})`);
        }
      } else {
        console.error(`[ERROR] Failed to create auth user ${account.email}:`, createError.message);
      }
    } else {
      console.log(`[SUCCESS] Created new auth user: ${createData.user.email} (${createData.user.id})`);
    }
  }

  console.log('--- Demo Users Seed Completed Successfully ---');
}

seedDemoUsers().catch((err) => {
  console.error('Fatal error during demo user seed:', err);
  process.exit(1);
});
