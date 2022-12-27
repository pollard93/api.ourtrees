// const path = require('path');

module.exports = {
  preset: 'ts-jest',
  globalSetup: '<rootDir>/setupTestDatabase.ts',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testMatch: [
    '<rootDir>/__tests__/**/*.+(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/__tests__/utils.ts',
    '<rootDir>/__tests__/support',
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
};
