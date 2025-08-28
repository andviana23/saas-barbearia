import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Global teardown para Playwright
 * Limpa dados de teste e arquivos temporários
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando limpeza do ambiente de testes...');

  try {
    // Limpar dados de teste do Supabase (se configurado)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Limpar dados de teste específicos
      // Nota: Em produção, usar schema separado para testes
      try {
        // Limpar agendamentos de teste
        await supabase.from('appointments').delete().like('cliente_nome', '%TESTE%');

        // Limpar clientes de teste
        await supabase.from('clientes').delete().like('nome', '%TESTE%');

        // Limpar profissionais de teste
        await supabase.from('profissionais').delete().like('nome', '%TESTE%');

        console.log('✅ Dados de teste limpos do Supabase');
      } catch (error) {
        console.warn('⚠️ Não foi possível limpar dados de teste:', error);
      }
    }

    // Limpar arquivos temporários
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const e2eStorageDir = path.join(process.cwd(), 'e2e/storage');

    // Limpar diretório de resultados de teste
    if (fs.existsSync(testResultsDir)) {
      fs.rmSync(testResultsDir, { recursive: true, force: true });
      console.log('✅ Diretório test-results limpo');
    }

    // Limpar arquivo de storage de autenticação
    const authFile = path.join(e2eStorageDir, 'auth.json');
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log('✅ Arquivo de autenticação limpo');
    }

    // Limpar screenshots e vídeos de falhas (se houver)
    const screenshotsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      files.forEach((file) => {
        if (file.endsWith('.png') || file.endsWith('.mp4')) {
          fs.unlinkSync(path.join(screenshotsDir, file));
        }
      });
      console.log('✅ Screenshots e vídeos de falhas limpos');
    }

    console.log('✅ Global teardown concluído com sucesso');
  } catch (error) {
    console.error('❌ Erro no global teardown:', error);
    // Não falhar o build por erros de limpeza
  }
}

export default globalTeardown;
