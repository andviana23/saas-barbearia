// Mock actions para funcionalidades da fila

export type QueueStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'canceled'
  | 'no_show'

export type QueueItem = {
  id: string
  ticket: string
  customer_name?: string | null
  service_name?: string | null
  unit_id: string
  unit_name?: string
  professional_id?: string | null
  professional_name?: string | null
  status: QueueStatus
  arrival_time: string
  called_at?: string | null
  started_at?: string | null
  finished_at?: string | null
  notes?: string | null
  estimated_duration?: number | null
}

export type QueueResponse = {
  items: QueueItem[]
  total: number
}

export async function listQueue(_params: {
  q?: string
  unitId?: string
  professionalId?: string
  status?: string
  sortBy?: string
  sortDir?: string
}): Promise<QueueResponse> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  const items: QueueItem[] = [
    {
      id: '1',
      ticket: 'A-001',
      customer_name: 'João Silva',
      service_name: 'Corte Masculino',
      unit_id: 'unit1',
      unit_name: 'Unidade Centro',
      professional_id: null,
      professional_name: null,
      status: 'waiting',
      arrival_time: new Date(Date.now() - 15 * 60000).toISOString(),
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
      status: 'in_service',
      arrival_time: new Date(Date.now() - 45 * 60000).toISOString(),
      called_at: new Date(Date.now() - 30 * 60000).toISOString(),
      started_at: new Date(Date.now() - 25 * 60000).toISOString(),
      finished_at: null,
      notes: null,
      estimated_duration: 60,
    },
  ]

  return {
    items,
    total: items.length,
  }
}

export async function addToQueue(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Add to queue:', Object.fromEntries(formData))

  return { success: true, id: Date.now().toString(), ticket: 'A-003' }
}

export async function callNext(unitId?: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Call next in queue for unit:', unitId)

  return { success: true, calledId: '1' }
}

export async function callItem(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Call specific item:', id)

  return { success: true }
}

export async function startService(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Start service for item:', id)

  return { success: true }
}

export async function finishService(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Finish service for item:', id)

  return { success: true }
}

export async function cancelQueueItem(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Cancel queue item:', id)

  return { success: true }
}

export async function markNoShow(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Mark as no-show:', id)

  return { success: true }
}
