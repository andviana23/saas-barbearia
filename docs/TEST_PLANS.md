# Planos de Teste

Cenários – Agendamento
- Criar agendamento: dados válidos → sucesso; inválidos → erro de validação
- Remarcar: alterar horário mantendo profissional/cliente
- Cancelar: status atualizado, notificações disparadas [TODO]
- Check-in: marcar presença e acionar fluxos dependentes

Cenários – Fila
- Entrar na fila: cliente adicionado e posicionado
- Chamar próximo: atualiza status e registra atendimento
- Abandonar fila: remoção com histórico

Cenários – Cobranças/Assinaturas
- Criação de assinatura: [TODO fluxo]
- Recebimento de webhook payment.confirmed: gera baixa e comissão
- Overdue: agenda régua de cobrança
- Cancelamento: encerra benefícios e futuras cobranças

Cenários – Financeiro
- Abrir/fechar caixa: sessões consistentes
- Lançamentos: somente dentro do unit_id do usuário (RLS)

Cenários – Autorização/RLS
- Usuário sem acesso à unidade não vê/insere dados (unit_id)
- Profissional vê apenas seus agendamentos quando aplicável

Critérios gerais
- Validação com Zod em entradas
- Tratamento explícito de erro e mensagens ao usuário
- Limpeza de dados/arquivos temporários em testes
