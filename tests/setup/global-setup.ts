import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('🚀 Setting up test environment...');

  // Set test environment
  // Garantir NODE_ENV='test' (propriedade pode ser readonly em tipos). Forçamos via delete+assign.
  // NODE_ENV já definido pelo Jest/Next; não forçar redefinição para evitar erro de readonly
  process.env.CI = 'true';

  // Mock environment variables for tests
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:54322/test_db';

  // ASAAS test keys
  process.env.ASAAS_API_KEY = 'test_asaas_key';
  process.env.ASAAS_WEBHOOK_SECRET = 'test_webhook_secret';

  // Other test configurations
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.EMAIL_FROM = 'test@saas-barbearia.com';

  try {
    // Check if we need to start test database
    if (process.env.START_TEST_DB === 'true') {
      console.log('📦 Starting test database...');
      await execAsync('docker-compose -f docker-compose.test.yml up -d');

      // Wait for database to be ready
      console.log('⏳ Waiting for database to be ready...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Run migrations
      console.log('🗃️  Running test migrations...');
      await execAsync('npm run db:migrate:test');
    }

    console.log('✅ Test environment setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    process.exit(1);
  }
}
