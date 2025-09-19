-- Função alternativa para user_has_unit_access que funciona no ambiente local
CREATE OR REPLACE FUNCTION user_has_unit_access(target_unit_id uuid) 
RETURNS boolean 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM unit_members um
        WHERE um.unit_id = target_unit_id 
          AND um.user_id = current_setting('app.current_user_id', true)::uuid
          AND um.is_active = true
    );
END;
$$;