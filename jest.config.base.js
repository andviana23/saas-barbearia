// Config base compartilhada (evita perder propriedades quando next/jest retorna função assíncrona)
module.exports = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/**/index.ts',
    '!src/**/types/*',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
    '!src/actions/agendamentos.impl.ts',
  ],
  testEnvironmentOptions: { customExportConditions: [''] },
  transform: {
    '^.+\\.(ts|tsx)$': '<rootDir>/scripts/jest/transformers/stripUseServerTransformer.js',
    // Pass extra transformer para futuras extensões (coverage server actions)
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
