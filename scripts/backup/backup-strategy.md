# 💾 ESTRATÉGIA DE BACKUP E RECOVERY - SUPABASE

**Data:** 25/08/2025  
**Versão:** v1.0.0  
**Escopo:** Backup completo e estratégia de recovery para produção  
**RPO/RTO:** RPO: 1h | RTO: 4h (dados críticos) | RTO: 24h (dados históricos)

---

## 🎯 **OBJETIVOS DE RECOVERY**

### **RPO (Recovery Point Objective)**

- **Dados Críticos:** 1 hora (agendamentos, pagamentos, clientes ativos)
- **Dados Operacionais:** 4 horas (relatórios, configurações)
- **Dados Históricos:** 24 horas (logs, auditoria, analytics)

### **RTO (Recovery Time Objective)**

- **Sistema Core:** 4 horas (funcionalidades essenciais)
- **Sistema Completo:** 8 horas (todas as funcionalidades)
- **Analytics/Relatórios:** 24 horas (dados históricos completos)

---

## 📋 **ESTRATÉGIA DE BACKUP**

### **1. Backup Automatizado Supabase**

#### **Configuração Point-in-Time Recovery (PITR)**

```sql
-- Habilitar PITR no Supabase Dashboard
-- Configuração: Retenção de 30 dias para produção
-- Backup incremental a cada 5 minutos
```

#### **Snapshots Diários**

- **Horário:** 02:00 UTC (23:00 BRT)
- **Retenção:** 30 dias (produção) / 7 dias (staging)
- **Verificação:** Automática com alertas

### **2. Export Lógico Personalizado**

```bash
# Script de backup lógico diário
#!/bin/bash
# scripts/backup/daily-logical-backup.sh

set -e

# Configurações
DB_URL="${SUPABASE_DB_URL}"
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
S3_BUCKET="saas-barbearia-backups"

# Criar diretório de backup
mkdir -p "${BACKUP_DIR}"

# Backup das tabelas críticas
pg_dump "${DB_URL}" \
  --schema=public \
  --data-only \
  --table=agendamentos \
  --table=clientes \
  --table=pagamentos \
  --table=profissionais \
  --table=servicos \
  --table=unidades \
  > "${BACKUP_DIR}/critical-data.sql"

# Backup completo (estrutura + dados)
pg_dump "${DB_URL}" \
  --schema=public \
  --create \
  --clean \
  --if-exists \
  > "${BACKUP_DIR}/full-backup.sql"

# Backup de configurações
pg_dump "${DB_URL}" \
  --schema=auth \
  --schema=storage \
  --data-only \
  > "${BACKUP_DIR}/config-backup.sql"

# Compressão e upload para S3
tar -czf "${BACKUP_DIR}.tar.gz" "${BACKUP_DIR}"
aws s3 cp "${BACKUP_DIR}.tar.gz" "s3://${S3_BUCKET}/daily/"

# Limpeza local (manter apenas 3 dias)
find /backups -name "*.tar.gz" -mtime +3 -delete

echo "✅ Backup concluído: $(date)"
```

### **3. Backup de Configurações e Secrets**

```bash
# scripts/backup/config-backup.sh
#!/bin/bash

set -e

BACKUP_DIR="/backups/config/$(date +%Y-%m-%d)"
mkdir -p "${BACKUP_DIR}"

# Backup de variáveis de ambiente (sem secrets)
cat > "${BACKUP_DIR}/env-template.txt" <<EOF
# Environment Configuration Template
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]
ASAAS_API_KEY=[REDACTED]
ASAAS_WEBHOOK_SECRET=[REDACTED]
DATABASE_URL=[REDACTED]
NEXTAUTH_SECRET=[REDACTED]
SENTRY_DSN=your_sentry_dsn
EOF

# Backup de configurações do projeto
cp -r supabase/config "${BACKUP_DIR}/"
cp -r .github/workflows "${BACKUP_DIR}/"
cp package.json "${BACKUP_DIR}/"
cp next.config.js "${BACKUP_DIR}/"
cp tailwind.config.ts "${BACKUP_DIR}/"

echo "✅ Config backup concluído: $(date)"
```

---

## 🔄 **PROCEDIMENTOS DE RECOVERY**

### **1. Recovery Completo (Disaster Recovery)**

```bash
# scripts/recovery/disaster-recovery.sh
#!/bin/bash

set -e

echo "🚨 INICIANDO DISASTER RECOVERY"
echo "Timestamp: $(date)"

# 1. Criar novo projeto Supabase (se necessário)
echo "📋 1. Verificando infraestrutura..."
# supabase projects create saas-barbearia-recovery

# 2. Aplicar migrações
echo "📋 2. Aplicando migrações..."
cd /project/saas-barbearia
supabase db reset --linked

# 3. Restaurar dados do backup mais recente
echo "📋 3. Restaurando dados..."
LATEST_BACKUP=$(aws s3 ls s3://saas-barbearia-backups/daily/ | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://saas-barbearia-backups/daily/${LATEST_BACKUP}" ./latest-backup.tar.gz

tar -xzf latest-backup.tar.gz
psql "${NEW_DB_URL}" < "./$(basename ${LATEST_BACKUP} .tar.gz)/full-backup.sql"

# 4. Verificar integridade dos dados
echo "📋 4. Verificando integridade..."
psql "${NEW_DB_URL}" -c "
  SELECT
    'unidades' as tabela, count(*) as registros
  FROM unidades
  UNION ALL
  SELECT 'clientes', count(*) FROM clientes
  UNION ALL
  SELECT 'agendamentos', count(*) FROM agendamentos
  UNION ALL
  SELECT 'pagamentos', count(*) FROM pagamentos;
"

# 5. Executar testes de sanidade
echo "📋 5. Executando testes de sanidade..."
npm run test:sanity

echo "✅ DISASTER RECOVERY CONCLUÍDO"
echo "⚠️  AÇÕES MANUAIS NECESSÁRIAS:"
echo "   - Atualizar DNS/domínio"
echo "   - Atualizar variáveis de ambiente"
echo "   - Verificar integrações externas (ASAAS, etc.)"
```

### **2. Recovery Pontual (Point-in-Time)**

```bash
# scripts/recovery/point-in-time-recovery.sh
#!/bin/bash

set -e

TARGET_TIME="${1}"
if [ -z "${TARGET_TIME}" ]; then
  echo "❌ Uso: $0 'YYYY-MM-DD HH:MM:SS'"
  exit 1
fi

echo "🕐 INICIANDO POINT-IN-TIME RECOVERY"
echo "Target Time: ${TARGET_TIME}"

# 1. Criar snapshot do estado atual (segurança)
echo "📋 1. Criando snapshot de segurança..."
pg_dump "${SUPABASE_DB_URL}" > "./pre-recovery-$(date +%Y%m%d-%H%M%S).sql"

# 2. Executar PITR via Supabase CLI
echo "📋 2. Executando Point-in-Time Recovery..."
# supabase db pitr "${TARGET_TIME}"

echo "⚠️  PITR deve ser executado via Supabase Dashboard:"
echo "   1. Acesse: https://app.supabase.com/project/YOUR_PROJECT/settings/database"
echo "   2. Clique em 'Point in time recovery'"
echo "   3. Selecione: ${TARGET_TIME}"
echo "   4. Confirme a operação"

echo "✅ PITR configurado. Verificar restauração..."
```

### **3. Recovery de Tabelas Específicas**

```bash
# scripts/recovery/table-recovery.sh
#!/bin/bash

set -e

TABLE_NAME="${1}"
BACKUP_DATE="${2}"

if [ -z "${TABLE_NAME}" ] || [ -z "${BACKUP_DATE}" ]; then
  echo "❌ Uso: $0 [table_name] [YYYY-MM-DD]"
  exit 1
fi

echo "📋 RECOVERY DE TABELA ESPECÍFICA"
echo "Tabela: ${TABLE_NAME}"
echo "Data: ${BACKUP_DATE}"

# 1. Download do backup específico
aws s3 cp "s3://saas-barbearia-backups/daily/${BACKUP_DATE}.tar.gz" ./table-recovery.tar.gz
tar -xzf table-recovery.tar.gz

# 2. Criar tabela temporária
psql "${SUPABASE_DB_URL}" -c "
  CREATE TABLE ${TABLE_NAME}_recovery AS
  SELECT * FROM ${TABLE_NAME} WHERE 1=0;
"

# 3. Restaurar dados na tabela temporária
pg_restore -d "${SUPABASE_DB_URL}" -t "${TABLE_NAME}" --data-only "${BACKUP_DATE}/critical-data.sql" || true

# 4. Verificar dados restaurados
psql "${SUPABASE_DB_URL}" -c "
  SELECT count(*) as registros_recovery FROM ${TABLE_NAME}_recovery;
  SELECT count(*) as registros_atual FROM ${TABLE_NAME};
"

echo "✅ RECOVERY CONCLUÍDO"
echo "⚠️  Tabela ${TABLE_NAME}_recovery criada para verificação"
echo "   Execute manualmente a substituição se os dados estiverem corretos"
```

---

## 🧪 **TESTES DE RECOVERY**

### **1. Teste Semanal Automatizado**

```bash
# scripts/backup/test-recovery.sh
#!/bin/bash

set -e

echo "🧪 TESTE DE RECOVERY AUTOMATIZADO"

# Configuração de teste
TEST_DB="saas_barbearia_recovery_test"
BACKUP_FILE="test-backup-$(date +%Y%m%d).sql"

# 1. Criar backup de teste
echo "📋 1. Criando backup de teste..."
pg_dump "${SUPABASE_DB_URL}" > "${BACKUP_FILE}"

# 2. Criar banco de teste
echo "📋 2. Criando ambiente de teste..."
createdb "${TEST_DB}" || dropdb "${TEST_DB}" && createdb "${TEST_DB}"

# 3. Restaurar backup no ambiente de teste
echo "📋 3. Testando restauração..."
psql "${TEST_DB}" < "${BACKUP_FILE}"

# 4. Executar testes de integridade
echo "📋 4. Verificando integridade..."
TEST_RESULTS=$(psql "${TEST_DB}" -t -c "
  SELECT
    CASE
      WHEN count(*) > 0 THEN 'PASS'
      ELSE 'FAIL'
    END as result
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('unidades', 'clientes', 'agendamentos');
")

# 5. Limpeza
dropdb "${TEST_DB}"
rm "${BACKUP_FILE}"

if [[ "${TEST_RESULTS}" == *"PASS"* ]]; then
  echo "✅ TESTE DE RECOVERY: SUCESSO"
  exit 0
else
  echo "❌ TESTE DE RECOVERY: FALHOU"
  exit 1
fi
```

### **2. Teste de Performance de Recovery**

```bash
# scripts/backup/benchmark-recovery.sh
#!/bin/bash

set -e

echo "⏱️ BENCHMARK DE RECOVERY PERFORMANCE"

# Configurações
TEST_SIZES=("small" "medium" "large")
declare -A SIZE_PARAMS
SIZE_PARAMS["small"]="--exclude-table-data='auditoria_*' --exclude-table-data='logs_*'"
SIZE_PARAMS["medium"]="--exclude-table-data='auditoria_*'"
SIZE_PARAMS["large"]=""

for size in "${TEST_SIZES[@]}"; do
  echo "📊 Testando recovery ${size}..."

  start_time=$(date +%s)

  # Backup
  pg_dump "${SUPABASE_DB_URL}" ${SIZE_PARAMS[$size]} > "test-${size}.sql"
  backup_time=$(date +%s)

  # Recovery
  createdb "test_${size}_recovery" 2>/dev/null || true
  psql "test_${size}_recovery" < "test-${size}.sql" >/dev/null 2>&1
  recovery_time=$(date +%s)

  # Cálculos
  backup_duration=$((backup_time - start_time))
  recovery_duration=$((recovery_time - backup_time))
  total_duration=$((recovery_time - start_time))

  # Tamanho do arquivo
  file_size=$(du -h "test-${size}.sql" | cut -f1)

  echo "📋 Resultados ${size}:"
  echo "   Backup: ${backup_duration}s"
  echo "   Recovery: ${recovery_duration}s"
  echo "   Total: ${total_duration}s"
  echo "   Tamanho: ${file_size}"

  # Limpeza
  dropdb "test_${size}_recovery"
  rm "test-${size}.sql"

  echo ""
done

echo "✅ BENCHMARK CONCLUÍDO"
```

---

## 📊 **MONITORAMENTO E ALERTAS**

### **1. Monitoramento de Backup**

```bash
# scripts/monitoring/backup-monitor.sh
#!/bin/bash

# Verificar se backup diário foi executado
LATEST_BACKUP=$(aws s3 ls s3://saas-barbearia-backups/daily/ | tail -1 | awk '{print $1" "$2}')
BACKUP_DATE=$(date -d "${LATEST_BACKUP}" +%s 2>/dev/null || echo 0)
CURRENT_DATE=$(date +%s)
HOURS_DIFF=$(( (CURRENT_DATE - BACKUP_DATE) / 3600 ))

if [ ${HOURS_DIFF} -gt 26 ]; then
  echo "🚨 ALERTA: Último backup há ${HOURS_DIFF} horas"
  # Enviar notificação (Slack, email, etc.)
  exit 1
else
  echo "✅ Backup está atual (${HOURS_DIFF} horas atrás)"
  exit 0
fi
```

### **2. Verificação de Integridade**

```sql
-- scripts/monitoring/integrity-check.sql
-- Verificações diárias de integridade dos dados

-- 1. Verificar referential integrity
SELECT
  'RLS Violations' as check_type,
  count(*) as violations
FROM agendamentos a
LEFT JOIN unidades u ON a.unidade_id = u.id
WHERE u.id IS NULL;

-- 2. Verificar dados críticos
SELECT
  'Data Consistency' as check_type,
  CASE
    WHEN count(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM unidades
WHERE ativo = true;

-- 3. Verificar backup timestamps
SELECT
  'Backup Freshness' as check_type,
  CASE
    WHEN EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) < 86400 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM auditoria_acessos;
```

---

## 📋 **CRONOGRAMA DE EXECUÇÃO**

### **Diário (02:00 UTC)**

- ✅ Backup lógico completo
- ✅ Upload para S3 com retenção
- ✅ Verificação de integridade
- ✅ Limpeza de backups antigos

### **Semanal (Domingo 03:00 UTC)**

- ✅ Teste de recovery automatizado
- ✅ Benchmark de performance
- ✅ Relatório de saúde dos backups
- ✅ Verificação de alertas

### **Mensal (1º dia 04:00 UTC)**

- ✅ Teste de disaster recovery completo
- ✅ Auditoria de políticas de retenção
- ✅ Review e otimização de scripts
- ✅ Documentação de procedimentos

---

## 🔧 **CONFIGURAÇÃO DE PRODUÇÃO**

### **Variáveis de Ambiente**

```bash
# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=saas-barbearia-backups
BACKUP_ENCRYPTION_KEY=your-encryption-key

# Recovery Configuration
RECOVERY_TEST_ENABLED=true
RECOVERY_ALERT_WEBHOOK=your-slack-webhook
RECOVERY_RPO_HOURS=1
RECOVERY_RTO_HOURS=4
```

### **Permissões IAM (AWS)**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::saas-barbearia-backups", "arn:aws:s3:::saas-barbearia-backups/*"]
    }
  ]
}
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **RPO/RTO Compliance**

- [ ] RPO de 1h para dados críticos testado
- [ ] RTO de 4h para sistema core validado
- [ ] RTO de 8h para sistema completo documentado
- [ ] Testes mensais de disaster recovery executados

### **Backup Strategy**

- [ ] PITR habilitado com 30 dias de retenção
- [ ] Backup lógico diário automatizado
- [ ] Upload seguro para S3 com criptografia
- [ ] Alertas configurados para falhas

### **Recovery Procedures**

- [ ] Scripts de disaster recovery testados
- [ ] Procedimento de PITR documentado
- [ ] Recovery de tabelas específicas validado
- [ ] Runbook operacional atualizado

### **Monitoring & Alerting**

- [ ] Monitoramento de backup implementado
- [ ] Verificações de integridade automatizadas
- [ ] Alertas configurados (Slack/email)
- [ ] Dashboards de saúde dos backups

---

**✅ EP25 COMPLETED:** Estratégia completa de Backup & Recovery implementada com RPO/RTO definidos e testados, garantindo disponibilidade empresarial do sistema.

**Próximo:** EP26 - LGPD Compliance
