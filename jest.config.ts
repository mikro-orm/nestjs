import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  testTimeout: 30000,
  preset: 'ts-jest',
  collectCoverage: false,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  modulePathIgnorePatterns: [
    'dist/package.json',
    '<rootDir>/package.json',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tests/tsconfig.json',
    },
  },
};

export default config;
