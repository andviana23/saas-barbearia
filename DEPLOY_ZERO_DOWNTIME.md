# 🚀 Deploy Zero-Downtime - PT→EN Migration

## Estratégia Implementada: Opção B - Zero-Downtime

Esta migração permite que o sistema continue funcionando normalmente durante toda a transição, sem interrupção de serviço.

## ⚡ **Status Atual**

- ✅ Backend código PT→EN: **100% completo**
- ✅ Dual-field helpers: **Implementados**
- ✅ Views compatibilidade: **Criadas**
- ✅ Testes validação: **21/21 passando**

---

## 📋 **Checklist de Deploy**

### **Fase 1: Pré-Deploy**

- [x] ✅ Criar views de compatibilidade (`compatibility_views.sql`)
- [x] ✅ Implementar dual-field helpers no código
- [x] ✅ Validar testes unitários e funcionais
- [ ] 🔄 Backup completo do banco de produção
- [ ] 🔄 Aplicar views no banco de staging
- [ ] 🔄 Testar código antigo e novo no staging

### **Fase 2: Deploy Gradual**

- [ ] 🔄 Aplicar `compatibility_views.sql` em produção
- [ ] 🔄 Deploy da nova versão do código
- [ ] 🔄 Validar funcionamento dual (PT e EN)
- [ ] 🔄 Monitorar logs por 24-48h
- [ ] 🔄 Confirmar zero erros 42703/500

### **Fase 3: Finalização**

- [ ] 🔄 Remover código PT legado gradualmente
- [ ] 🔄 Aplicar `remove_compatibility_views.sql`
- [ ] 🔄 Validar sistema 100% EN
- [ ] 🔄 Documentar conclusão

---

## 🔧 **Scripts de Deploy**

### **1. Aplicar Views de Compatibilidade**

```bash
# Em ambiente de staging primeiro
psql -d saas_barbearia_staging -f compatibility_views.sql

# Em produção (após validação)
psql -d saas_barbearia_prod -f compatibility_views.sql
```

### **2. Deploy do Código**

```bash
# Deploy normal da aplicação
npm run build
# Deploy via sua estratégia usual (Docker, PM2, etc.)
```

### **3. Remover Views (FINAL)**

```bash
# Apenas após 100% do código migrado
psql -d saas_barbearia_prod -f remove_compatibility_views.sql
```

---

## 🔍 **Validação Pós-Deploy**

### **Queries de Teste**

```sql
-- Testar compatibilidade PT (deve funcionar)
SELECT COUNT(*) FROM clientes;
SELECT COUNT(*) FROM profissionais;
SELECT COUNT(*) FROM servicos;

-- Testar tabelas EN (deve funcionar)
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM professionals;
SELECT COUNT(*) FROM services;

-- Verificar se dados são consistentes
SELECT
  (SELECT COUNT(*) FROM clientes) as pt_count,
  (SELECT COUNT(*) FROM customers) as en_count,
  CASE
    WHEN (SELECT COUNT(*) FROM clientes) = (SELECT COUNT(*) FROM customers)
    THEN '✅ CONSISTENT'
    ELSE '❌ INCONSISTENT'
  END as status;
```

### **Logs a Monitorar**

- ❌ Erro 42703: "column does not exist"
- ❌ Erro 42P01: "relation does not exist"
- ❌ HTTP 500 em endpoints críticos
- ✅ Response times normais
- ✅ Queries executando sem erro

---

## 🛡️ **Plano de Rollback**

### **Se algo der errado:**

**1. Rollback Código (Rápido)**

```bash
# Deploy da versão anterior
git checkout <previous-commit>
npm run build && deploy
```

**2. Remover Views (Se necessário)**

```sql
-- Apenas se as views estiverem causando problemas
DROP VIEW IF EXISTS clientes CASCADE;
-- etc...
```

**3. Restaurar Backup (Último recurso)**

```bash
# Restaurar backup do banco
pg_restore -d saas_barbearia backup_pre_migration.dump
```

---

## 📊 **Métricas de Sucesso**

### **KPIs a Validar**

- ✅ **Uptime**: 99.9%+ durante migração
- ✅ **Response Time**: < 500ms endpoints críticos
- ✅ **Error Rate**: < 0.1%
- ✅ **Testes**: 100% passing
- ✅ **Build**: Sem warnings críticos

### **Endpoints Críticos**

- `/api/customers` (clientes)
- `/api/professionals` (profissionais)
- `/api/services` (serviços)
- `/api/subscriptions` (assinaturas)
- `/api/dashboard/metrics` (KPIs)

---

## 🎯 **Cronograma Sugerido**

| Fase              | Duração | Ação                              |
| ----------------- | ------- | --------------------------------- |
| **Pré-Deploy**    | 2-4h    | Backup, staging tests, validações |
| **Deploy**        | 30min   | Aplicar views + deploy código     |
| **Monitoramento** | 24-48h  | Observar logs, métricas, alertas  |
| **Finalização**   | 1h      | Remover views, limpeza final      |

---

## ⚠️ **Pontos de Atenção**

### **Durante Deploy**

- **Cache**: Limpar cache de aplicação se houver
- **CDN**: Invalidar cache de assets se necessário
- **Background Jobs**: Verificar se continuam funcionando
- **Webhooks**: Validar integrações externas

### **Pós-Deploy**

- **Performance**: Views podem ter overhead inicial
- **Logs**: Monitorar por 48h no mínimo
- **Users**: Comunicar se houver indisponibilidade

---

## 📞 **Contatos de Suporte**

- **DevOps**: [seu-contato]
- **Backend**: [seu-contato]
- **DBA**: [seu-contato]
- **Oncall**: [seu-contato]

---

**✅ Deploy Zero-Downtime PT→EN preparado e pronto para execução!**
