# Deploy

Requisitos
- Node.js 18+ [confirmar versão exata]
- Variáveis de ambiente configuradas (.env, .env.production)
- Banco de dados (Supabase) provisionado e migrações aplicadas

Variáveis (exemplos)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- ASAAS_WEBHOOK_TOKEN [TODO]
- SENTRY_DSN [opcional]

Passos
- Instalar dependências: npm ci
- Build: npm run build
- Executar em produção: npm run start (Next.js) ou pm2 start "npm run start" --name saas-barbearia

PM2 (exemplo)
- pm2 start "npm run start" --name saas-barbearia
- pm2 save; pm2 startup

Nginx (reverse proxy – exemplo)
- server_name exemplo.com.br;
- location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
- SSL via certbot/letsencrypt [TODO script]

Pós-deploy
- Checar /api/health e /api/webhooks/asaas (GET) para verificação
- Executar smoke tests E2E contra ambiente
