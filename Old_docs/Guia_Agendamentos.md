Este guia detalha a construção do módulo de Agenda do sistema Trato. O objetivo é criar uma interface visual para gerenciamento de agendamentos, alinhada com a arquitetura, os fluxos de processo e o Design System v2 definidos na documentação do projeto.

1. Estrutura de Dados e Tipos
   A base para a página são as entidades definidas no Diagrama Entidade-Relacionamento. As informações essenciais serão extraídas das seguintes tabelas:

APPOINTMENTS: A entidade central que conecta as demais e define a programação.

id (PK)

cliente_id (FK)

profissional_id (FK)

unidade_id (FK)

inicio (timestamp) - Essencial para calcular a posição vertical (top) do bloco de agendamento.

fim (timestamp) - Essencial para calcular a altura (height) do bloco de agendamento.

status (enum)

PROFISSIONAIS: Utilizada para criar as colunas da grade de horários.

Campos relevantes: id (PK), nome.

CLIENTES: Utilizada para exibir o nome do cliente no bloco de agendamento.

Campos relevantes: id (PK), nome.

SERVICOS: Utilizada para listar os serviços dentro de um agendamento, por meio da tabela de junção APPOINTMENTS_SERVICOS.

Campos relevantes: id (PK), nome.

Ação Recomendada:
No diretório src/schemas/, crie os tipos TypeScript para as entidades, inferindo-os a partir de schemas Zod, conforme as convenções de código do projeto.

2. Estrutura de Componentes (Atomic Design)
   A implementação deve seguir a estrutura de pastas e a filosofia de componentização do projeto.

Página (Page):

src/app/agenda/page.tsx: A rota principal da funcionalidade, que conterá o organismo da agenda.

Organismo (Organism):

src/components/features/agenda/Agenda.tsx: O componente orquestrador que une a sidebar e a grade de horários. Corresponde ao organismo Agenda definido na arquitetura de componentes.

Moléculas (Molecules):

src/components/features/agenda/SidebarFiltros.tsx: A barra lateral com o calendário e filtros.

src/components/features/agenda/GradeHorarios.tsx: O container principal da grade, responsável por renderizar as colunas e os agendamentos.

src/components/features/agenda/ColunaProfissional.tsx: Uma coluna vertical para um único profissional.

src/components/features/agenda/BlocoAgendamento.tsx: O card que representa um único agendamento.

3. Busca e Gerenciamento de Dados (React Query + Server Actions)
   A busca de dados seguirá a arquitetura de Camadas do Sistema.

Server Action:

Crie uma Server Action no diretório de rotas (src/app/agenda/).

Esta ação deve receber unidade_id e um intervalo de datas para buscar os dados no Supabase.

A consulta deve realizar um JOIN entre APPOINTMENTS, CLIENTES, PROFISSIONAIS, e APPOINTMENTS_SERVICOS para retornar um objeto completo e otimizar o carregamento dos dados.

Toda a lógica de acesso será protegida pelas Políticas RLS, garantindo o isolamento de dados por unidade (multi-tenancy).

Custom Hook:

Crie um hook em src/hooks/, como useAgendaData.ts.

Este hook deve usar useQuery (React Query v5) para invocar a Server Action.

Ele será responsável por gerenciar os estados de carregamento (loading), exibindo Skeleton screens conforme as boas práticas de UI/UX.

4. Implementação do Layout e Componentes
   Agenda.tsx (Organismo)
   Utilize o componente <Grid> do MUI para estruturar o layout, seguindo o padrão responsivo definido para dashboards.

TypeScript

<Grid container spacing={3}>
  {/* Sidebar */}
  <Grid item xs={12} md={3} lg={2}>
    <SidebarFiltros />
  </Grid>

{/_ Grade de Horários _/}
<Grid item xs={12} md={9} lg={10}>
<GradeHorarios data={data} isLoading={isLoading} />
</Grid>
</Grid>
GradeHorarios.tsx
Este componente é o container principal da visualização da agenda.

Renderize um componente Box com a propriedade CSS position: 'relative' para servir como âncora para os agendamentos.

Mapeie a lista de profissionais retornada pela API para renderizar dinamicamente cada <ColunaProfissional />.

Renderize uma coluna fixa à esquerda para a linha do tempo (ex: 8h, 9h, 10h...).

BlocoAgendamento.tsx (O Card)
Este componente será posicionado de forma absoluta dentro de sua respectiva ColunaProfissional.

Cálculo de Posição
A lógica de posicionamento é baseada diretamente nos timestamps inicio e fim da entidade APPOINTMENTS.

Escala: Defina uma constante para a escala vertical (ex: const PIXELS_PER_MINUTE = 2;).

Altura (height): Calcule com base na duração. height = (duração_em_minutos \* PIXELS_PER_MINUTE) + 'px'.

Posição (top): Calcule com base na hora de início. top = (minutos_desde_o_início_da_grade \* PIXELS_PER_MINUTE) + 'px'.

Estilização (Design System v2)
O bloco de agendamento deve ser uma implementação customizada do conceito DSCard, aplicando as diretrizes do Design System.

Fundo: backgroundColor: 'background.paper' (cor #1a1c23).

Bordas: borderRadius: '4px'.

Cor Primária: Use palette.primary.main (cor #4f8cff) para destaques, como uma borda lateral.

Tipografia:

Use o componente <Typography> com fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif'.

O texto principal deve usar color: 'text.primary' (cor #f9fafb).

Textos secundários (como o nome do serviço) devem usar color: 'text.secondary' (cor #9ca3af).

Exemplo de Código
TypeScript

// Dentro do componente BlocoAgendamento.tsx
const { top, height } = calcularPosicao(agendamento);

return (
<Paper
sx={{
      position: 'absolute',
      top,
      height,
      left: 1,
      right: 1,
      p: 1.5,
      backgroundColor: 'background.paper', // Cor #1a1c23
      borderLeft: '4px solid',
      borderColor: 'primary.main', // Cor #4f8cff
      borderRadius: '4px', // Bordas de botão padronizadas. DS v2.1 usa 4px globalmente.
      overflow: 'hidden',
    }}

>

    <Typography variant="body2" fontWeight={600} color="text.primary">
      {agendamento.cliente.nome}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {agendamento.servicos.map(s => s.nome).join(', ')}
    </Typography>

  </Paper>
);
5. Responsividade
Sidebar: A sidebar deve ser fixa em desktops e se transformar em um Drawer em dispositivos móveis e tablets. Utilize o hook useMediaQuery do MUI com os breakpoints do sistema (theme.breakpoints.down('md')) para renderizar o componente apropriado.

Grade de Horários: Em telas menores, o container da grade deve ter um scroll horizontal (overflowX: 'auto') para permitir a navegação entre os profissionais sem comprometer a usabilidade.
