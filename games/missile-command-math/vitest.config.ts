import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@arcade-swarm/math-engine': path.resolve(__dirname, '../../shared/math-engine/src/index.ts'),
    },
  },
});
