import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { FilaContent } from './components/FilaContent';

// 🔌 Server Actions
import { listQueue } from '@/actions/queue';
import { listUnits } from '@/actions/units';
import { listProfessionals } from '@/actions/professionals';

/** Tipos **/
export type QueueStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'canceled'
  | 'no_show';

export type QueueItem = {
  id: string;
  ticket: string;
  customer_name?: string | null;
  service_name?: string | null;
  unit_id: string;
  unit_name?: string;
  professional_id?: string | null;
  professional_name?: string | null;
  status: QueueStatus;
  arrival_time: string;
  called_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  notes?: string | null;
  estimated_duration?: number | null;
};

export type Unit = {
  id: string;
  name: string;
};

export type Professional = {
  id: string;
  name: string;
};

export type QueueResponse = {
  items: QueueItem[];
  total: number;
};

export const metadata: Metadata = {
  title: 'Fila | Trato',
  description: 'Painel principal da fila',
};

/** Utils **/
function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0];
  if (typeof x === 'string') return x;
  return undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  noStore();

  // 🔎 Filtros
  const q = coerceString(searchParams.q) ?? '';
  const unitId = coerceString(searchParams.unitId) || '';
  const professionalId = coerceString(searchParams.professionalId) || '';
  const status = coerceString(searchParams.status) || '';
  const sortBy = coerceString(searchParams.sortBy) || 'arrival';
  const sortDir = coerceString(searchParams.sortDir) === 'desc' ? 'desc' : 'asc';

  // 📥 Dados (mock para agora, integrar com backend depois)
  const [queueData, unitsData, professionalsData] = await Promise.all([
    // Mock data para desenvolvimento
    Promise.resolve({
      items: [
        {
          id: '1',
          ticket: 'A-001',
          customer_name: 'João Silva',
          service_name: 'Corte Masculino',
          unit_id: 'unit1',
          unit_name: 'Unidade Centro',
          professional_id: null,
          professional_name: null,
          status: 'waiting' as const,
          arrival_time: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min atrás
          called_at: null,
          started_at: null,
          finished_at: null,
          notes: null,
          estimated_duration: 45,
        },
        {
          id: '2',
          ticket: 'A-002',
          customer_name: 'Maria Santos',
          service_name: 'Manicure',
          unit_id: 'unit1',
          unit_name: 'Unidade Centro',
          professional_id: 'prof2',
          professional_name: 'Ana Silva',
          status: 'in_service' as const,
          arrival_time: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min atrás
          called_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min atrás
          started_at: new Date(Date.now() - 25 * 60000).toISOString(), // 25 min atrás
          finished_at: null,
          notes: null,
          estimated_duration: 60,
        },
        {
          id: '3',
          ticket: 'B-001',
          customer_name: 'Pedro Oliveira',
          service_name: 'Corte + Barba',
          unit_id: 'unit1',
          unit_name: 'Unidade Centro',
          professional_id: null,
          professional_name: null,
          status: 'called' as const,
          arrival_time: new Date(Date.now() - 8 * 60000).toISOString(), // 8 min atrás
          called_at: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min atrás
          started_at: null,
          finished_at: null,
          notes: 'Cliente aguardando na cadeira',
          estimated_duration: 75,
        },
      ],
      total: 3,
    } as QueueResponse),

    Promise.resolve([
      { id: 'unit1', name: 'Unidade Centro' },
      { id: 'unit2', name: 'Unidade Shopping' },
    ] as Unit[]),

    Promise.resolve([
      { id: 'prof1', name: 'João Barbeiro' },
      { id: 'prof2', name: 'Ana Silva' },
      { id: 'prof3', name: 'Carlos Santos' },
    ] as Professional[]),
  ]);

  const searchParamsObj = {
    q,
    unitId,
    professionalId,
    status,
    sortBy,
    sortDir,
  };

  return (
    <FilaContent
      initialData={queueData}
      units={unitsData}
      professionals={professionalsData}
      searchParams={searchParamsObj}
    />
  );
}
