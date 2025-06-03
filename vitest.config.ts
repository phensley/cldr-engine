import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/cldr-compiler/**',
        'packages/cldr-ext-rbnf/**',
        'packages/cldr-types/**',
        'packages/*/__benchmarks__/**',
        'packages/*/tztool/**',
        'packages/*/scripts/**',
      ],
      provider: 'istanbul',
    },
  },
});
