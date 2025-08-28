import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { ProfissionaisContent } from './components/ProfissionaisContent';

// 🔌 Server Actions
import { listProfessionals } from '@/actions/professionals';

/** Tipos **/
export type Professional = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  is_active: boolean;
  services_count?: number;
  avatar_url?: string | null;
  commission_percentage?: number;
  created_at?: string | null;
};

export type ProfessionalsResponse = {
  items: Professional[];
  total: number;
};

export const metadata: Metadata = {
  title: 'Profissionais | Trato',
  description: 'Gestão de profissionais e horários',
};

/** Utils **/
function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0];
  if (typeof x === 'string') return x;
  return undefined;
}
function coerceNumber(x: unknown): number | undefined {
  const s = coerceString(x);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  noStore();

  // 🔎 Filtros
  const q = coerceString(searchParams.q) ?? '';
  const status = coerceString(searchParams.status) || '';
  const role = coerceString(searchParams.role) || '';
  const sortBy = coerceString(searchParams.sortBy) || 'name';
  const sortDir = coerceString(searchParams.sortDir) === 'desc' ? 'desc' : 'asc';
  const page = Math.max(0, coerceNumber(searchParams.page) ?? 0);
  const pageSize = Math.min(100, Math.max(5, coerceNumber(searchParams.pageSize) ?? 20));

  // 📥 Dados (mock para agora, integrar com backend depois)
  const professionalsData = await Promise.resolve({
    items: [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        role: 'Barbeiro',
        is_active: true,
        services_count: 5,
        avatar_url: null,
        commission_percentage: 40,
        created_at: '2025-01-21T10:00:00Z',
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 98888-8888',
        role: 'Manicure',
        is_active: true,
        services_count: 3,
        avatar_url: null,
        commission_percentage: 50,
        created_at: '2025-01-21T10:00:00Z',
      },
      {
        id: '3',
        name: 'Pedro Oliveira',
        email: null,
        phone: '(11) 97777-7777',
        role: 'Barbeiro',
        is_active: false,
        services_count: 2,
        avatar_url: null,
        commission_percentage: 35,
        created_at: '2025-01-21T10:00:00Z',
      },
    ],
    total: 3,
  } as ProfessionalsResponse);

  const searchParamsObj = {
    q,
    status,
    role,
    sortBy,
    sortDir,
    page: page.toString(),
    pageSize: pageSize.toString(),
  };

  return <ProfissionaisContent initialData={professionalsData} searchParams={searchParamsObj} />;
}
