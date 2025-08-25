import { unstable_noStore as noStore } from 'next/cache'
import type { Metadata } from 'next'
import { ServicosContent } from './components/ServicosContent'

// 🔌 Server Actions
import { listServices, listServiceCategories } from '@/actions/services'

/** Tipos **/
export type Service = {
  id: string
  name: string
  description?: string | null
  category_id: string
  category_name?: string
  duration_minutes: number
  price: number
  is_active: boolean
  created_at?: string | null
}

export type ServiceCategory = {
  id: string
  name: string
  is_active: boolean
  created_at?: string | null
}

export type ServicesResponse = {
  items: Service[]
  total: number
}

export const metadata: Metadata = {
  title: 'Serviços | Trato',
  description: 'Gestão de serviços e preços',
}

/** Utils **/
function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x === 'string') return x
  return undefined
}
function coerceNumber(x: unknown): number | undefined {
  const s = coerceString(x)
  if (!s) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  noStore()

  // 🔎 Filtros
  const q = coerceString(searchParams.q) ?? ''
  const category = coerceString(searchParams.category) || ''
  const status = coerceString(searchParams.status) || ''
  const priceRange = coerceString(searchParams.priceRange) || ''
  const sortBy = coerceString(searchParams.sortBy) || 'name'
  const sortDir = coerceString(searchParams.sortDir) === 'desc' ? 'desc' : 'asc'
  const page = Math.max(0, coerceNumber(searchParams.page) ?? 0)
  const pageSize = Math.min(
    100,
    Math.max(5, coerceNumber(searchParams.pageSize) ?? 20)
  )

  // 📥 Dados (mock para agora, integrar com backend depois)
  const [servicesData, categoriesData] = await Promise.all([
    // listServices({
    //   q: q || undefined,
    //   category: category || undefined,
    //   status: status || undefined,
    //   priceRange: priceRange || undefined,
    //   sortBy,
    //   sortDir,
    //   page,
    //   pageSize,
    // }) as Promise<ServicesResponse>,
    // listServiceCategories() as Promise<ServiceCategory[]>,

    // Mock data para desenvolvimento
    Promise.resolve({
      items: [
        {
          id: '1',
          name: 'Corte Masculino',
          description: 'Corte tradicional masculino',
          category_id: 'cat1',
          category_name: 'Cortes',
          duration_minutes: 45,
          price: 35,
          is_active: true,
          created_at: '2025-01-21T10:00:00Z',
        },
        {
          id: '2',
          name: 'Barba Completa',
          description: 'Aparar e modelar barba',
          category_id: 'cat2',
          category_name: 'Barba',
          duration_minutes: 30,
          price: 25,
          is_active: true,
          created_at: '2025-01-21T10:00:00Z',
        },
        {
          id: '3',
          name: 'Corte + Barba',
          description: 'Combo completo',
          category_id: 'cat3',
          category_name: 'Combos',
          duration_minutes: 75,
          price: 55,
          is_active: true,
          created_at: '2025-01-21T10:00:00Z',
        },
      ],
      total: 3,
    } as ServicesResponse),

    Promise.resolve([
      {
        id: 'cat1',
        name: 'Cortes',
        is_active: true,
        created_at: '2025-01-21T10:00:00Z',
      },
      {
        id: 'cat2',
        name: 'Barba',
        is_active: true,
        created_at: '2025-01-21T10:00:00Z',
      },
      {
        id: 'cat3',
        name: 'Combos',
        is_active: true,
        created_at: '2025-01-21T10:00:00Z',
      },
    ] as ServiceCategory[]),
  ])

  const searchParamsObj = {
    q,
    category,
    status,
    priceRange,
    sortBy,
    sortDir,
    page: page.toString(),
    pageSize: pageSize.toString(),
  }

  return (
    <ServicosContent
      initialData={servicesData}
      categories={categoriesData}
      searchParams={searchParamsObj}
    />
  )
}
