// DEPRECATED: AppSidebar substituído por TratoSidebar.
export default function AppSidebar() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('AppSidebar foi descontinuado. Use TratoSidebar.');
  }
  return null;
}
