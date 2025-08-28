import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  try {
    // Cleanup test database if it was started
    if (process.env.START_TEST_DB === 'true') {
      console.log('📦 Stopping test database...');
      await execAsync('docker-compose -f docker-compose.test.yml down -v');
    }

    console.log('✅ Test environment cleanup complete!');
  } catch (error) {
    console.error('⚠️  Warning: Failed to cleanup test environment:', error);
    // Don't fail the process as tests might have already completed successfully
  }
}
