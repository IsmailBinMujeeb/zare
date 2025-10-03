import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/tests/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/node_modules/**',
        './packages/zare/lib/index.ts',
        './packages/zare/lib/config.ts',
        './packages/zare/lib/utils/shared.ts',
        './packages/cli/**',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
