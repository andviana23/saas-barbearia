import type { Metadata } from 'next';
import ProtectedLayout from '@/components/features/layout/ProtectedLayout';
import ClientesContent from './components/ClientesContent';

export const metadata: Metadata = {
  title: 'Clientes | Trato',
  description: 'Gestão completa de clientes da barbearia',
};

export default function ClientesPage() {
  return (
    <ProtectedLayout>
      <ClientesContent />
    </ProtectedLayout>
  );
}
