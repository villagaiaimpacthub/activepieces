module.exports = {
  displayName: 'activepieces-sop-tool',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  testTimeout: 30000,
  moduleNameMapping: {
    '^@backend/(.*)$': '<rootDir>/src/backend/$1',
    '^@frontend/(.*)$': '<rootDir>/src/frontend/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@pieces/(.*)$': '<rootDir>/src/pieces/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  // Different configurations for different test types
  projects: [
    // Backend unit tests
    {
      displayName: 'backend-unit',
      testMatch: ['<rootDir>/src/backend/**/*.(test|spec).ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/backend-setup.ts'],
    },
    // Frontend unit tests
    {
      displayName: 'frontend-unit',
      preset: 'jest-preset-angular',
      testMatch: ['<rootDir>/src/frontend/**/*.(test|spec).ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/frontend-setup.ts'],
      testEnvironment: 'jsdom',
    },
    // Integration tests
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.(test|spec).ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/integration-setup.ts'],
      testTimeout: 60000,
    },
    // End-to-end tests
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.(test|spec).ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/e2e-setup.ts'],
      testTimeout: 120000,
    },
  ],
  // Global teardown
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
};