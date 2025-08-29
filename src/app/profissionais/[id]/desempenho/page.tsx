import { Metadata } from 'next';
import DesempenhoProfissionalPage from './view';

export const metadata: Metadata = {
  title: 'Desempenho do Profissional | Trato',
  description: 'Relatório de desempenho individual do profissional',
};

interface Props {
  params: { id: string };
}

export default async function Page({ params }: Props) {
  // TODO: fetch real metrics via server actions
  return <DesempenhoProfissionalPage profissionalId={params.id} />;
}
