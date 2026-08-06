export const config = {
  env: (import.meta as any).env.MODE || 'development',
  apiUrl: (import.meta as any).env.VITE_API_URL || 'http://localhost:3000',
};
