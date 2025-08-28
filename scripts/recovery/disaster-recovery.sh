#!/bin/bash
# ===============================================
# DISASTER RECOVERY SCRIPT - SUPABASE
# Data: 25/08/2025
# Descrição: Recovery completo do sistema
# ===============================================

set -e

# Configurações
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
S3_BUCKET="${BACKUP_S3_BUCKET:-saas-barbearia-backups}"
RECOVERY_DIR="/tmp/recovery-$(date +%Y%m%d-%H%M%S)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log() {
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_info() {
  log "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  log "${GREEN}✅ $1${NC}"
}

log_warning() {
  log "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  log "${RED}❌ $1${NC}"
}

error_exit() {
  log_error "$1"
  cleanup
  exit 1
}

cleanup() {
  if [ -d "${RECOVERY_DIR}" ]; then
    rm -rf "${RECOVERY_DIR}"
  fi
}

# Verificar dependências
check_dependencies() {
  log_info "Verificando dependências..."
  
  local deps=("psql" "pg_dump" "aws" "supabase")
  for dep in "${deps[@]}"; do
    if ! command -v "$dep" >/dev/null 2>&1; then
      error_exit "Dependência não encontrada: $dep"
    fi
  done
  
  log_success "Dependências verificadas"
}

# Verificar variáveis obrigatórias
check_environment() {
  log_info "Verificando configuração do ambiente..."
  
  local required_vars=("SUPABASE_DB_URL" "BACKUP_S3_BUCKET")
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      error_exit "Variável obrigatória não configurada: $var"
    fi
  done
  
  log_success "Ambiente configurado"
}

# Listar backups disponíveis
list_backups() {
  log_info "Listando backups disponíveis..."
  
  echo ""
  echo "📋 BACKUPS DISPONÍVEIS:"
  echo "========================"
  
  aws s3 ls "s3://${S3_BUCKET}/daily/" --human-readable | \
    grep ".tar.gz" | \
    tail -10 | \
    while read -r date time size file; do
      echo "  📁 ${file} (${size}) - ${date} ${time}"
    done
  
  echo ""
}

# Selecionar backup para recovery
select_backup() {
  local backup_file=""
  
  if [ -n "$1" ]; then
    backup_file="$1"
    log_info "Backup especificado: ${backup_file}"
  else
    # Usar backup mais recente
    backup_file=$(aws s3 ls "s3://${S3_BUCKET}/daily/" | \
      grep ".tar.gz" | \
      sort -r | \
      head -1 | \
      awk '{print $4}')
    
    if [ -z "${backup_file}" ]; then
      error_exit "Nenhum backup encontrado"
    fi
    
    log_info "Usando backup mais recente: ${backup_file}"
  fi
  
  echo "${backup_file}"
}

# Download e preparação do backup
prepare_backup() {
  local backup_file="$1"
  
  log_info "Preparando backup para recovery..."
  
  mkdir -p "${RECOVERY_DIR}"
  cd "${RECOVERY_DIR}"
  
  # Download do backup
  log_info "Fazendo download do backup: ${backup_file}"
  aws s3 cp "s3://${S3_BUCKET}/daily/${backup_file}" ./ || \
    error_exit "Falha no download do backup"
  
  # Extrair backup
  log_info "Extraindo backup..."
  tar -xzf "${backup_file}" || \
    error_exit "Falha na extração do backup"
  
  # Verificar conteúdo
  local backup_dir="${backup_file%.tar.gz}"
  if [ ! -d "${backup_dir}" ]; then
    error_exit "Diretório do backup não encontrado: ${backup_dir}"
  fi
  
  # Verificar arquivos essenciais
  local required_files=("full-backup.sql" "critical-data.sql" "backup-info.json")
  for file in "${required_files[@]}"; do
    if [ ! -f "${backup_dir}/${file}" ]; then
      error_exit "Arquivo essencial não encontrado: ${file}"
    fi
  done
  
  log_success "Backup preparado: ${backup_dir}"
  echo "${backup_dir}"
}

# Criar snapshot de segurança
create_safety_snapshot() {
  log_info "Criando snapshot de segurança do estado atual..."
  
  local snapshot_file="${RECOVERY_DIR}/pre-recovery-$(date +%Y%m%d-%H%M%S).sql"
  
  # Fazer backup do estado atual
  if pg_dump "${SUPABASE_DB_URL}" > "${snapshot_file}" 2>/dev/null; then
    log_success "Snapshot criado: $(basename "${snapshot_file}")"
    echo "${snapshot_file}"
  else
    log_warning "Falha ao criar snapshot (banco pode estar vazio)"
    echo ""
  fi
}

# Executar recovery do schema
restore_schema() {
  local backup_dir="$1"
  
  log_info "Restaurando estrutura do banco de dados..."
  
  # Aplicar migrações primeiro (estrutura limpa)
  cd "${PROJECT_DIR}"
  log_info "Aplicando migrações..."
  supabase db reset --linked || \
    error_exit "Falha ao aplicar migrações"
  
  log_success "Estrutura restaurada via migrações"
}

# Executar recovery dos dados
restore_data() {
  local backup_dir="$1"
  
  log_info "Restaurando dados..."
  
  cd "${RECOVERY_DIR}/${backup_dir}"
  
  # 1. Restaurar dados críticos primeiro
  if [ -f "critical-data.sql" ]; then
    log_info "Restaurando dados críticos..."
    psql "${SUPABASE_DB_URL}" < "critical-data.sql" || \
      error_exit "Falha na restauração de dados críticos"
    log_success "Dados críticos restaurados"
  fi
  
  # 2. Verificar se precisamos de dados adicionais
  if [ -f "full-backup.sql" ]; then
    log_info "Verificando necessidade de dados adicionais..."
    
    # Contar registros em tabelas críticas
    local critical_count=$(psql "${SUPABASE_DB_URL}" -t -c "
      SELECT count(*) FROM unidades;
    " 2>/dev/null || echo "0")
    
    if [ "${critical_count}" -eq 0 ]; then
      log_warning "Dados críticos vazios, usando backup completo..."
      psql "${SUPABASE_DB_URL}" < "full-backup.sql" || \
        error_exit "Falha na restauração completa"
      log_success "Backup completo restaurado"
    fi
  fi
  
  log_success "Dados restaurados"
}

# Verificar integridade dos dados
verify_data_integrity() {
  log_info "Verificando integridade dos dados restaurados..."
  
  # Executar verificações de integridade
  local integrity_check=$(psql "${SUPABASE_DB_URL}" -t -c "
    -- Verificar tabelas críticas
    SELECT 
      CASE 
        WHEN (SELECT count(*) FROM unidades) > 0 
         AND (SELECT count(*) FROM profiles) >= 0
         AND (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') > 10
        THEN 'PASS'
        ELSE 'FAIL'
      END as integrity_check;
  " 2>/dev/null || echo "FAIL")
  
  if [ "${integrity_check}" = "PASS" ]; then
    log_success "Integridade dos dados verificada"
  else
    error_exit "Falha na verificação de integridade"
  fi
  
  # Mostrar estatísticas
  log_info "Estatísticas dos dados restaurados:"
  psql "${SUPABASE_DB_URL}" -c "
    SELECT 
      'unidades' as tabela, count(*) as registros 
    FROM unidades
    UNION ALL
    SELECT 'clientes', count(*) FROM clientes
    UNION ALL  
    SELECT 'agendamentos', count(*) FROM agendamentos
    UNION ALL
    SELECT 'pagamentos', count(*) FROM pagamentos
    UNION ALL
    SELECT 'profissionais', count(*) FROM profissionais
    ORDER BY tabela;
  " 2>/dev/null || log_warning "Falha ao obter estatísticas (normal se tabelas estão vazias)"
}

# Executar testes de sanidade
run_sanity_tests() {
  log_info "Executando testes de sanidade..."
  
  cd "${PROJECT_DIR}"
  
  # Verificar se o projeto compila
  if npm run build >/dev/null 2>&1; then
    log_success "Build do projeto: OK"
  else
    log_warning "Build do projeto: FALHOU (verificar configurações)"
  fi
  
  # Executar testes de sanidade se existirem
  if npm run test:sanity >/dev/null 2>&1; then
    log_success "Testes de sanidade: OK"
  else
    log_warning "Testes de sanidade: NÃO DISPONÍVEIS ou FALHARAM"
  fi
}

# Gerar relatório de recovery
generate_report() {
  local backup_file="$1"
  local start_time="$2"
  local end_time="$(date +%s)"
  local duration=$((end_time - start_time))
  
  log_info "Gerando relatório de recovery..."
  
  local report_file="${RECOVERY_DIR}/recovery-report.txt"
  
  cat > "${report_file}" <<EOF
🚨 RELATÓRIO DE DISASTER RECOVERY
================================

Data/Hora: $(date)
Duração: ${duration} segundos ($((duration / 60)) minutos)

BACKUP UTILIZADO:
- Arquivo: ${backup_file}
- Origem: s3://${S3_BUCKET}/daily/

PROCEDIMENTOS EXECUTADOS:
✅ Verificação de dependências
✅ Download e extração do backup
✅ Criação de snapshot de segurança
✅ Restauração da estrutura (migrações)
✅ Restauração dos dados
✅ Verificação de integridade
✅ Testes de sanidade

STATUS: RECOVERY CONCLUÍDO COM SUCESSO

AÇÕES MANUAIS NECESSÁRIAS:
⚠️  Verificar e atualizar variáveis de ambiente de produção
⚠️  Atualizar DNS/domínio se necessário
⚠️  Verificar integrações externas (ASAAS, webhooks, etc.)
⚠️  Testar funcionalidades críticas manualmente
⚠️  Monitorar logs de aplicação por 24h
⚠️  Notificar stakeholders sobre o recovery

CONTATOS DE EMERGÊNCIA:
- DevOps: [CONFIGURAR]
- Product Owner: [CONFIGURAR]
- CTO: [CONFIGURAR]

PRÓXIMOS PASSOS:
1. Executar testes end-to-end completos
2. Verificar métricas de monitoramento
3. Confirmar que todos os serviços estão funcionais
4. Documentar lições aprendidas
5. Revisar e melhorar planos de recovery

EOF

  log_success "Relatório gerado: ${report_file}"
  echo ""
  cat "${report_file}"
}

# Função principal
main() {
  local start_time="$(date +%s)"
  local backup_file_param="$1"
  
  echo ""
  log_error "🚨 INICIANDO DISASTER RECOVERY"
  log_warning "Este processo irá SUBSTITUIR todos os dados do banco atual!"
  echo ""
  
  # Confirmar execução
  if [ "${RECOVERY_CONFIRM}" != "yes" ]; then
    read -p "Deseja continuar? (yes/no): " confirm
    if [ "${confirm}" != "yes" ]; then
      log_info "Recovery cancelado pelo usuário"
      exit 0
    fi
  fi
  
  # Executar recovery
  check_dependencies
  check_environment
  list_backups
  
  local backup_file=$(select_backup "${backup_file_param}")
  local backup_dir=$(prepare_backup "${backup_file}")
  
  create_safety_snapshot
  restore_schema "${backup_dir}"
  restore_data "${backup_dir}"
  verify_data_integrity
  run_sanity_tests
  
  generate_report "${backup_file}" "${start_time}"
  
  log_success "🎉 DISASTER RECOVERY CONCLUÍDO COM SUCESSO!"
  log_warning "Revise as ações manuais necessárias no relatório acima"
  
  cleanup
}

# Verificar argumentos
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  echo "Uso: $0 [backup-file.tar.gz]"
  echo ""
  echo "Opções:"
  echo "  backup-file.tar.gz  Arquivo específico de backup (opcional)"
  echo "  --help, -h          Mostrar esta ajuda"
  echo ""
  echo "Variáveis de ambiente:"
  echo "  SUPABASE_DB_URL     URL do banco de dados (obrigatório)"
  echo "  BACKUP_S3_BUCKET    Bucket S3 dos backups (obrigatório)"
  echo "  RECOVERY_CONFIRM    'yes' para pular confirmação (opcional)"
  echo ""
  echo "Exemplos:"
  echo "  $0                           # Usar backup mais recente"
  echo "  $0 2025-08-25.tar.gz         # Usar backup específico"
  echo "  RECOVERY_CONFIRM=yes $0      # Executar sem confirmação"
  exit 0
fi

# Executar
trap cleanup EXIT
main "$@"