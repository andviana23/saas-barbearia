const nextJest = require('next/jest');
const base = require('./jest.config.base');
const createJestConfig = nextJest({ dir: './' });

// Exporta função async conforme expectativa do Next, mas preserva coverageThreshold aqui.
module.exports = async () => {
  const nextConfig = await createJestConfig(base)();
  return {
    ...nextConfig,
    testMatch: ['**/?(*.)+(test|spec).(ts|tsx)'],
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
    coverageThreshold: {
      global: {
        branches: 40,
        functions: 15,
        lines: 5,
        statements: 5,
      },
    },
  };
};
