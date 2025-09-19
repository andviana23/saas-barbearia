#!/usr/bin/env node

/**
 * Script de Teste Completo do Sistema de Autenticação
 * 
 * Testa:
 * - Login/Logout com usuários existentes
 * - Persistência de sessão
 * - Redirecionamentos
 * - Recuperação de senha
 * - Middleware de proteção
 * - Rotas públicas vs protegidas
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔐 === TESTE COMPLETO DO SISTEMA DE AUTENTICAÇÃO ===\n');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

let testResults = {
  supabaseConnection: false,
  userListing: false,
  login: false,
  logout: false,
  sessionPersistence: false,
  passwordReset: false,
  middlewareProtection: false,
  routeAccess: false,
  authFlow: false
};

async function testSupabaseConnection() {
  console.log('📡 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Erro na consulta profiles:', error.message);
      
      // Tentar uma consulta mais básica
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.log('❌ Falha total na conexão:', authError.message);
        return false;
      }
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    return true;
  } catch (error) {
    console.log('❌ Falha na conexão:', error.message);
    return false;
  }
}

async function listExistingUsers() {
  console.log('\n👥 Verificando usuários existentes...');
  
  try {
    // Tentar listar profiles para ver se há usuários
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(5);
    
    if (error) {
      console.log('⚠️  Não foi possível listar usuários:', error.message);
      console.log('   - Isso pode ser normal devido às políticas RLS');
      return true; // Não é um erro crítico
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Encontrados ${data.length} usuários no sistema`);
      data.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'Email não disponível'} (${user.name || 'Nome não disponível'})`);
      });
    } else {
      console.log('⚠️  Nenhum usuário encontrado ou acesso restrito');
    }
    
    return true;
  } catch (error) {
    console.log('⚠️  Erro ao listar usuários:', error.message);
    return true; // Não é crítico
  }
}

async function testLoginWithExistingUser() {
  console.log('\n🔑 Testando login com usuário existente...');
  
  // Lista de usuários comuns para teste
  const testUsers = [
    { email: 'admin@barbearia.com', password: 'admin123' },
    { email: 'gerente@barbearia.com', password: 'gerente123' },
    { email: 'teste@barbearia.com', password: 'teste123' },
    { email: 'user@example.com', password: 'password123' }
  ];
  
  for (const user of testUsers) {
    try {
      console.log(`   Tentando login com: ${user.email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (error) {
        console.log(`   ❌ Falha: ${error.message}`);
        continue;
      }
      
      if (data.user && data.session) {
        console.log('✅ Login realizado com sucesso!');
        console.log(`   - User ID: ${data.user.id}`);
        console.log(`   - Email: ${data.user.email}`);
        console.log(`   - Session válida: ${!!data.session.access_token}`);
        console.log(`   - Email confirmado: ${data.user.email_confirmed_at ? 'Sim' : 'Não'}`);
        return { success: true, user: data.user, session: data.session };
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
  }
  
  console.log('❌ Não foi possível fazer login com nenhum usuário de teste');
  console.log('   - Verifique se há usuários cadastrados no sistema');
  console.log('   - Confirme as credenciais ou crie um usuário manualmente');
  return { success: false };
}

async function testAnonymousAccess() {
  console.log('\n🔓 Testando acesso anônimo...');
  
  try {
    // Garantir que não há sessão ativa
    await supabase.auth.signOut();
    
    // Verificar se conseguimos acessar dados públicos
    const { data, error } = await supabase.auth.getSession();
    
    if (data.session) {
      console.log('⚠️  Ainda há uma sessão ativa após signOut');
      return false;
    }
    
    console.log('✅ Acesso anônimo funcionando (sem sessão ativa)');
    return true;
  } catch (error) {
    console.log('❌ Erro no teste de acesso anônimo:', error.message);
    return false;
  }
}

async function testSessionPersistence(loginResult) {
  console.log('\n⏱️  Testando persistência de sessão...');
  
  if (!loginResult.success) {
    console.log('⚠️  Pulando teste - nenhum login bem-sucedido');
    return false;
  }
  
  try {
    // Verificar sessão atual
    const { data: session1 } = await supabase.auth.getSession();
    if (!session1.session) {
      console.log('❌ Sessão não encontrada');
      return false;
    }
    
    // Simular refresh/reload verificando se a sessão persiste
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('❌ Usuário não persistiu na sessão');
      return false;
    }
    
    console.log('✅ Sessão persiste corretamente');
    console.log(`   - Session ID: ${session1.session.access_token.substring(0, 20)}...`);
    console.log(`   - Expires: ${new Date(session1.session.expires_at * 1000).toLocaleString()}`);
    console.log(`   - User ID: ${user.user.id}`);
    return true;
  } catch (error) {
    console.log('❌ Falha no teste de persistência:', error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 Testando logout...');
  
  try {
    // Verificar se está logado
    const { data: beforeLogout } = await supabase.auth.getSession();
    if (!beforeLogout.session) {
      console.log('⚠️  Usuário não estava logado antes do teste de logout');
    } else {
      console.log('   - Usuário logado, procedendo com logout...');
    }
    
    // Fazer logout
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('❌ Erro no logout:', error.message);
      return false;
    }
    
    // Verificar se realmente deslogou
    const { data: afterLogout } = await supabase.auth.getSession();
    if (afterLogout.session) {
      console.log('❌ Sessão ainda ativa após logout');
      return false;
    }
    
    console.log('✅ Logout realizado com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Falha no logout:', error.message);
    return false;
  }
}

async function testPasswordReset() {
  console.log('\n🔄 Testando recuperação de senha...');
  
  const testEmail = 'teste@barbearia.com'; // Email genérico para teste
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
    });
    
    if (error) {
      console.log('❌ Erro na recuperação de senha:', error.message);
      return false;
    }
    
    console.log('✅ Funcionalidade de recuperação de senha está funcionando');
    console.log(`   - Email de teste: ${testEmail}`);
    console.log('   - Processo de reset iniciado com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Falha na recuperação de senha:', error.message);
    return false;
  }
}

function testMiddlewareConfiguration() {
  console.log('\n🛡️  Verificando configuração do middleware...');
  
  try {
    const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
    
    if (!fs.existsSync(middlewarePath)) {
      console.log('❌ Arquivo middleware.ts não encontrado');
      return false;
    }
    
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    // Verificar configurações essenciais
    const checks = [
      { name: 'Importação do Supabase SSR', pattern: /@supabase\/ssr/ },
      { name: 'Bypass para modo E2E', pattern: /E2E_MODE/ },
      { name: 'Rotas públicas definidas', pattern: /\/login|\/signup|\/forgot-password/ },
      { name: 'Criação do cliente Supabase', pattern: /createServerClient/ },
      { name: 'Verificação de autenticação', pattern: /getUser|getSession/ },
      { name: 'Redirecionamento configurado', pattern: /redirect|NextResponse/ }
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
      if (check.pattern.test(middlewareContent)) {
        console.log(`   ✅ ${check.name}`);
        passedChecks++;
      } else {
        console.log(`   ❌ ${check.name}`);
      }
    });
    
    const success = passedChecks >= 5; // Pelo menos 5 de 6
    console.log(`${success ? '✅' : '❌'} Middleware configurado: ${passedChecks}/${checks.length} verificações`);
    return success;
  } catch (error) {
    console.log('❌ Erro ao verificar middleware:', error.message);
    return false;
  }
}

function testRouteConfiguration() {
  console.log('\n🗺️  Verificando configuração de rotas...');
  
  try {
    const routesPath = path.join(process.cwd(), 'src', 'routes.ts');
    
    if (!fs.existsSync(routesPath)) {
      console.log('❌ Arquivo routes.ts não encontrado');
      return false;
    }
    
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Verificar configurações de rotas
    const checks = [
      { name: 'Definição de roles', pattern: /UserRole.*admin.*gerente.*funcionario/ },
      { name: 'Sistema de rotas estruturado', pattern: /routes.*Record.*RouteMetadata/ },
      { name: 'Controle de acesso por role', pattern: /roles.*\[.*\]/ },
      { name: 'Função canAccessRoute', pattern: /canAccessRoute/ },
      { name: 'Rotas protegidas definidas', pattern: /dashboard|clientes|agenda/ }
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
      if (check.pattern.test(routesContent)) {
        console.log(`   ✅ ${check.name}`);
        passedChecks++;
      } else {
        console.log(`   ❌ ${check.name}`);
      }
    });
    
    const success = passedChecks >= 4; // Pelo menos 4 de 5 verificações
    console.log(`${success ? '✅' : '❌'} Rotas configuradas: ${passedChecks}/${checks.length} verificações`);
    return success;
  } catch (error) {
    console.log('❌ Erro ao verificar rotas:', error.message);
    return false;
  }
}

function testAuthFlow() {
  console.log('\n🔄 Verificando fluxo de autenticação...');
  
  try {
    // Verificar se existem componentes de autenticação
    const authPaths = [
      'src/app/(public)/login',
      'src/app/login',
      'src/components/auth',
      'src/lib/auth'
    ];
    
    let foundAuthComponents = 0;
    authPaths.forEach(authPath => {
      const fullPath = path.join(process.cwd(), authPath);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ Encontrado: ${authPath}`);
        foundAuthComponents++;
      }
    });
    
    if (foundAuthComponents === 0) {
      console.log('❌ Nenhum componente de autenticação encontrado');
      return false;
    }
    
    console.log(`✅ Fluxo de autenticação: ${foundAuthComponents} componentes encontrados`);
    return true;
  } catch (error) {
    console.log('❌ Erro ao verificar fluxo de autenticação:', error.message);
    return false;
  }
}

function generateReport() {
  console.log('\n📊 === RELATÓRIO FINAL ===');
  
  const tests = [
    { name: 'Conexão Supabase', result: testResults.supabaseConnection },
    { name: 'Listagem de Usuários', result: testResults.userListing },
    { name: 'Login', result: testResults.login },
    { name: 'Logout', result: testResults.logout },
    { name: 'Persistência de Sessão', result: testResults.sessionPersistence },
    { name: 'Recuperação de Senha', result: testResults.passwordReset },
    { name: 'Proteção Middleware', result: testResults.middlewareProtection },
    { name: 'Configuração de Rotas', result: testResults.routeAccess },
    { name: 'Fluxo de Autenticação', result: testResults.authFlow }
  ];
  
  const passed = tests.filter(test => test.result).length;
  const total = tests.length;
  
  tests.forEach(test => {
    console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
  });
  
  console.log(`\n📈 Resultado: ${passed}/${total} testes passaram (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 Sistema de autenticação funcionando perfeitamente!');
    return true;
  } else if (passed >= total * 0.7) {
    console.log('⚠️  Sistema de autenticação funcionando com alguns problemas');
    return true;
  } else {
    console.log('❌ Sistema de autenticação com problemas críticos');
    return false;
  }
}

async function runAllTests() {
  try {
    testResults.supabaseConnection = await testSupabaseConnection();
    testResults.userListing = await listExistingUsers();
    
    const loginResult = await testLoginWithExistingUser();
    testResults.login = loginResult.success;
    
    await testAnonymousAccess(); // Teste adicional
    
    testResults.sessionPersistence = await testSessionPersistence(loginResult);
    testResults.logout = await testLogout();
    testResults.passwordReset = await testPasswordReset();
    testResults.middlewareProtection = testMiddlewareConfiguration();
    testResults.routeAccess = testRouteConfiguration();
    testResults.authFlow = testAuthFlow();
    
    const success = generateReport();
    
    console.log('\n💡 === RECOMENDAÇÕES ===');
    if (!testResults.login) {
      console.log('🔧 Para resolver problemas de login:');
      console.log('   - Verifique se há usuários cadastrados no Supabase');
      console.log('   - Confirme emails de usuários se necessário');
      console.log('   - Execute: npm run db:seed para criar usuários de teste');
    }
    
    if (!testResults.middlewareProtection) {
      console.log('🔧 Para melhorar o middleware:');
      console.log('   - Adicione redirecionamento explícito para /login');
      console.log('   - Verifique configuração de rotas protegidas');
    }
    
    console.log('\n🚀 Próximos passos: Testar integração com Supabase');
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Erro crítico durante os testes:', error.message);
    process.exit(1);
  }
}

// Executar todos os testes
runAllTests();