// Mock actions para funcionalidades de agendamentos

export type Appointment = {
  id: string
  customer_name: string
  professional_id: string
  professional_name?: string
  service_id: string
  service_name?: string
  date: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show'
  notes?: string | null
  price?: number
}

export type AppointmentsResponse = {
  items: Appointment[]
  total: number
}

export async function listAppointments(): Promise<AppointmentsResponse> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  const appointments: Appointment[] = [
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
      status: 'confirmed',
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
      status: 'scheduled',
      notes: null,
      price: 55,
    },
  ]

  return {
    items: appointments,
    total: appointments.length,
  }
}

export async function createAppointment(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Create appointment:', Object.fromEntries(formData))

  return { success: true, id: Date.now().toString() }
}

export async function updateAppointment(id: string, formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Update appointment:', id, Object.fromEntries(formData))

  return { success: true }
}

export async function deleteAppointment(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Delete appointment:', id)

  return { success: true }
}

export async function confirmAppointment(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Confirm appointment:', id)

  return { success: true }
}

export async function cancelAppointment(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log('Cancel appointment:', id)

  return { success: true }
}
