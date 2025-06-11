import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    include: ['**/__tests__/**/*.test.ts'],
    environment: 'node',
    // reporters: ['verbose'],
  },
});
