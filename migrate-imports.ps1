# Script para adicionar imports centralizados em lote
# Arquivos para migrar (excluindo os já migrados)

$filesToMigrate = @(
    "appointments.ts",
    "cash.ts", 
    "fila.ts",
    "notificacoes.ts",
    "ping.ts",
    "produtos.ts",
    "professionals.ts",
    "profiles.ts",
    "queue.ts",
    "services.ts",
    "transacoes.ts",
    "units.ts",
    "vendas.ts"
)

$importText = @"

// Importações dos novos tipos centralizados
import { 
  Cliente, Profissional, Servico, Unidade, Appointment, TransacaoFinanceiro,
  CreateClienteDTO, CreateProfissionalDTO, CreateServicoDTO, CreateUnidadeDTO,
  CreateAppointmentDTO, CreateTransacaoFinanceiroDTO
} from '@/types/api';
import {
  CreateClienteSchema as CreateClienteSchemaNew,
  CreateProfissionalSchema as CreateProfissionalSchemaNew,
  CreateServicoSchema as CreateServicoSchemaNew,
  CreateUnidadeSchema as CreateUnidadeSchemaNew,
  CreateAppointmentSchema as CreateAppointmentSchemaNew,
  CreateTransacaoFinanceiroSchema as CreateTransacaoSchemaNew
} from '@/schemas/api';
"@

foreach ($file in $filesToMigrate) {
    $fullPath = "src\actions\$file"
    if (Test-Path $fullPath) {
        Write-Host "Processando: $file"
        $content = Get-Content $fullPath -Raw
        
        # Adicionar imports após as importações existentes
        $pattern = "import.*?from.*?'@/types';"
        if ($content -match $pattern) {
            $content = $content -replace $pattern, "$&$importText"
            Set-Content $fullPath $content -NoNewline
            Write-Host "✅ Importações adicionadas em $file"
        } else {
            Write-Host "⚠️  Padrão não encontrado em $file"
        }
    } else {
        Write-Host "❌ Arquivo não encontrado: $file"
    }
}

Write-Host "🎉 Migração de imports concluída!"
