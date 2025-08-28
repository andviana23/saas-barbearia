'use client';

import { ReactNode, useEffect } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

/**
 * Remove atributos de extensões de navegador que causam warnings de hidratação
 */
export function ClientOnly({ children }: ClientOnlyProps) {
  useEffect(() => {
    // Remove atributos de extensões comuns após a hidratação
    const removeExtensionAttributes = () => {
      const body = document.body;
      if (body) {
        // Remove atributos comuns de extensões
        const extensionAttributes = [
          'cz-shortcut-listen',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
          'spellcheck',
          'data-gramm',
          'data-gramm_editor',
          'data-enable-grammarly',
        ];

        extensionAttributes.forEach((attr) => {
          body.removeAttribute(attr);
        });
      }
    };

    // Executa após a hidratação
    const timer = setTimeout(removeExtensionAttributes, 100);

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
