/**
 * Helpers de transição para migração de unidade_id -> unit_id.
 * Mantém compatibilidade enquanto o código ainda usa o campo legacy.
 */

export type DualUnitInput = { unidade_id?: string | null; unit_id?: string | null } | undefined;

/** Extrai o unitId independente do nome usado. */
export function extractUnitId(input: DualUnitInput): string | undefined {
  if (!input) return undefined;
  return (input.unit_id || input.unidade_id || undefined) ?? undefined;
}

/**
 * Constrói objeto de filtro usando apenas o campo legacy (unidade_id) nesta fase.
 * Facilita futura troca para unit_id alterando apenas esta função.
 */
export function buildUnitFilter(unitId?: string) {
  return unitId ? { unidade_id: unitId } : {};
}

/** Garante que ambos campos existam no FormData (apenas para ações de criação/atualização). */
export function ensureDualUnitFields(formData: FormData) {
  const legacy = formData.get('unidade_id');
  const neo = formData.get('unit_id');
  const value = (neo || legacy) as string | null;
  if (value && !legacy) formData.set('unidade_id', value);
  if (value && !neo) formData.set('unit_id', value);
  return value || undefined;
}

/** Lê unitId de um FormData (qualquer nome) */
export function resolveUnitIdFromFormData(formData: FormData): string | undefined {
  return (formData.get('unit_id') || formData.get('unidade_id') || undefined) as string | undefined;
}
