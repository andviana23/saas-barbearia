// Mock actions para funcionalidades de profissionais

export type Professional = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  commission_rate?: number;
  is_active: boolean;
  avatar_url?: string;
  created_at?: string;
};

export async function listProfessionals(): Promise<Professional[]> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      id: 'prof1',
      name: 'Maria Santos',
      email: 'maria@barbearia.com',
      phone: '(11) 9999-1111',
      specialty: 'Cortes femininos',
      commission_rate: 40,
      is_active: true,
      avatar_url: undefined,
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'prof2',
      name: 'João Barbeiro',
      email: 'joao@barbearia.com',
      phone: '(11) 9999-2222',
      specialty: 'Cortes masculinos e barba',
      commission_rate: 45,
      is_active: true,
      avatar_url: undefined,
      created_at: '2025-01-01T00:00:00Z',
    },
  ];
}

export async function createProfessional(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Create professional:', Object.fromEntries(formData));

  return { success: true, id: Date.now().toString() };
}

export async function updateProfessional(id: string, formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Update professional:', id, Object.fromEntries(formData));

  return { success: true };
}

export async function deleteProfessional(id: string) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log('Delete professional:', id);

  return { success: true };
}
