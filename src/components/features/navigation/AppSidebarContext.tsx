// DEPRECATED: Contexto de sidebar anterior removido.
export function useAppSidebar() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('useAppSidebar foi descontinuado. Use AppLayout + TratoSidebar.');
  }
  return { isOpen: true } as any;
}
