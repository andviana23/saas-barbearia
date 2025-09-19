# Processo de Release

Pré-release
- Atualizar CHANGELOG
- Rodar linters e testes (unit/integration/e2e)
- Revisar policies RLS impactadas

Release
- Build de produção e deploy
- Executar smoke tests e checagens de saúde (/api/health, webhooks GET)

Pós-release
- Monitorar erros e métricas
- Plano de rollback disponível (PM2/Nginx)

Rollback
- Reverter para build anterior (pm2 revert ou versão anterior)
- Comunicar interessados
