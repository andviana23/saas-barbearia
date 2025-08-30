// DEPRECATED: AppShell removido em favor de AppLayout + TratoSidebar.
// Qualquer import residual deve ser substituído por AppLayout ou removido.
export default function AppShell() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('AppShell foi descontinuado. Use AppLayout (TratoSidebar).');
  }
  return null;
}
