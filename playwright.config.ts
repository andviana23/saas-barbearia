import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Carregar variáveis de ambiente do .env.test se existir, senão .env.local
config({ path: process.env.CI ? '.env.test' : '.env.local' });

/**
 * Configuração do Playwright para testes E2E
 * Projeto: Sistema Trato - SaaS Barbearia
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Diretório dos testes
  testDir: './e2e/tests',

  // Configurações globais
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  // Executar testes em paralelo dentro de arquivos
  fullyParallel: true,

  // Falha em qualquer teste se algum worker falhar
  forbidOnly: !!process.env.CI,

  // Retry nos CI, mas não localmente
  retries: process.env.CI ? 2 : 0,

  // Workers: limitado no CI, paralelo local
  workers: process.env.CI ? 1 : undefined,

  // Reporter configurado para CI/CD
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // No terminal, usar spec para melhor visualização
    ['line'],
  ],

  // Configurações de teste
  timeout: 30 * 1000, // 30s por teste
  expect: {
    // Timeout para expects
    timeout: 5000,
  },

  use: {
    // Base URL da aplicação
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Trace on first retry
    trace: 'on-first-retry',

    // Screenshot apenas em falha
    screenshot: 'only-on-failure',

    // Video apenas em retry
    video: 'retain-on-failure',

    // Configurações do navegador
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Headers padrão
    extraHTTPHeaders: {
      // Aceitar JSON
      Accept: 'application/json',
    },
  },

  // Projetos para diferentes navegadores
  projects: [
    {
      name: 'auth-setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Desktop Chrome - Principal
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/storage/auth.json',
      },
      dependencies: ['auth-setup'],
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/storage/auth.json',
      },
      dependencies: ['auth-setup'],
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/storage/auth.json',
      },
      dependencies: ['auth-setup'],
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/storage/auth.json',
      },
      dependencies: ['auth-setup'],
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'e2e/storage/auth.json',
      },
      dependencies: ['auth-setup'],
    },

    // Tablet
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
        storageState: 'e2e/storage/auth.json',
      },
      dependencies: ['auth-setup'],
    },
  ],

  // Servidor de desenvolvimento local
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutos para iniciar
        env: {
          NODE_ENV: 'test',
        },
      },

  // Configurações de output
  outputDir: 'test-results/',

  // Configurações de artifacts
  preserveOutput: 'failures-only',
});
