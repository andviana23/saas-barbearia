import React, { Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ServicosClient from './servicos.client';

export default function ServicosPage() {
  return (
    <AppLayout title="Serviços">
      <Suspense fallback={<p>Carregando serviços...</p>}>
        <ServicosClient />
      </Suspense>
    </AppLayout>
  );
}
