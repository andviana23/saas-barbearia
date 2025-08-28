// Config de cobertura reduzida inicial para CI incremental
// Repetimos a base para evitar problemas ao fazer require do config principal (next/jest async)
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  // Adicionamos json-summary para gerar coverage/coverage-summary.json consumido por scripts/verify-coverage.js
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'json-summary'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/**/index.ts',
    '!src/**/types/*',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  // Thresholds baseados no baseline atual (~3.26% stmts, 15% funcs, 33% branches) para permitir incremento progressivo
  coverageThreshold: {
    global: { branches: 30, functions: 10, lines: 3, statements: 3 },
  },
  testEnvironmentOptions: { customExportConditions: [''] },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/e2e/',
    '<rootDir>/tests/e2e/',
  ],
  globalSetup: '<rootDir>/tests/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.ts',
  verbose: true,
  maxWorkers: '50%',
};

module.exports = createJestConfig(config);
