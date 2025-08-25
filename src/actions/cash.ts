// Mock actions para funcionalidades de caixa

export type CashMovement = {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  professional_name?: string | null
  payment_method: string
  date: string
  created_at?: string | null
}

export type CashResponse = {
  items: CashMovement[]
  total: number
  summary: {
    total_income: number
    total_expense: number
    balance: number
  }
}

export type DailyCashSummary = {
  date: string
  opening_balance: number
  total_income: number
  total_expense: number
  calculated_balance: number
  cash_count?: number | null
  difference?: number | null
  is_closed: boolean
  movements_count: number
  payment_methods: {
    cash: number
    card: number
    pix: number
    transfer: number
  }
}

export async function listCashMovements(_params: {
  q?: string
  type?: string
  category?: string
  professional?: string
  paymentMethod?: string
  period?: string
  sortBy?: string
  sortDir?: string
  page?: number
  pageSize?: number
}): Promise<CashResponse> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  const movements: CashMovement[] = [
    {
      id: '1',
      description: 'Corte de cabelo',
      amount: 50,
      type: 'income',
      category: 'Serviços',
      professional_name: 'João Silva',
      payment_method: 'Cartão',
      date: '2025-01-21',
      created_at: '2025-01-21T10:30:00Z',
    },
    {
      id: '2',
      description: 'Compra de produtos',
      amount: 30,
      type: 'expense',
      category: 'Produtos',
      professional_name: null,
      payment_method: 'Dinheiro',
      date: '2025-01-21',
      created_at: '2025-01-21T14:15:00Z',
    },
  ]

  return {
    items: movements,
    total: movements.length,
    summary: {
      total_income: 5000,
      total_expense: 1500,
      balance: 3500,
    },
  }
}

export async function getDailyCashSummary(
  date?: string
): Promise<DailyCashSummary> {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    date: date || new Date().toISOString().split('T')[0],
    opening_balance: 200,
    total_income: 1850,
    total_expense: 350,
    calculated_balance: 1700,
    cash_count: null,
    difference: null,
    is_closed: false,
    movements_count: 12,
    payment_methods: {
      cash: 650,
      card: 800,
      pix: 400,
      transfer: 0,
    },
  }
}

export async function createCashMovement(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Create cash movement:', Object.fromEntries(formData))

  return { success: true, id: Date.now().toString() }
}

export async function closeDailyCash(formData: FormData) {
  // Mock implementation
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log('Close daily cash:', Object.fromEntries(formData))

  return { success: true, id: Date.now().toString() }
}
