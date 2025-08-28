# Guia de Uso do Sistema Trato

## 1. Login e Autenticação

- Rotas públicas: `/login`, `/signup`, `/forgot-password`
- Middleware protege rotas privadas
- Autenticação via Supabase

## 2. Operações Principais

- Cadastro, edição e exclusão de clientes, produtos e profissionais
- Controle de estoque e agendamentos
- Relatórios financeiros e operacionais
- Multi-unidades: cada usuário acessa apenas sua unidade

## 3. Importação de Dados

- Upload de CSV para clientes
- Validação automática dos dados
- Feedback de erros e duplicidades

## 4. Relatórios e Dashboards

- Dashboard com KPIs principais
- Relatórios customizados por unidade
- Exportação de dados para Excel/CSV

## 5. Navegação e Layout

- Sidebar fixa no desktop, drawer no mobile
- Busca rápida por clientes, produtos e agendamentos
- Filtros avançados em todas as telas

## 6. Suporte e Troubleshooting

- Limpar cache local: `rm -rf .next`
- Verificar variáveis de ambiente em `.env.local`
- Consultar logs de erro no Sentry
- Documentação de endpoints e integrações disponível em `/docs`

## 7. Dicas de Uso

- Utilize o modo dark para melhor visualização
- Prefira importar dados via CSV para grandes volumes
- Use filtros para encontrar rapidamente informações

## 8. FAQ Rápido

- **Como redefinir senha?** Use a opção "Esqueci minha senha" na tela de login.
- **Como importar clientes?** Acesse a tela de clientes e clique em "Importar CSV".
- **Como gerar relatório financeiro?** Vá em Relatórios > Financeiro e selecione o período desejado.

---

**Dúvidas ou problemas? Consulte a documentação oficial ou entre em contato com o suporte.**
