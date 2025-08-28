@echo off
echo ========================================
echo EXECUTANDO MIGRACAO PT-EN COMPLETA
echo ========================================
echo.

REM Verificar se PostgreSQL esta disponivel
psql --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: PostgreSQL nao encontrado. Instale PostgreSQL ou adicione ao PATH
    pause
    exit /b 1
)

echo 1. Aplicando migracao completa...
psql -U postgres -d saas_barbearia -f apply_full_migration.sql

if errorlevel 1 (
    echo ERRO na migracao! Verifique os logs acima.
    pause
    exit /b 1
)

echo.
echo 2. Validando compatibilidade...
psql -U postgres -d saas_barbearia -f validate_compatibility.sql

if errorlevel 1 (
    echo ERRO na validacao! Verifique os logs acima.
    pause
    exit /b 1
)

echo.
echo 3. Testando build da aplicacao...
call npm run build

if errorlevel 1 (
    echo ERRO no build! Verifique os logs acima.
    pause
    exit /b 1
)

echo.
echo 4. Executando testes...
call npm test

echo.
echo ========================================
echo MIGRACAO COMPLETA!
echo Agora voce pode rodar: npm run dev
echo ========================================
pause