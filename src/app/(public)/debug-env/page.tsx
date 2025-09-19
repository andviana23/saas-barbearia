'use client';

import { useEffect, useState } from 'react';

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Verificar variáveis de ambiente no cliente
    const clientEnvs = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    setEnvVars(clientEnvs);
    console.log('🔧 Variáveis de ambiente no cliente:', clientEnvs);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug - Variáveis de Ambiente</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Variáveis no Cliente:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teste de Conexão Supabase:</h2>
        <button
          onClick={async () => {
            try {
              const { createBrowserClient } = await import('@supabase/ssr');
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              );

              console.log('🧪 Testando conexão...');
              const { data, error } = await supabase.auth.getSession();
              console.log('📋 Resultado:', { data, error });

              alert(`Conexão: ${error ? 'ERRO - ' + error.message : 'SUCESSO'}`);
            } catch (error) {
              console.error('❌ Erro:', error);
              alert('ERRO: ' + (error as Error).message);
            }
          }}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Testar Conexão Supabase
        </button>
      </div>

      <div>
        <h2>Teste de Login:</h2>
        <button
          onClick={async () => {
            try {
              const { createBrowserClient } = await import('@supabase/ssr');
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              );

              console.log('🔐 Testando login...');
              const { data, error } = await supabase.auth.signInWithPassword({
                email: 'andrey@tratodebarbados.com.br',
                password: '@Aa30019258',
              });

              console.log('📋 Resultado do login:', { data, error });

              if (error) {
                alert(`ERRO no login: ${error.message}`);
              } else {
                alert(`LOGIN SUCESSO: ${data.user?.email}`);
              }
            } catch (error) {
              console.error('❌ Erro:', error);
              alert('ERRO: ' + (error as Error).message);
            }
          }}
          style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}
        >
          Testar Login
        </button>
      </div>
    </div>
  );
}
