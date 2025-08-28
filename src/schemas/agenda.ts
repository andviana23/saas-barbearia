import { z } from 'zod';

export const AgendaFiltroSchema = z.object({
  profissionalIds: z.array(z.string().uuid()).optional(),
  data: z.string().optional(), // ISO date
});

export type AgendaFiltro = z.infer<typeof AgendaFiltroSchema>;
