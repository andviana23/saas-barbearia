// DEPRECATED: AppHeader anterior substituído por TratoHeader.
export default function AppHeader() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('AppHeader foi descontinuado. Use TratoHeader.');
  }
  return null;
}
