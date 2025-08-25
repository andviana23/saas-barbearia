import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Providers } from './providers'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Trato - Sistema de Gestão',
  description: 'Sistema completo para gestão de barbearias',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
