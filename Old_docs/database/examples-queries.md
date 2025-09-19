# Exemplos de Queries - SaaS Barbearia

## Queries Básicas

### Listar Todas as Unidades
```sql
SELECT id, name, address, phone, email, is_active
FROM units
WHERE is_active = true
ORDER BY name;
```

### Listar Serviços por Unidade
```sql
SELECT s.id, s.name, s.description, s.price, s.duration, s.is_active
FROM services s
JOIN units u ON s.unit_id = u.id
WHERE u.id = 'sua-unit-id'
AND s.is_active = true
ORDER BY s.name;
```

### Listar Clientes por Unidade
```sql
SELECT c.id, c.name, c.email, c.phone, c.notes, c.is_active
FROM customers c
WHERE c.unit_id = 'sua-unit-id'
AND c.is_active = true
ORDER BY c.name;
```

### Listar Agendamentos por Período
```sql
SELECT 
    a.id,
    c.name as customer_name,
    s.name as service_name,
    a.start_time,
    a.end_time,
    a.status,
    a.notes
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN services s ON a.service_id = s.id
WHERE a.unit_id = 'sua-unit-id'
AND a.start_time >= '2024-01-01'
AND a.start_time < '2024-02-01'
ORDER BY a.start_time;
```

## Queries com Filtros

### Agendamentos por Status
```sql
SELECT 
    a.id,
    c.name as customer_name,
    s.name as service_name,
    a.start_time,
    a.status
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN services s ON a.service_id = s.id
WHERE a.unit_id = 'sua-unit-id'
AND a.status = 'scheduled'
AND a.start_time >= NOW()
ORDER BY a.start_time;
```

### Serviços por Preço
```sql
SELECT name, description, price, duration
FROM services
WHERE unit_id = 'sua-unit-id'
AND is_active = true
AND price BETWEEN 30.00 AND 100.00
ORDER BY price;
```

### Clientes com Aniversário (se tiver data de nascimento)
```sql
SELECT name, email, phone
FROM customers
WHERE unit_id = 'sua-unit-id'
AND is_active = true
-- Adicione lógica para aniversário se houver campo birth_date
ORDER BY name;
```

## Queries de Relatório

### Total de Agendamentos por Mês
```sql
SELECT 
    DATE_TRUNC('month', start_time) as month,
    COUNT(*) as total_appointments
FROM appointments
WHERE unit_id = 'sua-unit-id'
AND start_time >= '2024-01-01'
GROUP BY DATE_TRUNC('month', start_time)
ORDER BY month;
```

### Faturamento por Mês
```sql
SELECT 
    DATE_TRUNC('month', a.start_time) as month,
    COUNT(*) as total_services,
    SUM(s.price) as total_revenue
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.unit_id = 'sua-unit-id'
AND a.status = 'completed'
AND a.start_time >= '2024-01-01'
GROUP BY DATE_TRUNC('month', a.start_time)
ORDER BY month;
```

### Serviços Mais Agendados
```sql
SELECT 
    s.name,
    COUNT(*) as times_scheduled,
    SUM(s.price) as total_revenue
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.unit_id = 'sua-unit-id'
AND a.status = 'completed'
GROUP BY s.id, s.name
ORDER BY times_scheduled DESC
LIMIT 10;
```

### Clientes Mais Frequentes
```sql
SELECT 
    c.name,
    c.email,
    COUNT(*) as total_appointments,
    SUM(s.price) as total_spent
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN services s ON a.service_id = s.id
WHERE a.unit_id = 'sua-unit-id'
AND a.status = 'completed'
GROUP BY c.id, c.name, c.email
ORDER BY total_appointments DESC
LIMIT 10;
```

## Queries de Inserção

### Criar Nova Unidade
```sql
INSERT INTO units (name, address, phone, email)
VALUES ('Barbearia Nova', 'Rua Principal, 123', '(11) 1234-5678', 'contato@barbearianova.com')
RETURNING id;
```

### Criar Novo Serviço
```sql
INSERT INTO services (unit_id, name, description, price, duration)
VALUES ('unit-id-aqui', 'Corte e Barba', 'Corte de cabelo e barba completa', 45.00, 45)
RETURNING id;
```

### Criar Novo Cliente
```sql
INSERT INTO customers (unit_id, name, email, phone, notes)
VALUES ('unit-id-aqui', 'João Silva', 'joao@email.com', '(11) 98765-4321', 'Cliente preferencial')
RETURNING id;
```

### Criar Novo Agendamento
```sql
INSERT INTO appointments (unit_id, customer_id, service_id, start_time, end_time, status, notes)
VALUES (
    'unit-id-aqui',
    'customer-id-aqui',
    'service-id-aqui',
    '2024-01-15 14:00:00',
    '2024-01-15 14:30:00',
    'scheduled',
    'Cliente solicitou corte especial'
)
RETURNING id;
```

### Adicionar Membro à Unidade
```sql
INSERT INTO unit_members (unit_id, user_id, role)
VALUES ('unit-id-aqui', 'user-id-aqui', 'admin')
ON CONFLICT (unit_id, user_id) DO UPDATE SET is_active = true;
```

## Queries de Atualização

### Atualizar Status do Agendamento
```sql
UPDATE appointments
SET status = 'completed', updated_at = NOW()
WHERE id = 'appointment-id'
AND unit_id = 'unit-id-aqui';
```

### Atualizar Preço do Serviço
```sql
UPDATE services
SET price = 50.00, updated_at = NOW()
WHERE id = 'service-id'
AND unit_id = 'unit-id-aqui';
```

### Desativar Cliente
```sql
UPDATE customers
SET is_active = false, updated_at = NOW()
WHERE id = 'customer-id'
AND unit_id = 'unit-id-aqui';
```

## Queries com RLS (Ambiente Local)

### Configurar Usuário Atual
```sql
-- Definir usuário para teste de RLS
SELECT set_current_user_id('79ea3d72-e17b-45bd-956a-f3605da43b23');
```

### Verificar Acesso à Unidade
```sql
-- Testar se usuário tem acesso à unidade
SELECT user_has_unit_access_local('827bfb26-6e8e-4a52-a9f7-8806d62e878b');
```

### Testar Acesso com RLS
```sql
-- Com RLS habilitado, apenas dados da unidade do usuário serão retornados
SELECT * FROM services; -- Respeitará RLS
SELECT * FROM customers; -- Respeitará RLS
SELECT * FROM appointments; -- Respeitará RLS
```

## Queries de Auditoria

### Ver Últimas Atualizações
```sql
SELECT 
    table_name,
    id,
    updated_at
FROM (
    SELECT 'services' as table_name, id, updated_at FROM services WHERE unit_id = 'unit-id-aqui'
    UNION ALL
    SELECT 'customers' as table_name, id, updated_at FROM customers WHERE unit_id = 'unit-id-aqui'
    UNION ALL
    SELECT 'appointments' as table_name, id, updated_at FROM appointments WHERE unit_id = 'unit-id-aqui'
) all_updates
ORDER BY updated_at DESC
LIMIT 20;
```

### Ver Agendamentos Cancelados
```sql
SELECT 
    a.id,
    c.name as customer_name,
    s.name as service_name,
    a.start_time,
    a.notes
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN services s ON a.service_id = s.id
WHERE a.unit_id = 'sua-unit-id'
AND a.status = 'cancelled'
ORDER BY a.start_time DESC;
```

## Dicas de Performance

1. **Use índices**: Sempre filtre por `unit_id` e use índices em colunas de filtro
2. **Limite resultados**: Use `LIMIT` para queries grandes
3. **Use JOINs apropriados**: Prefira `JOIN` sobre subqueries quando possível
4. **Indexe colunas de data**: Para queries temporais, índices em `start_time` ajudam
5. **Evite SELECT ***: Especifique apenas colunas necessárias