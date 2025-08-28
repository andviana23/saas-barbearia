#!/usr/bin/env node

/**
 * Script para executar testes E2E com diferentes configurações
 * Sistema Trato - SaaS Barbearia
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const ENVIRONMENTS = {
  local: {
    baseUrl: 'http://localhost:3000',
    env: '.env.local',
  },
  staging: {
    baseUrl: process.env.STAGING_URL || 'https://staging.trato.com',
    env: '.env.staging',
  },
  production: {
    baseUrl: process.env.PRODUCTION_URL || 'https://trato.com',
    env: '.env.production',
  },
};

const TEST_SUITES = {
  smoke: {
    grep: 'Smoke Tests',
    projects: ['chromium'],
    timeout: '60000',
  },
  critical: {
    grep: 'Agenda|Fila|Financeiro',
    projects: ['chromium', 'firefox'],
    timeout: '120000',
  },
  full: {
    grep: '.*',
    projects: ['chromium', 'firefox', 'webkit'],
    timeout: '300000',
  },
  performance: {
    grep: 'Performance',
    projects: ['chromium'],
    timeout: '600000',
  },
  mobile: {
    grep: 'Smoke Tests',
    projects: ['mobile-chrome', 'mobile-safari'],
    timeout: '120000',
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    environment: 'local',
    suite: 'smoke',
    headless: true,
    workers: undefined,
    retry: 0,
    reporter: 'html',
    debug: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--env':
      case '-e':
        options.environment = nextArg;
        i++;
        break;
      case '--suite':
      case '-s':
        options.suite = nextArg;
        i++;
        break;
      case '--headed':
        options.headless = false;
        break;
      case '--workers':
      case '-w':
        options.workers = parseInt(nextArg);
        i++;
        break;
      case '--retry':
      case '-r':
        options.retry = parseInt(nextArg);
        i++;
        break;
      case '--reporter':
        options.reporter = nextArg;
        i++;
        break;
      case '--debug':
      case '-d':
        options.debug = true;
        options.headless = false;
        options.workers = 1;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🎭 Script de Execução de Testes E2E - Sistema Trato

USAGE:
  node scripts/run-e2e.js [options]

ENVIRONMENTS:
  local      - http://localhost:3000 (padrão)
  staging    - Ambiente de staging
  production - Ambiente de produção

TEST SUITES:
  smoke      - Testes básicos de fumaça (padrão)
  critical   - Fluxos críticos (Agenda, Fila, Financeiro)
  full       - Todos os testes
  performance- Testes de performance
  mobile     - Testes mobile

OPTIONS:
  -e, --env <env>        Ambiente (local|staging|production)
  -s, --suite <suite>    Suíte de testes
  --headed               Executar com interface gráfica
  -w, --workers <num>    Número de workers paralelos
  -r, --retry <num>      Número de tentativas em caso de falha
  --reporter <reporter>  Tipo de relatório (html|json|junit)
  -d, --debug           Modo debug (headed, 1 worker)
  -h, --help            Mostrar esta ajuda

EXAMPLES:
  npm run e2e:local                    # Smoke tests local
  node scripts/run-e2e.js -s critical # Testes críticos
  node scripts/run-e2e.js --debug     # Modo debug
  node scripts/run-e2e.js -e staging -s full --headed
  `);
}

function validateOptions(options) {
  if (!ENVIRONMENTS[options.environment]) {
    console.error(`❌ Ambiente inválido: ${options.environment}`);
    console.error(`Ambientes disponíveis: ${Object.keys(ENVIRONMENTS).join(', ')}`);
    process.exit(1);
  }

  if (!TEST_SUITES[options.suite]) {
    console.error(`❌ Suíte inválida: ${options.suite}`);
    console.error(`Suítes disponíveis: ${Object.keys(TEST_SUITES).join(', ')}`);
    process.exit(1);
  }
}

function setupEnvironment(environment) {
  const envConfig = ENVIRONMENTS[environment];
  const envFile = envConfig.env;

  // Verificar se arquivo de ambiente existe
  if (envFile !== '.env.local' && !fs.existsSync(envFile)) {
    console.warn(`⚠️  Arquivo ${envFile} não encontrado, usando configuração padrão`);
  }

  // Definir variáveis de ambiente
  process.env.PLAYWRIGHT_BASE_URL = envConfig.baseUrl;
  process.env.NODE_ENV = 'test';

  if (environment === 'production') {
    process.env.PLAYWRIGHT_HEADLESS = 'true';
    process.env.MOCK_EXTERNAL_APIS = 'false';
  } else {
    process.env.MOCK_EXTERNAL_APIS = 'true';
  }

  console.log(`🌍 Ambiente: ${environment} (${envConfig.baseUrl})`);
}

function buildPlaywrightCommand(options) {
  const suite = TEST_SUITES[options.suite];
  const env = ENVIRONMENTS[options.environment];

  let cmd = 'npx playwright test';

  // Configurações básicas
  cmd += ` --config=playwright.config.ts`;

  // Filtro de testes
  if (suite.grep !== '.*') {
    cmd += ` --grep="${suite.grep}"`;
  }

  // Projetos
  suite.projects.forEach((project) => {
    cmd += ` --project=${project}`;
  });

  // Timeout
  cmd += ` --timeout=${suite.timeout}`;

  // Workers
  if (options.workers !== undefined) {
    cmd += ` --workers=${options.workers}`;
  }

  // Retry
  if (options.retry > 0) {
    cmd += ` --retries=${options.retry}`;
  }

  // Headless/Headed
  if (!options.headless) {
    cmd += ` --headed`;
  }

  // Reporter
  if (options.reporter !== 'html') {
    cmd += ` --reporter=${options.reporter}`;
  }

  // Debug mode
  if (options.debug) {
    cmd += ` --debug`;
    process.env.PWDEBUG = '1';
  }

  return cmd;
}

function preFlightChecks(environment) {
  console.log('🔍 Executando verificações pré-voo...');

  // Verificar se aplicação está rodando (apenas para ambiente local)
  if (environment === 'local') {
    try {
      execSync('curl -f http://localhost:3000/api/health || exit 1', {
        stdio: 'pipe',
        timeout: 10000,
      });
      console.log('✅ Aplicação local rodando');
    } catch (error) {
      console.error('❌ Aplicação local não está rodando');
      console.error('Execute: npm run dev');
      process.exit(1);
    }
  }

  // Verificar se browsers estão instalados
  try {
    execSync('npx playwright install --dry-run', { stdio: 'pipe' });
    console.log('✅ Browsers do Playwright instalados');
  } catch (error) {
    console.log('📥 Instalando browsers do Playwright...');
    execSync('npx playwright install', { stdio: 'inherit' });
  }
}

function runTests(command) {
  console.log('\n🎭 Executando testes E2E...');
  console.log(`Comando: ${command}\n`);

  try {
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log('\n✅ Testes executados com sucesso!');

    // Mostrar localização do relatório
    if (fs.existsSync('playwright-report/index.html')) {
      console.log('📊 Relatório HTML disponível em: playwright-report/index.html');
      console.log('💡 Execute: npx playwright show-report');
    }
  } catch (error) {
    console.error('\n❌ Alguns testes falharam');

    if (fs.existsSync('test-results')) {
      console.log('🔍 Screenshots e vídeos disponíveis em: test-results/');
    }

    process.exit(1);
  }
}

function generateTestReport() {
  const reportPath = 'test-results/test-results.json';

  if (fs.existsSync(reportPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

      console.log('\n📈 RESUMO DOS TESTES:');
      console.log(`Total: ${results.stats.expected + results.stats.unexpected}`);
      console.log(`✅ Passou: ${results.stats.expected}`);
      console.log(`❌ Falhou: ${results.stats.unexpected}`);
      console.log(`⏭️  Pulou: ${results.stats.skipped || 0}`);
      console.log(`⏱️  Duração: ${Math.round(results.stats.duration / 1000)}s`);

      if (results.stats.unexpected > 0) {
        console.log('\n❌ TESTES QUE FALHARAM:');
        results.suites.forEach((suite) => {
          suite.specs.forEach((spec) => {
            spec.tests.forEach((test) => {
              if (test.status === 'failed') {
                console.log(`  • ${suite.title} > ${spec.title} > ${test.title}`);
              }
            });
          });
        });
      }
    } catch (error) {
      console.warn('⚠️  Não foi possível processar relatório JSON');
    }
  }
}

// Função principal
function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  validateOptions(options);

  console.log(`🚀 Iniciando testes E2E - Suíte: ${options.suite}`);

  setupEnvironment(options.environment);
  preFlightChecks(options.environment);

  const command = buildPlaywrightCommand(options);
  runTests(command);
  generateTestReport();

  console.log('\n🎉 Execução concluída!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, validateOptions };
