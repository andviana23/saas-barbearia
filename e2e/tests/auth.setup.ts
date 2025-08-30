// Teste de setup de autenticação para gerar storageState reutilizado pelos demais projetos
import { test } from '../fixtures';
import fs from 'fs';
import path from 'path';

test.describe('Auth Setup', () => {
  test('criar storage state autenticado', async ({ authenticatedPage }) => {
    const storageDir = path.join(process.cwd(), 'e2e', 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    await authenticatedPage.context().storageState({ path: path.join(storageDir, 'auth.json') });
    console.log('✅ auth.setup.ts: storage state gerado em e2e/storage/auth.json');
  });
});
