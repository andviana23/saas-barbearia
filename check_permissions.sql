-- Verificar permissões das tabelas que estão dando erro 403

-- Verificar RLS nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('appointments', 'cashbox_transactions', 'appointment_services')
ORDER BY tablename;

-- Verificar políticas de segurança
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('appointments', 'cashbox_transactions', 'appointment_services')
ORDER BY tablename, policyname;

-- Verificar permissões do usuário autenticado
SELECT 
    table_catalog,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('appointments', 'cashbox_transactions', 'appointment_services')
    AND grantee = CURRENT_USER
ORDER BY table_name;