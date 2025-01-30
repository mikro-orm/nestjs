export default {
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
