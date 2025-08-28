#!/bin/bash

echo "========================================"
echo "EXECUTANDO MIGRAÇÃO PT→EN COMPLETA"
echo "========================================"
echo

# Verificar se PostgreSQL está disponível
if ! command -v psql &> /dev/null; then
    echo "❌ ERRO: PostgreSQL não encontrado. Instale PostgreSQL primeiro"
    exit 1
fi

# Verificar se npm está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ ERRO: npm não encontrado. Instale Node.js primeiro"
    exit 1
fi

echo "1. 🚀 Aplicando migração completa..."
psql -U postgres -d saas_barbearia -f apply_full_migration.sql

if [ $? -ne 0 ]; then
    echo "❌ ERRO na migração! Verifique os logs acima."
    exit 1
fi

echo
echo "2. ✅ Validando compatibilidade..."
psql -U postgres -d saas_barbearia -f validate_compatibility.sql

if [ $? -ne 0 ]; then
    echo "❌ ERRO na validação! Verifique os logs acima."
    exit 1
fi

echo
echo "3. 🏗️  Testando build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ERRO no build! Verifique os logs acima."
    exit 1
fi

echo
echo "4. 🧪 Executando testes..."
npm test

echo
echo "========================================"
echo "🎉 MIGRAÇÃO COMPLETA!"
echo "Agora você pode rodar: npm run dev"
echo "========================================"