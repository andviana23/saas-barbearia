// Harness simplificado relatorios para E2E_MODE=1
export default function RelatoriosHarness() {
  return (
    <div data-testid="relatorios-content" style={{ padding: 24 }}>
      <h1>Relatórios</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        <a
          data-testid="relatorio-financeiro-link"
          href="/relatorios/financeiro"
          style={{
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1f2937',
            border: '1px solid #d1d5db',
          }}
        >
          📊 Relatório Financeiro
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: 4 }}>
            Receitas, despesas e lucros por período
          </div>
        </a>
        <a
          data-testid="relatorio-operacional-link"
          href="/relatorios/operacional"
          style={{
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1f2937',
            border: '1px solid #d1d5db',
          }}
        >
          📈 Relatório Operacional
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: 4 }}>
            Atendimentos, profissionais e produtividade
          </div>
        </a>
      </div>
    </div>
  );
}
