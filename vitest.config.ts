import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  esbuild: {
    target: 'es2024',
    keepNames: true,
  },
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2024',
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorVersion: '2022-03',
        },
      },
      sourceMaps: true,
    }),
  ],
  test: {
    globals: true,
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*.ts'],
    },
    disableConsoleIntercept: true,
    clearMocks: true,
    isolate: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
