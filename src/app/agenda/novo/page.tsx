import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
} from '@mui/material'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import type { Metadata } from 'next'

// 🔌 Server Actions — alinhe caminhos / contratos conforme seu backend
// - listProfessionals()
// - listServices()
// - createAppointment(formData)
import { listProfessionals } from '@/actions/professionals'
import { listServices } from '@/actions/services'
import { createAppointment } from '@/actions/appointments'

/** Tipos básicos (alinhar ao backend real) **/
export type Professional = { id: string; name: string }
export type Service = { id: string; name: string; duration_minutes?: number }

export const metadata: Metadata = {
  title: 'Novo Agendamento | Trato',
  description: 'Criar novo agendamento',
}

function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x === 'string') return x
  return undefined
}

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined }
}) {
  noStore()

  // Prefill via querystring
  const qDate = coerceString(searchParams.date) || '' // YYYY-MM-DD
  const qTime = coerceString(searchParams.time) || '' // HH:mm
  const qProfessionalId = coerceString(searchParams.professionalId) || ''
  const qServiceId = coerceString(searchParams.serviceId) || ''

  const [professionals, services] = await Promise.all([
    listProfessionals() as Promise<Professional[]>,
    listServices() as Promise<Service[]>,
  ])

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Novo Agendamento
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href="/agenda"
              variant="text"
              color="inherit"
            >
              Voltar à Agenda
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Preencha os dados do cliente, escolha o serviço e o profissional. A
            duração sugerida é baseada no serviço selecionado.
          </Alert>

          {/* Form SSR com Server Action */}
          <form
            action={async (formData: FormData) => {
              await createAppointment(formData)
            }}
            method="post"
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <TextField
                name="customer_name"
                label="Cliente"
                placeholder="Nome do cliente"
                required
                fullWidth
              />
              <TextField
                name="customer_phone"
                label="Telefone"
                placeholder="(xx) xxxxx-xxxx"
                fullWidth
              />
              <TextField
                name="customer_email"
                type="email"
                label="E-mail"
                placeholder="cliente@email.com"
                fullWidth
              />
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <FormControl sx={{ minWidth: 240 }}>
                <InputLabel id="serviceId-label">Serviço</InputLabel>
                <Select
                  name="service_id"
                  labelId="serviceId-label"
                  label="Serviço"
                  defaultValue={qServiceId}
                  required
                >
                  {services.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 240 }}>
                <InputLabel id="professionalId-label">Profissional</InputLabel>
                <Select
                  name="professional_id"
                  labelId="professionalId-label"
                  label="Profissional"
                  defaultValue={qProfessionalId}
                  required
                >
                  {professionals.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                name="date"
                type="date"
                label="Data"
                InputLabelProps={{ shrink: true }}
                defaultValue={qDate}
                required
                sx={{ minWidth: 180 }}
              />
              <TextField
                name="start_time"
                type="time"
                label="Início"
                InputLabelProps={{ shrink: true }}
                defaultValue={qTime}
                required
                sx={{ minWidth: 140 }}
              />
              <TextField
                name="end_time"
                type="time"
                label="Fim"
                InputLabelProps={{ shrink: true }}
                placeholder="(opcional)"
                sx={{ minWidth: 140 }}
              />
            </Stack>

            <TextField
              name="notes"
              label="Observações"
              placeholder="Notas internas, preferências do cliente, etc."
              multiline
              minRows={3}
              fullWidth
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Button type="submit" variant="contained">
                Salvar
              </Button>
              <Button
                component={Link}
                href="/agenda"
                variant="text"
                color="inherit"
              >
                Cancelar
              </Button>
            </Stack>

            {/* Campos ocultos / padrão */}
            <input type="hidden" name="status" value="scheduled" />
          </form>
        </Paper>

        {/* Dicas operacionais */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Boas práticas
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Confirme o agendamento por WhatsApp no dia anterior.</li>
            <li>
              Use intervalos coerentes com a duração do serviço para evitar
              atrasos.
            </li>
            <li>
              Registre observações importantes (alergias, preferências,
              histórico).
            </li>
          </ul>
        </Paper>
      </Box>
    </Container>
  )
}
