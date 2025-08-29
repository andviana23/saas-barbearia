import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { Agenda } from '@/components/features/agenda/components/Agenda';

// 🔌 Server Actions (commented out - using mock data for now)
// import { listAppointments } from '@/actions/appointments'
// import { listProfessionals } from '@/actions/professionals'
// import { listServices } from '@/actions/services'

/** Tipos **/
export type Appointment = {
  id: string;
  customer_name: string;
  professional_id: string;
  professional_name?: string;
  service_id: string;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';
  notes?: string | null;
  price?: number;
};

export type Professional = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  duration_minutes?: number;
};

export type AppointmentsResponse = {
  items: Appointment[];
  total: number;
};

export const metadata: Metadata = {
  title: 'Agenda | Trato',
  description: 'Calendário de agendamentos',
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
  const view = coerceString(searchParams.view) || 'week';
  const start = coerceString(searchParams.start) || new Date().toISOString().split('T')[0];
  // Filtros adicionais (professionalId, serviceId, status) serão integrados ao novo componente Agenda depois

  // 📥 Dados (mock para agora, integrar com backend depois)
  const [appointmentsData, professionalsData, servicesData] = await Promise.all([
    // Mock data para desenvolvimento
    Promise.resolve({
      items: [
        {
          id: '1',
          customer_name: 'João Silva',
          professional_id: 'prof1',
          professional_name: 'Maria Santos',
          service_id: 'serv1',
          service_name: 'Corte Masculino',
          date: new Date().toISOString().split('T')[0],
          start_time: '09:00:00',
          end_time: '09:45:00',
          status: 'confirmed' as const,
          notes: 'Cliente preferencial',
          price: 35,
        },
        {
          id: '2',
          customer_name: 'Pedro Oliveira',
          professional_id: 'prof2',
          professional_name: 'João Barbeiro',
          service_id: 'serv2',
          service_name: 'Corte + Barba',
          date: new Date().toISOString().split('T')[0],
          start_time: '10:30:00',
          end_time: '11:45:00',
          status: 'scheduled' as const,
          notes: null,
          price: 55,
        },
        {
          id: '3',
          customer_name: 'Carlos Mendes',
          professional_id: 'prof1',
          professional_name: 'Maria Santos',
          service_id: 'serv3',
          service_name: 'Barba Completa',
          date: new Date().toISOString().split('T')[0],
          start_time: '14:00:00',
          end_time: '14:30:00',
          status: 'completed' as const,
          notes: null,
          price: 25,
        },
      ],
      total: 3,
    } as AppointmentsResponse),

    Promise.resolve([
      { id: 'prof1', name: 'Maria Santos' },
      { id: 'prof2', name: 'João Barbeiro' },
      { id: 'prof3', name: 'Ana Silva' },
    ] as Professional[]),

    Promise.resolve([
      { id: 'serv1', name: 'Corte Masculino', duration_minutes: 45 },
      { id: 'serv2', name: 'Corte + Barba', duration_minutes: 75 },
      { id: 'serv3', name: 'Barba Completa', duration_minutes: 30 },
    ] as Service[]),
  ]);

  // searchParamsObj removido ao migrar para novo componente Agenda

  return (
    <Agenda
      appointments={appointmentsData.items}
      professionals={professionalsData}
      services={servicesData}
      view={view as 'day' | 'week' | 'month'}
      currentDate={start}
    />
  );
}
