# Política de Cobertura de Código

Estratégia incremental para crescimento sustentável da cobertura.

## Objetivos

| Fase         | Statements | Functions | Branches | Linhas |
| ------------ | ---------- | --------- | -------- | ------ |
| Base (atual) | ~7–8%      | 25%       | 50%      | ~8%    |
| Fase 1       | 10%        | 30%       | 55%      | 10%    |
| Fase 2       | 15%        | 40%       | 60%      | 15%    |
| Fase 3       | 25%        | 55%       | 70%      | 25%    |

## Princípios

1. Não perseguir 100% – otimizar risco x esforço
2. Priorizar arquivos de maior complexidade / churn
3. Cobertura mínima global sobe somente após estabilidade por 2 sprints
4. Fail-fast em regressão (threshold estático + baseline histórica)

## Workaround `'use server'`

Arquivos grandes com `'use server'` podem não ser instrumentados. Ações:

1. Teste PoC removendo diretiva em branch para validar incremento artificial
2. Incluir transform custom no Jest para substituir `'use server'` por comentário (somente em testes)

## Tipos de Teste

| Tipo            | Objetivo                | Métrica Principal        |
| --------------- | ----------------------- | ------------------------ |
| Unit            | Validar lógica isolada  | Branches                 |
| Integration     | Fluxo entre módulos     | Functions                |
| E2E             | Fluxos críticos usuário | Statements globais       |
| Segurança (RLS) | Policies multi-tenant   | Assert negativo/positivo |

## Checklist Pull Request

[] Novo código crítico possui testes
[] Não reduziu % cobertura global (scripts de verificação verdes)
[] Nenhum arquivo >500 linhas novo com 0% lines

## Scripts Relevantes

| Script                           | Função                              |
| -------------------------------- | ----------------------------------- |
| `npm run test:coverage`          | Gera cobertura local                |
| `npm run coverage:verify`        | Verifica contra thresholds/baseline |
| `npm run coverage:actions:debug` | Depurar instrumentação de actions   |

---

Atualizar metas conforme maturidade do módulo cresce.
