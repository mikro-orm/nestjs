import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  testTimeout: 30000,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tests/tsconfig.json',
      isolatedModules: true,
    }],
  },
  collectCoverage: false,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  modulePathIgnorePatterns: [
    'dist/package.json',
    '<rootDir>/package.json',
  ],
};

export default config;
