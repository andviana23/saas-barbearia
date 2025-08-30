import ClientesHarness from './page.harness';
import type { Metadata } from 'next';
import ProtectedLayout from '@/components/features/layout/ProtectedLayout';
import ClientesContent from './components/ClientesContent';

export const metadata: Metadata = {
  title: 'Clientes | Trato',
  description: 'Gestão completa de clientes da barbearia',
};

export default function ClientesPage() {
  if (process.env.E2E_MODE === '1') {
    return <ClientesHarness />;
  }
  return (
    <ProtectedLayout>
      <ClientesContent />
    </ProtectedLayout>
  );
}
