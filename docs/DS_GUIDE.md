# Guia do Design System

Componentes UI (src/components/ui)
- Button
  - Props: variant (default|destructive|outline|secondary|ghost|link), size (default|sm|lg|icon), asChild, demais props de button
  - Exemplo:
    - <Button variant="outline" size="sm">Ação</Button>
    - <Button asChild><a href="/clientes">Abrir</a></Button>
- DSCard
  - Props: title?: string; subtitle?: string; action?: React.ReactNode; elevation?: number; onClick?: () => void; sx?: SxProps<Theme>; children: React.ReactNode
  - Exemplos:
    - <DSCard title="Clientes" subtitle="Últimos 7 dias">{/* conteúdo */}</DSCard>
    - <MetricCard title="Receita" value="R$ 12.340" trend={8} />
- NotificationSystem
  - Provider: NotificationProvider
  - Hooks: useNotifications(), useQuickNotifications()
  - Tipos: NotificationType = 'success' | 'error' | 'warning' | 'info'
  - API:
    - addNotification({ type, title, message, duration?, action? })
    - removeNotification(id), clearAll()
  - Exemplo:
    - const { showSuccess } = useQuickNotifications(); showSuccess('Salvo', 'Registro atualizado com sucesso')
- AccessibilityControls
  - Funções: alternar alto contraste, reduzir movimento, ajustar tamanho da fonte (small|medium|large)
  - Requisitos: usar com o provider de acessibilidade (useAccessibilityContext)
  - Exemplo:
    - <AccessibilityControls />

Diretrizes
- Acessibilidade: foco visível, semântica, labels associadas
- Responsividade: grid consistente, touch targets adequados
- Tokens/Temas: variantes de cores e estados (loading, disabled) padronizados
- Tipagem: proibir any; preferir tipos explícitos e generics

Anti-padrões
- Duplicar estilos inline quando o DS oferece variante equivalente
- Usar <button> cru em vez de Button (quebra consistência)
- Atribuir onClick sem debounce em ações idempotentes com loading
- Renderizar toasts sem o NotificationProvider (quebra contexto)

Checklist para novos componentes
- Props e estados documentados
- Acessibilidade testada (tab/enter/esc, ARIA quando necessário)
- Testes unitários básicos
- Storybook (opcional) e exemplos de uso nas docs
- Sem dependência circular com páginas/containers
