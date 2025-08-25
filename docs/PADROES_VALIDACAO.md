# Padrões de Validação - Zod + Server Actions

## Visão Geral

Este documento define os padrões de validação implementados no projeto usando Zod para schemas de validação e Server Actions para mutations.

## Estrutura de Arquivos

```
src/
├── schemas/
│   └── index.ts          # Schemas Zod centralizados
├── types/
│   └── index.ts          # Types e interfaces
├── lib/
│   └── server-actions.ts # Utilitários para Server Actions
├── actions/
│   ├── unidades.ts       # Server Actions para unidades
│   └── profiles.ts       # Server Actions para profiles
└── hooks/
    ├── use-unidades.ts   # Hooks React Query para unidades
    ├── use-profiles.ts   # Hooks React Query para profiles
    └── index.ts          # Exports centralizados
```

## Padrão ActionResult

Todas as Server Actions retornam o padrão `ActionResult<T>`:

```typescript
interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  errors?: ValidationError[]
}
```

### Exemplo de uso:

```typescript
export async function createUnidade(formData: FormData): Promise<ActionResult> {
  return withValidation(CreateUnidadeSchema, data, async (validatedData) => {
    // Lógica de criação
    return newUnidade
  })
}
```

## Schemas de Validação

### Schemas Base

- **BaseSchema**: Campos comuns (id, created_at, updated_at)
- **UnidadeSchema**: Campo unidade_id para multi-tenancy

### Validações Específicas

#### Telefone Brasileiro

```typescript
const telefoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)(\d{4,5}\-?\d{4})$/
export const TelefoneSchema = z
  .string()
  .regex(telefoneRegex, 'Telefone deve estar no formato brasileiro válido')
  .transform((val) => val.replace(/\D/g, ''))
```

**Aceita:**

- `(11) 99999-9999`
- `11999999999`
- `+55 11 99999-9999`
- `+5511999999999`

**Resultado:** String apenas com números

#### CNPJ

```typescript
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
export const CNPJSchema = z
  .string()
  .regex(cnpjRegex, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
  .transform((val) => val.replace(/\D/g, ''))
```

**Formato obrigatório:** `XX.XXX.XXX/XXXX-XX`
**Resultado:** String apenas com números

### Schemas de Entidades

#### Unidade

```typescript
export const CreateUnidadeSchema = z.object({
  nome: z.string().min(2).max(100),
  cnpj: CNPJSchema.optional(),
  endereco: z.string().max(255).optional(),
  telefone: TelefoneSchema.optional(),
  email: z.string().email().toLowerCase().optional(),
  config: z.record(z.any()).default({}),
  ativo: z.boolean().default(true),
})
```

#### Profile

```typescript
export const CreateProfileSchema = z.object({
  user_id: z.string().uuid(),
  nome: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  telefone: TelefoneSchema.optional(),
  unidade_default_id: z.string().uuid().optional(),
  papel: z
    .enum(['admin', 'gestor', 'profissional', 'recepcao'])
    .default('profissional'),
  ativo: z.boolean().default(true),
})
```

## Server Actions

### Utilitários Disponíveis

#### withValidation

Wrapper que combina validação Zod com execução da action:

```typescript
export async function withValidation<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  data: unknown,
  action: (validatedData: TInput) => Promise<TOutput>
): Promise<ActionResult<TOutput>>
```

#### createActionResult

Helper para criar respostas padronizadas:

```typescript
export function createActionResult<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  errors?: ValidationError[]
): ActionResult<T>
```

#### handleActionError

Tratamento consistente de erros:

```typescript
export function handleActionError(error: unknown): ActionResult
```

### Exemplo Completo

```typescript
'use server'

import { withValidation } from '@/lib/server-actions'
import { CreateUnidadeSchema } from '@/schemas'

export async function createUnidade(formData: FormData): Promise<ActionResult> {
  const data = {
    nome: formData.get('nome'),
    cnpj: formData.get('cnpj'),
    // ... outros campos
  }

  return withValidation(CreateUnidadeSchema, data, async (validatedData) => {
    // Lógica de negócio aqui
    const newUnidade = await database.create(validatedData)

    revalidatePath('/unidades')
    return newUnidade
  })
}
```

## React Query Hooks

### Padrão de Hooks

Cada entidade tem hooks específicos:

- `useEntidades(filters?)` - Lista com filtros
- `useEntidade(id)` - Item específico
- `useCreateEntidade()` - Mutation para criar
- `useUpdateEntidade()` - Mutation para atualizar
- `useDeleteEntidade()` - Mutation para deletar

### Exemplo de Hook

```typescript
export function useCreateUnidade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ActionResult> => {
      return await createUnidade(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [UNIDADES_QUERY_KEY] })
      }
    },
  })
}
```

### Uso em Componentes

```typescript
const createUnidadeMutation = useCreateUnidade()

const handleSubmit = async (event: React.FormEvent) => {
  const formData = new FormData(event.currentTarget)

  try {
    const result = await createUnidadeMutation.mutateAsync(formData)
    if (result.success) {
      // Sucesso
    } else {
      // Tratar erros de validação
    }
  } catch (error) {
    // Tratar erros de rede
  }
}
```

## Tratamento de Erros

### Erros de Validação

Retornados no campo `errors` do ActionResult:

```typescript
interface ValidationError {
  field: string // Nome do campo
  message: string // Mensagem de erro
  code?: string // Código do erro Zod
}
```

### Exemplo de Exibição

```typescript
{formState.errors && (
  <Stack spacing={0.5}>
    {formState.errors.map((error, index) => (
      <Typography key={index} variant="body2" color="error">
        <strong>{error.field}:</strong> {error.message}
      </Typography>
    ))}
  </Stack>
)}
```

## Filtros e Busca

### Schema de Busca Base

```typescript
export const SearchSchema = z.object({
  q: z.string().optional(), // Termo de busca
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(), // Campo para ordenação
  order: z.enum(['asc', 'desc']).default('desc'),
})
```

### Filtros Específicos

```typescript
export const UnidadeFilterSchema = SearchSchema.extend({
  ativo: z.coerce.boolean().optional(),
})

export const ProfileFilterSchema = SearchSchema.extend({
  papel: z.enum(['admin', 'gestor', 'profissional', 'recepcao']).optional(),
  ativo: z.coerce.boolean().optional(),
  unidade_id: z.string().uuid().optional(),
})
```

## Tipos TypeScript

Todos os tipos são inferidos automaticamente dos schemas:

```typescript
export type CreateUnidadeData = z.infer<typeof CreateUnidadeSchema>
export type UpdateUnidadeData = z.infer<typeof UpdateUnidadeSchema>
export type UnidadeFilterData = z.infer<typeof UnidadeFilterSchema>
```

## Exemplo Prático

Visite `/examples` para ver implementação completa com:

- Formulário com validação em tempo real
- Exibição de erros de validação
- Loading states
- Integração React Query
- Padrões de feedback para usuário
