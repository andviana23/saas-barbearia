// Script para debugar problemas de autenticação
console.log('=== DEBUG AUTENTICAÇÃO ===');

// Verificar variáveis de ambiente
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('E2E_MODE:', process.env.E2E_MODE);
console.log(
  'NEXT_PUBLIC_SUPABASE_URL:',
  process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
);
console.log(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA',
);

// Verificar se há problemas com imports ou configurações
console.log('=== FIM DEBUG ===');
