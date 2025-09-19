'use client';

import { useAuthContext } from '@/lib/auth/AuthContext';
import { useEffect } from 'react';

export default function TestAuthPage() {
  const { user, isAuthenticated, loading, signIn } = useAuthContext();

  useEffect(() => {
    console.log('📊 TestAuthPage - Estado atual:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  const handleTestLogin = async () => {
    console.log('🧪 Iniciando teste de login...');
    try {
      const result = await signIn('andrey@tratodebarbados.com.br', '@Aa30019258');
      console.log('✅ Resultado do login:', result);
    } catch (error) {
      console.error('❌ Erro no login:', error);
    }
  };

  if (loading) {
    return <div>Carregando auth...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste de Autenticação</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Estado Atual:</h2>
        <p>
          <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
        </p>
        <p>
          <strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}
        </p>
        <p>
          <strong>Usuário:</strong> {user ? JSON.stringify(user, null, 2) : 'Nenhum'}
        </p>
      </div>

      {!isAuthenticated ? (
        <div>
          <h2>Login de Teste:</h2>
          <button onClick={handleTestLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Testar Login (andrey@tratodebarbados.com.br)
          </button>
        </div>
      ) : (
        <div>
          <h2>Usuário autenticado com sucesso!</h2>
          <p>Bem-vindo, {user?.email}</p>
        </div>
      )}
    </div>
  );
}
