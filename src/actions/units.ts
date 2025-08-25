// Mock actions para funcionalidades de unidades

export type Unit = {
  id: string
  name: string
  address?: string
  phone?: string
  is_active: boolean
  created_at?: string
}

export async function listUnits(): Promise<Unit[]> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  return [
    {
      id: 'unit1',
      name: 'Unidade Centro',
      address: 'Rua Principal, 123 - Centro',
      phone: '(11) 3333-3333',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'unit2',
      name: 'Unidade Shopping',
      address: 'Shopping ABC, Loja 45',
      phone: '(11) 4444-4444',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
    },
  ]
}

export async function createUnit(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Create unit:', Object.fromEntries(formData))

  return { success: true, id: Date.now().toString() }
}

export async function updateUnit(id: string, formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Update unit:', id, Object.fromEntries(formData))

  return { success: true }
}

export async function deleteUnit(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Delete unit:', id)

  return { success: true }
}
