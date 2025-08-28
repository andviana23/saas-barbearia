'use client';
import { useQuery } from '@tanstack/react-query';

interface AgendaItemMock {
  id: string;
  profissional: string;
  inicio: string;
  fim: string;
  cliente: string;
  servico: string;
}

async function fetchAgendaMock(): Promise<AgendaItemMock[]> {
  // Placeholder – substituir por chamada real (Server Action ou endpoint interno)
  return [
    {
      id: '1',
      profissional: 'Profissional A',
      inicio: '09:00',
      fim: '09:30',
      cliente: 'João',
      servico: 'Corte',
    },
  ];
}

export function useAgendaData() {
  return useQuery({ queryKey: ['agenda', 'lista', { v: 1 }], queryFn: fetchAgendaMock });
}
