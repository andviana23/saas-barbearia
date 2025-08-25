// Mock actions para funcionalidades de serviços

export type Service = {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  category_id?: string
  category_name?: string
  is_active: boolean
  created_at?: string
}

export type ServiceCategory = {
  id: string
  name: string
  description?: string
  is_active: boolean
}

export async function listServices(): Promise<Service[]> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  return [
    {
      id: 'serv1',
      name: 'Corte Masculino',
      description: 'Corte de cabelo masculino tradicional',
      duration_minutes: 45,
      price: 35,
      category_id: 'cat1',
      category_name: 'Cortes',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'serv2',
      name: 'Corte + Barba',
      description: 'Corte de cabelo + barba completa',
      duration_minutes: 75,
      price: 55,
      category_id: 'cat1',
      category_name: 'Cortes',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'serv3',
      name: 'Barba',
      description: 'Barba completa',
      duration_minutes: 30,
      price: 25,
      category_id: 'cat1',
      category_name: 'Cortes',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
    },
  ]
}

export async function listServiceCategories(): Promise<ServiceCategory[]> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  return [
    {
      id: 'cat1',
      name: 'Cortes',
      description: 'Cortes de cabelo e barba',
      is_active: true,
    },
    {
      id: 'cat2',
      name: 'Tratamentos',
      description: 'Tratamentos capilares',
      is_active: true,
    },
  ]
}

export async function createService(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Create service:', Object.fromEntries(formData))

  return { success: true, id: Date.now().toString() }
}

export async function updateService(id: string, formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Update service:', id, Object.fromEntries(formData))

  return { success: true }
}

export async function deleteService(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Delete service:', id)

  return { success: true }
}
