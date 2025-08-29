# 📘 Design System — Trato v2.0.0

**Base:** Next.js 14 + TypeScript + MUI v6
**Status:** Em evolução (DS v2 ativo)
**Modo padrão:** Dark Mode First

---

## 1. Introdução

O **Design System Trato** é um guia de identidade visual e de componentes de interface criado para assegurar **consistência, acessibilidade e eficiência** no desenvolvimento de produtos digitais.

Ele organiza cores, tipografia, componentes, layouts e diretrizes de usabilidade em um **framework unificado**, inspirado nos princípios de **Atomic Design**.

### Objetivos

- Garantir **consistência visual** em todas as interfaces.
- Promover **eficiência e reutilização** de componentes.
- Facilitar a **evolução e manutenção** do produto.
- Assegurar **acessibilidade e usabilidade** como padrão.

---

## 2. Filosofia de Design

- **Dark Mode First** → O design é otimizado para ambientes escuros, refletindo sofisticação e modernidade.
- **Luxury & Tech** → Visual premium, minimalista, com ênfase em credibilidade e densidade de informação.
- **Mobile-First** → Layouts responsivos, priorizando telas pequenas sem perder clareza no desktop.
- **Densidade otimizada** → Mais informação visível, sem sobrecarregar a interface.

---

## 3. Paleta de Cores

```ts
palette: {
  mode: 'dark',
  primary: { main: '#4f8cff', light: '#7aaaff', dark: '#2c5fd8' },
  secondary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
  background: { default: '#0B0E13', paper: '#12151D' },
  surfaces: { surface1: '#161A23', surface2: '#1C202B' },
  text: { primary: '#f9fafb', secondary: '#A0A6B5' },
  divider: 'rgba(255,255,255,0.08)',
  success: { main: '#22c55e' },
  error: { main: '#ef4444' },
  warning: { main: '#f59e0b' }
}
```

- **Primary (azul)** → ações principais, links e destaques.
- **Secondary (índigo)** → elementos complementares, gráficos e interações secundárias.
- **Background / Surfaces** → camadas graduais (`default` → `paper` → `surface1` → `surface2`) para hierarquia sem depender de sombras fortes.
- **Divider** (`rgba(255,255,255,0.08)`) → separações sutis.
- **Feedback (success, error, warning)** → cores planas e modernas para estados do sistema.

---

## 4. Tipografia

```ts
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  h1: { fontSize: '2rem', fontWeight: 600 },
  h2: { fontSize: '1.75rem', fontWeight: 600 },
  h3: { fontSize: '1.5rem', fontWeight: 600 },
  h4: { fontSize: '1.25rem', fontWeight: 500 },
  body1: { fontSize: '1rem', fontWeight: 400 },
  body2: { fontSize: '0.875rem', fontWeight: 400 },
  button: { fontWeight: 600, textTransform: 'none' }
}
```

- **Títulos:** Fortes e densos, priorizando métricas e informações-chave.
- **Subtítulos:** Textos secundários em cinza neutro.
- **Texto base:** Branco suave (#f9fafb), garantindo contraste e legibilidade.

---

## 5. Componentes Padrão

### **Botões (DSButton)**

- Bordas arredondadas (12px) — padronização global de raio
- Variantes: `contained`, `outlined`, `text`
- Hover com realce de borda / leve brilho

### **Campos de Texto (DSTextField)**

- Fundo escuro `#1f2230`
- Borda sutil
- Foco em azul vibrante
- `size="small"` como padrão

### **Cartões (DSCard)**

- Fundo: `surfaces.surface1` (ou `background.paper` no primeiro nível)
- Raio: **12px** (padrão global para cards, modais, botões)
- Borda: `1px solid divider` (reduz dependência de sombras)
- Hover: borda muda para `primary.main` + leve elevação (shadow suave)
- Valor: foco visual neutro; variação (trend) em `success.main` ou `error.main`
- Densidade: evitar preenchimento vertical excessivo (altura mínima funcional)

### **Tabelas (DSTable)**

- Layout compacto, tipografia 12–13px
- Cabeçalho: `text.primary` (peso 600) sobre fundo `surfaces.surface2`
- Linhas alternadas: `surfaces.surface1`
- Hover row: `rgba(79,140,255,0.08)`
- Bordas internas: `divider` discreto
- Alinhamento numérico à direita

### **Gráficos (DSChartWrapper)**

- Suporte: `line`, `area`, `bar` (futuro: `pie`)
- Gradiente padrão: `#4f8cff → #2c5fd8` (0.25 → 0.05 opacidade)
- Tooltip: fundo `surfaces.surface2`, borda `divider`, raio 8px
- Grid: apenas linhas horizontais suaves (<=6% opacidade)
- Points: ocultar automaticamente se série > 60 pontos
- Focus/hover: stroke +1px e leve brilho

### **Cabeçalho de Página (PageHeader)**

- Título destacado
- Subtítulo em `text.secondary`
- Suporte para ações (botões, filtros)

### **Modais (Padrão DSModal)**

Padrão base para todos os modais (inclui o novo "Resumo de Comissão"):

| Aspecto        | Regra                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| Largura        | `maxWidth="sm"` (ou `xs` para casos simples); nunca full screen em desktop    |
| Canto          | Borda arredondada 12px (`borderRadius: 1.5`)                                  |
| Borda          | 1px sólido `divider` (shadow mínima)                                          |
| Fundo          | `background.paper` sem gradiente                                              |
| Título         | 16px, weight 600, espaçamento inferior curto                                  |
| Subtítulo      | `caption`, `text.secondary`, logo abaixo do título                            |
| Fechar         | `IconButton size="small"` no canto superior direito                           |
| Conteúdo       | Densidade alta; usar `Stack` e `Divider` para blocos                          |
| Ações          | Alinhadas à direita; botão primário `contained`, secundário `outlined` neutro |
| Scroll interno | `DialogContent dividers` separando header/body                                |
| Acessibilidade | `aria-labelledby` ligado ao título; roles semânticos adequados                |

Tokens de Espaçamento Interno:

```
Header: pt 16 / pr 56 (área do botão fechar)
Content: px 20 (desktop), 16 (mobile); py 8–16 por bloco
Footer: py 16, gap 8–12, alinhado à direita
```

Chips informativos (ex: "sem valores"):

```
fontSize 10px; px 6; py 2; borderRadius 4; bgcolor action.hover; color text.secondary; weight 500
```

Dividers de seção (com texto central):

```
fontSize 11px; opacity 0.8; uses <Divider textAlign="center">LABEL</Divider>
```

#### Resumo de Comissão (CommissionResumoModal)

Hierarquia:

1. Header: Título + subtítulo (contexto do período)
2. ENTRADAS: categorias positivas (verde)
3. SAÍDAS: deduções (vermelho)
4. SALDO: linha neutra com label em `text.secondary`
5. Destaques: cartões RECEBIMENTOS (verde) e DESCONTOS (vermelho) com fundo translúcido + borda
6. Ações: Exportar (CSV) + Fechar

Regras de Cor:

```
Entradas: success.main
Saídas: error.main
Recebimentos card: bg rgba(success.main, .25) + border success.main
Descontos card: bg rgba(error.main, .25) + border error.main
Saldo: valor em primary.main se positivo; error.main se negativo
```

Tipografia:

```
Labels: 13–14px / 500
Valores: 13.5–14px / 600–700
Seções (ENTRADAS/SAÍDAS): 11px uppercase 600
```

Exportação CSV: colunas `Tipo,Categoria,Valor` — filename `resumo-comissao.csv`.

Fallback sem dados: renderizar todas as categorias com `R$ 0,00` + chip "sem valores".

Não Fazer:

- Não usar <Table> para este modal.
- Não adicionar detalhes de itens ou clientes aqui.
- Não aplicar sombras profundas.

---

## 6. Padrões de Layout

### **Dashboard**

- Grid 4 colunas (desktop), 1 (mobile)
- Cards de métricas no topo
- Gráfico principal em largura total
- Tabelas compactas ao lado

### **Formulários**

- Inputs densos (`small`)
- Labels discretos
- Botões primários em azul vibrante

### **Navegação**

- Sidebar fixa (desktop)
- Sidebar colapsável (tablet)
- Drawer (mobile)

---

## 7. Acessibilidade

- Contraste mínimo **4.5:1**
- Dark mode otimizado para leitores de tela
- **ARIA labels** em ícones e botões
- **Focus ring** em azul neon (#4f8cff) para navegação via teclado (outline offset 2px)
- Ícones com `aria-label` quando ação não estiver em texto
- Garantir contraste mínimo 4.5:1 incluindo novas surfaces

---

## 8. Exemplos de Uso

```tsx
// Card de Métrica
<DSCard title="Usuários" value="14k" trend="+25%" trendUp />

// Botão
<DSButton variant="contained" size="medium">Criar Novo</DSButton>

// Tabela
<DSTable columns={[{ id: 'nome', label: 'Nome' }]} data={clientes} loading={isLoading} />

// PageHeader
<PageHeader title="Dashboard" subtitle="Visão geral do negócio" />
```

---

## 9. Recomendações de Uso

- Sempre priorizar o **tema escuro**.
- Reutilizar os **componentes do DS** para consistência.
- Respeitar as **hierarquias tipográficas**.
- Usar gradientes de azul em gráficos para manter identidade visual.

---

## 10. Conclusão

O **Trato DS v2** é uma evolução orientada à **modernidade, acessibilidade e densidade informacional**, entregando interfaces consistentes, elegantes e responsivas.

Ele serve como **fundamento visual e técnico** para a expansão do produto, garantindo **eficiência no desenvolvimento** e **coerência na experiência do usuário**.

---

## 11. Ajustes DS v2.1

Changelog interno desta evolução de UI.

### Paleta

-- Novo background: `#0B0E13` / `#12151D`.
-- Novos tokens: `surfaces.surface1` (`#161A23`), `surfaces.surface2` (`#1C202B`).
-- `text.secondary` agora `#A0A6B5`.
-- `divider` suavizado (`rgba(255,255,255,0.08)`).

### Raio / Bordas

- Cards, modais, botões e inputs: 12px (unificação v2.1).

### Cartões

- Fundo `surface1` por padrão, hover com realce de borda primária.

### Modais

- Baseados no padrão do CommissionResumoModal.
- Header compacto, subtítulo caption.

### Tabelas

- Alternância de linhas e hover azul translúcido.

### Gráficos

- Gradiente primário atualizado e tooltip em `surface2`.

### Chips

- Translúcidos em `action.hover`, tipografia 10px.

### Acessibilidade

- Focus ring padronizado azul neon.
- Revalidação de contraste nas novas superfícies.

### Modal de Comissão

- Export CSV padronizado: `Tipo,Categoria,Valor`.

Mantida filosofia Dark Mode First / Luxury & Tech / Mobile-First.
