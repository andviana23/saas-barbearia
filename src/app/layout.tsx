import type { Metadata } from 'next';
import Providers from './providers';
import { LayoutHarness } from '../components/LayoutHarness';

export const metadata: Metadata = {
  title: 'Trato • Painel',
  description: 'Gestão de barbearias',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isHarness = process.env.E2E_MODE === '1';

  return (
    <html lang="pt-BR">
      <body>
        <Providers>{isHarness ? <LayoutHarness>{children}</LayoutHarness> : children}</Providers>
      </body>
    </html>
  );
}
