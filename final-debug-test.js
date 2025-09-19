// Teste final para identificar diferenças entre script e interface
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 TESTE FINAL - Comparando Script vs Interface\n');

async function finalTest() {
  try {
    // 1. Testar com createClient (como no script que funciona)
    console.log('📋 1. Testando com createClient (script que funciona)...');
    const supabaseScript = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data: scriptData, error: scriptError } = await supabaseScript.auth.signInWithPassword({
      email: 'andrey@tratodebarbados.com.br',
      password: '@Aa30019258'
    });
    
    if (scriptError) {
      console.error('❌ Script falhou:', scriptError.message);
    } else {
      console.log('✅ Script funcionou! User:', scriptData.user?.email);
    }
    
    // 2. Testar com createBrowserClient (como na interface)
    console.log('\n📋 2. Testando com createBrowserClient (interface)...');
    
    // Simular ambiente de navegador
    global.window = {
      location: { origin: 'http://localhost:3001' },
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      },
      sessionStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      }
    };
    
    global.document = {
      cookie: ''
    };
    
    try {
      const { createBrowserClient } = require('@supabase/ssr');
      
      // Configurar cookies mock
      const supabaseBrowser = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get: () => null,
            set: () => {},
            remove: () => {}
          }
        }
      );
      
      const { data: browserData, error: browserError } = await supabaseBrowser.auth.signInWithPassword({
        email: 'andrey@tratodebarbados.com.br',
        password: '@Aa30019258'
      });
      
      if (browserError) {
        console.error('❌ Browser client falhou:', browserError.message);
      } else {
        console.log('✅ Browser client funcionou! User:', browserData.user?.email);
      }
      
    } catch (browserClientError) {
      console.error('❌ Erro ao criar browser client:', browserClientError.message);
    }
    
    // 3. Verificar variáveis de ambiente
    console.log('\n📋 3. Verificando variáveis de ambiente...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
    console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');
    
    // 4. Testar conectividade
    console.log('\n📋 4. Testando conectividade...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    });
    
    console.log('Status da API:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

finalTest();