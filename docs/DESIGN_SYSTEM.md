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
  background: { default: '#0f1115', paper: '#1a1c23' },
  text: { primary: '#f9fafb', secondary: '#9ca3af' },
  success: { main: '#22c55e' },
  error: { main: '#ef4444' },
  warning: { main: '#f59e0b' }
}
```

- **Primary (azul)** → ações principais, links e destaques.
- **Secondary (índigo)** → elementos complementares, gráficos e interações secundárias.
- **Background** → contraste forte entre fundo escuro e cartões.
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

- Bordas arredondadas (8px)
- Variantes: `contained`, `outlined`, `text`
- Hover com brilho leve

### **Campos de Texto (DSTextField)**

- Fundo escuro `#1f2230`
- Borda sutil
- Foco em azul vibrante
- `size="small"` como padrão

### **Cartões (DSCard)**

- Fundo `background.paper`
- Bordas arredondadas (12px)
- Sombra suave
- Suporte a **título, valor e tendência**

### **Tabelas (DSTable)**

- Layout compacto
- Cabeçalho forte
- Linhas alternadas em dark
- Hover com azul translúcido

### **Gráficos (DSChartWrapper)**

- Estilo `line` e `bar`
- Gradientes em tons de azul
- Tooltip escuro estilizado

### **Cabeçalho de Página (PageHeader)**

- Título destacado
- Subtítulo em `text.secondary`
- Suporte para ações (botões, filtros)

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
- **Focus ring** em azul neon para navegação via teclado

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
