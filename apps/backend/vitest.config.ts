import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    testTimeout: 15000,
    setupFiles: ['./vitest.setup.ts'],
  },
});
