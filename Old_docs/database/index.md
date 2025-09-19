# Documentação do Banco de Dados - SaaS Barbearia

## Índice de Documentação

Esta pasta contém toda a documentação do banco de dados do sistema SaaS de gerenciamento de barbearias.

## 📋 Documentos Principais

### [README.md](README.md)
Visão geral completa do banco de dados, incluindo:
- Descrição de todas as tabelas
- Relacionamentos entre tabelas
- Estrutura de segurança (RLS)
- Configuração para ambiente local

### [Tables Schema](tables-schema.sql)
Schema SQL completo com:
- Definição de todas as tabelas
- Índices e constraints
- Triggers para updated_at
- Comentários descritivos

### [Security Policies](security-policies.md)
Documentação detalhada da segurança:
- Funções de segurança (RLS)
- Políticas por tabela
- Diferenças entre Supabase e PostgreSQL local
- Troubleshooting de segurança

### [Migrations Guide](migrations-guide.md)
Guia completo de migrações:
- Comandos do Supabase CLI
- Estrutura de migrações
- Boas práticas
- Troubleshooting

### [Examples & Queries](examples-queries.md)
Coleção de queries úteis:
- Queries básicas por tabela
- Relatórios e estatísticas
- Inserções e atualizações
- Exemplos com RLS

## 🗂️ Estrutura das Tabelas

```
saas-barbearia (database)
├── units (unidades/barbearias)
├── services (serviços oferecidos)
├── customers (clientes)
├── appointments (agendamentos)
└── unit_members (relacionamento usuário-unidade)
```

## 🔐 Segurança

O sistema implementa segurança em nível de linha (RLS) para garantir que usuários acessem apenas dados da unidade à qual pertencem.

### Roles do Sistema
- **`authenticated`**: Usuários autenticados com acesso limitado à sua unidade
- **`service_role`**: Acesso administrativo completo (bypass RLS)

### Funções de Segurança
- **`user_has_unit_access()`**: Verifica acesso à unidade (Supabase)
- **`user_has_unit_access_local()`**: Versão para PostgreSQL local

## 🚀 Começando

### Para Desenvolvimento com Supabase
1. Configure o Supabase CLI
2. Execute `supabase start`
3. Aplique migrações com `supabase db reset`

### Para Desenvolvimento com PostgreSQL Local
1. Configure o container Docker
2. Execute o schema SQL
3. Configure RLS local
4. Use `set_current_user_id()` para definir usuário

## 📊 Queries Comuns

### Listar Serviços da Unidade
```sql
SELECT name, price, duration 
FROM services 
WHERE unit_id = 'sua-unit-id' 
AND is_active = true;
```

### Ver Agendamentos do Dia
```sql
SELECT c.name, s.name, a.start_time 
FROM appointments a
JOIN customers c ON a.customer_id = c.id  
JOIN services s ON a.service_id = s.id
WHERE a.start_time::date = CURRENT_DATE
ORDER BY a.start_time;
```

### Faturamento do Mês
```sql
SELECT SUM(s.price) as total
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.status = 'completed'
AND a.start_time >= date_trunc('month', CURRENT_DATE);
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **"permission denied"** - Verifique RLS e políticas de segurança
2. **"function auth.uid() does not exist"** - Use funções locais para PostgreSQL
3. **"relation does not exist"** - Verifique ordem das migrações
4. **Nenhum dado retornado** - Confirme associação do usuário à unidade

### Verificar Configuração
```sql
-- Testar RLS local
SELECT set_current_user_id('user-id-aqui');
SELECT user_has_unit_access_local('unit-id-aqui');
```

## 📚 Referências Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [SQL Best Practices](examples-queries.md#dicas-de-performance)

---

**Última atualização:** Setembro 2025
**Versão:** 1.0.0