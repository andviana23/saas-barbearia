#!/bin/bash
# ===============================================
# BACKUP LÓGICO DIÁRIO - SUPABASE
# Data: 25/08/2025
# Descrição: Backup automatizado com S3 upload
# ===============================================

set -e

# Configurações
DB_URL="${SUPABASE_DB_URL}"
BACKUP_DIR="/tmp/backups/$(date +%Y-%m-%d)"
S3_BUCKET="${BACKUP_S3_BUCKET:-saas-barbearia-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Funções auxiliares
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
  log "❌ ERRO: $1"
  exit 1
}

# Verificar dependências
command -v pg_dump >/dev/null 2>&1 || error_exit "pg_dump não encontrado"
command -v aws >/dev/null 2>&1 || error_exit "AWS CLI não encontrado"

# Verificar variáveis obrigatórias
[ -z "${DB_URL}" ] && error_exit "SUPABASE_DB_URL não configurado"

log "🚀 Iniciando backup diário"
log "📁 Diretório: ${BACKUP_DIR}"
log "☁️  S3 Bucket: ${S3_BUCKET}"

# Criar diretório de backup
mkdir -p "${BACKUP_DIR}"

# 1. Backup das tabelas críticas (dados apenas)
log "📋 1/5 Backup de tabelas críticas..."
pg_dump "${DB_URL}" \
  --schema=public \
  --data-only \
  --no-owner \
  --no-privileges \
  --table=unidades \
  --table=profiles \
  --table=profissionais \
  --table=clientes \
  --table=servicos \
  --table=agendamentos \
  --table=appointments \
  --table=pagamentos \
  --table=subscriptions \
  --table=assinaturas \
  > "${BACKUP_DIR}/critical-data.sql" || error_exit "Falha no backup de dados críticos"

log "✅ Tabelas críticas: $(wc -l < "${BACKUP_DIR}/critical-data.sql") linhas"

# 2. Backup completo (estrutura + dados)
log "📋 2/5 Backup completo (estrutura + dados)..."
pg_dump "${DB_URL}" \
  --schema=public \
  --create \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "${BACKUP_DIR}/full-backup.sql" || error_exit "Falha no backup completo"

log "✅ Backup completo: $(wc -l < "${BACKUP_DIR}/full-backup.sql") linhas"

# 3. Backup de configurações e auth
log "📋 3/5 Backup de configurações..."
pg_dump "${DB_URL}" \
  --schema=auth \
  --data-only \
  --no-owner \
  --no-privileges \
  > "${BACKUP_DIR}/auth-backup.sql" 2>/dev/null || log "⚠️  Schema auth não encontrado (normal em dev)"

# Backup de funções e políticas RLS
pg_dump "${DB_URL}" \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-privileges \
  > "${BACKUP_DIR}/schema-backup.sql" || error_exit "Falha no backup de schema"

log "✅ Configurações backup concluído"

# 4. Verificação de integridade
log "📋 4/5 Verificando integridade dos backups..."

# Verificar se arquivos não estão vazios
for file in critical-data.sql full-backup.sql schema-backup.sql; do
  if [ ! -s "${BACKUP_DIR}/${file}" ]; then
    error_exit "Arquivo ${file} está vazio"
  fi
done

# Verificar estrutura SQL básica
if ! grep -q "CREATE TABLE" "${BACKUP_DIR}/schema-backup.sql"; then
  error_exit "Schema backup não contém CREATE TABLE statements"
fi

if ! grep -q "INSERT INTO" "${BACKUP_DIR}/critical-data.sql"; then
  log "⚠️  Backup de dados críticos não contém INSERT statements (pode estar vazio)"
fi

log "✅ Integridade verificada"

# 5. Compressão e upload
log "📋 5/5 Compressão e upload para S3..."

# Adicionar metadata ao backup
cat > "${BACKUP_DIR}/backup-info.json" <<EOF
{
  "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "database_url_hash": "$(echo -n "${DB_URL}" | sha256sum | cut -d' ' -f1)",
  "backup_type": "daily_logical",
  "files": [
    "critical-data.sql",
    "full-backup.sql", 
    "schema-backup.sql",
    "auth-backup.sql"
  ],
  "retention_days": ${RETENTION_DAYS},
  "version": "1.0"
}
EOF

# Comprimir backup
cd "$(dirname "${BACKUP_DIR}")"
BACKUP_NAME="$(basename "${BACKUP_DIR}").tar.gz"
tar -czf "${BACKUP_NAME}" "$(basename "${BACKUP_DIR}")" || error_exit "Falha na compressão"

# Upload para S3
aws s3 cp "${BACKUP_NAME}" "s3://${S3_BUCKET}/daily/" \
  --metadata "backup-date=$(date -u +%Y-%m-%dT%H:%M:%SZ),retention-days=${RETENTION_DAYS}" \
  || error_exit "Falha no upload para S3"

# Verificar upload
UPLOADED_SIZE=$(aws s3 ls "s3://${S3_BUCKET}/daily/${BACKUP_NAME}" --human-readable | awk '{print $3" "$4}')
log "✅ Upload concluído: ${UPLOADED_SIZE}"

# Limpeza local
rm -rf "${BACKUP_DIR}" "${BACKUP_NAME}"

# Limpeza de backups antigos no S3
log "🧹 Removendo backups antigos (>${RETENTION_DAYS} dias)..."
CUTOFF_DATE=$(date -u -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)

aws s3 ls "s3://${S3_BUCKET}/daily/" | while read -r line; do
  BACKUP_DATE=$(echo "$line" | awk '{print $1}')
  BACKUP_FILE=$(echo "$line" | awk '{print $4}')
  
  if [[ "${BACKUP_DATE}" < "${CUTOFF_DATE}" && -n "${BACKUP_FILE}" ]]; then
    log "🗑️  Removendo backup antigo: ${BACKUP_FILE}"
    aws s3 rm "s3://${S3_BUCKET}/daily/${BACKUP_FILE}" || log "⚠️  Falha ao remover ${BACKUP_FILE}"
  fi
done

# Estatísticas finais
TOTAL_BACKUPS=$(aws s3 ls "s3://${S3_BUCKET}/daily/" | wc -l)
log "📊 Total de backups mantidos: ${TOTAL_BACKUPS}"

log "✅ BACKUP DIÁRIO CONCLUÍDO COM SUCESSO"
log "📁 Localização: s3://${S3_BUCKET}/daily/${BACKUP_NAME}"
log "⏰ Próximo backup: $(date -d 'tomorrow 02:00' '+%Y-%m-%d %H:%M')"

# Notificar sucesso (opcional)
if [ -n "${BACKUP_SUCCESS_WEBHOOK}" ]; then
  curl -X POST "${BACKUP_SUCCESS_WEBHOOK}" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"✅ Backup diário concluído: ${BACKUP_NAME} (${UPLOADED_SIZE})\"}" \
    >/dev/null 2>&1 || log "⚠️  Falha ao enviar notificação de sucesso"
fi

exit 0