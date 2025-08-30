// next.config.js (ESM)
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita que warnings do ESLint quebrem o build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // (Opcional) Modo estrito do React
  reactStrictMode: true,

  // Configurações do webpack para reduzir warnings
  webpack: (config, { dev }) => {
    if (dev) {
      // Reduzir warnings de strings grandes no desenvolvimento
      config.cache = {
        ...config.cache,
        maxMemoryGenerations: 1,
      };

      // Suprimir warnings específicos de cache
      config.infrastructureLogging = {
        level: 'error',
      };
    }

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: 'saas-barbearia',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
