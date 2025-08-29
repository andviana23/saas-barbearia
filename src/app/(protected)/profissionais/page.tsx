import React, { Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProfissionaisClient from './profissionais.client';

export default function ProfissionaisPage() {
  return (
    <AppLayout title="Profissionais">
      <Suspense fallback={<p>Carregando profissionais...</p>}>
        <ProfissionaisClient />
      </Suspense>
    </AppLayout>
  );
}
