'use client'

import { useState } from 'react'
import { Box, Typography, Stack, Alert } from '@mui/material'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Form, Input } from '@/components/ui/Form'
import { useCreateUnidade, useUnidades } from '@/hooks/use-unidades'
import { ActionResult } from '@/types'

export default function ExamplesPage() {
  const [formState, setFormState] = useState<ActionResult | null>(null)
  const { data: unidades, isLoading } = useUnidades()
  const createUnidadeMutation = useCreateUnidade()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormState(null)

    const formData = new FormData(event.currentTarget as HTMLFormElement)

    try {
      const result = await createUnidadeMutation.mutateAsync(formData)
      setFormState(result)

      if (result.success) {
        // Reset form on success
        ;(event.currentTarget as HTMLFormElement).reset()
      }
    } catch (error) {
      setFormState({
        success: false,
        error: 'Erro ao criar unidade',
      })
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Exemplos - Server Actions + Zod + React Query
      </Typography>

      <Stack spacing={4}>
        {/* Exemplo 1: Formulário com Validação */}
        <Card
          title="Criar Unidade"
          subtitle="Exemplo de Server Action com validação Zod"
        >
          <Form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Input
                name="nome"
                label="Nome da Unidade"
                required
                helperText="Mínimo 2 caracteres, máximo 100"
              />

              <Input
                name="cnpj"
                label="CNPJ"
                placeholder="XX.XXX.XXX/XXXX-XX"
                helperText="Formato: XX.XXX.XXX/XXXX-XX (opcional)"
              />

              <Input
                name="endereco"
                label="Endereço"
                multiline
                rows={2}
                helperText="Máximo 255 caracteres (opcional)"
              />

              <Input
                name="telefone"
                label="Telefone"
                placeholder="(11) 99999-9999"
                helperText="Formato brasileiro (opcional)"
              />

              <Input
                name="email"
                label="Email"
                type="email"
                helperText="Email válido (opcional)"
              />

              <Button
                type="submit"
                loading={createUnidadeMutation.isPending}
                fullWidth
              >
                Criar Unidade
              </Button>
            </Stack>
          </Form>

          {/* Feedback do formulário */}
          {formState && (
            <Box sx={{ mt: 2 }}>
              <Alert
                severity={formState.success ? 'success' : 'error'}
                variant="outlined"
              >
                {formState.success ? (
                  <Typography>
                    ✅ {formState.message || 'Unidade criada com sucesso!'}
                  </Typography>
                ) : (
                  <Box>
                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                      ❌ {formState.error || 'Erro ao criar unidade'}
                    </Typography>
                    {formState.errors && (
                      <Stack spacing={0.5}>
                        {formState.errors.map((error, index) => (
                          <Typography key={index} variant="body2">
                            • <strong>{error.field}:</strong> {error.message}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </Box>
                )}
              </Alert>
            </Box>
          )}
        </Card>

        {/* Exemplo 2: Lista com React Query */}
        <Card
          title="Lista de Unidades"
          subtitle="Exemplo de Query com React Query"
        >
          {isLoading ? (
            <Typography>Carregando unidades...</Typography>
          ) : (
            <Stack spacing={2}>
              {unidades?.data.map((unidade) => (
                <Box
                  key={unidade.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6">{unidade.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {unidade.email} • {unidade.telefone}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {unidade.id}
                  </Typography>
                </Box>
              ))}

              {unidades?.data.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  Nenhuma unidade encontrada
                </Typography>
              )}
            </Stack>
          )}
        </Card>

        {/* Exemplo 3: Padrões de Validação */}
        <Card
          title="Padrões de Validação"
          subtitle="Exemplos de validações implementadas"
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                📧 Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Formato válido de email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Conversão automática para lowercase
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                📱 Telefone Brasileiro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Aceita: (11) 99999-9999, 11999999999, +55 11 99999-9999
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Remove automaticamente caracteres não numéricos
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                🏢 CNPJ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Formato: XX.XXX.XXX/XXXX-XX
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Remove automaticamente caracteres especiais
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                🆔 UUID
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Validação de formato UUID v4
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Usado para IDs de entidades
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Box>
  )
}
