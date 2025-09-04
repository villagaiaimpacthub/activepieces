import { Config } from 'jest';

const config: Config = {
  displayName: 'sop-framework',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/pieces/community/sop-framework',
  testMatch: ['<rootDir>/src/**/*.(test|spec).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ]
};

export default config;