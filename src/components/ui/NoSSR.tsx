'use client';

import { ReactNode, useEffect, useState } from 'react';

interface NoSSRProps {
  children: ReactNode;
}

/**
 * Componente para renderizar conteúdo apenas no cliente
 * Evita problemas de hidratação com extensões de navegador
 */
export function NoSSR({ children }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
