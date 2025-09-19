-- Função RLS alternativa para ambiente local (PostgreSQL puro)
-- Substitui auth.uid() por current_setting('app.current_user_id')

CREATE OR REPLACE FUNCTION user_has_unit_access_local(unit_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o usuário atual tem acesso à unidade especificada
    RETURN EXISTS (
        SELECT 1 
        FROM unit_members 
        WHERE unit_members.unit_id = unit_uuid 
        AND unit_members.user_id = current_setting('app.current_user_id', true)::uuid
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para definir o ID do usuário atual
CREATE OR REPLACE FUNCTION set_current_user_id(user_uuid uuid)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql;

-- Remover políticas problemáticas que causam recursão
DROP POLICY IF EXISTS select_unit_members_same_unit ON unit_members;
DROP POLICY IF EXISTS insert_unit_members_admin ON unit_members;
DROP POLICY IF EXISTS update_unit_members_admin ON unit_members;

-- Criar políticas simples para unit_members
CREATE POLICY auth_unit_members_access_local ON unit_members
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));

-- Atualizar políticas RLS para usar a função local
-- Remover políticas antigas que usam auth.uid()
DROP POLICY IF EXISTS auth_appointments_access ON appointments;
DROP POLICY IF EXISTS auth_services_access ON services;
DROP POLICY IF EXISTS auth_customers_access ON customers;
DROP POLICY IF EXISTS auth_units_access ON units;

-- Criar novas políticas usando a função local
CREATE POLICY auth_appointments_access_local ON appointments
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));

CREATE POLICY auth_services_access_local ON services
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));

CREATE POLICY auth_customers_access_local ON customers
    FOR ALL TO authenticated
    USING (user_has_unit_access_local(unit_id))
    WITH CHECK (user_has_unit_access_local(unit_id));

CREATE POLICY auth_units_access_local ON units
    FOR ALL TO authenticated
    USING (id IN (SELECT unit_id FROM unit_members WHERE user_id = current_setting('app.current_user_id', true)::uuid))
    WITH CHECK (user_has_unit_access_local(id));