const env = (import.meta as any).env || {};

export const config = {
  env: env.MODE || 'development',
  apiUrl: env.VITE_API_URL || 'http://localhost:3000',
};

// One-click demo login/role-switching ships with hardcoded, publicly-known credentials
// (see config/demoAccounts.ts) for privileged roles including admin. It must never be
// visible in a production build unless a deployer explicitly opts in. Vite's built-in
// DEV flag keeps it on for `npm run dev` (unchanged local workflow); an explicit env var
// is required to enable it in any built bundle.
export const DEMO_ACCOUNTS_ENABLED: boolean =
  Boolean(env.DEV) || env.VITE_ENABLE_DEMO_ACCOUNTS === 'true';
