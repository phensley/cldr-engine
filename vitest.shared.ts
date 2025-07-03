import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 50000,
    include: ['**/__tests__/**/*.test.ts'],
    environment: 'node',
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['__benchmarks__/**', 'tztool/**', 'scripts/**'],
      provider: 'istanbul',
    },
  },
});
