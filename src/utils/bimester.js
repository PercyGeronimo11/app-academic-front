/**
 * Elige el bimestre vigente (is_current) según fechas del backend;
 * si no hay uno marcado, usa el primero de la lista.
 */
export function pickCurrentBimesterId(bimesters = []) {
  if (!Array.isArray(bimesters) || !bimesters.length) return null
  const current = bimesters.find((item) => item.is_current)
  const chosen = current || bimesters[0]
  return chosen?.id != null ? Number(chosen.id) : null
}
