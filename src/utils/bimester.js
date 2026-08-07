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

/** Filtra bimestres al año del periodo activo (bimestre is_current o el más reciente). */
export function filterActivePeriodBimesters(bimesters = []) {
  if (!Array.isArray(bimesters) || !bimesters.length) return []
  const current = bimesters.find((item) => item.is_current)
  const year = current?.year ?? bimesters[0]?.year
  return bimesters
    .filter((item) => Number(item.year) === Number(year))
    .slice()
    .sort((a, b) => Number(a.number) - Number(b.number))
}

export function isDateInBimester(dateStr, bimester) {
  if (!dateStr || !bimester) return true
  const date = String(dateStr).slice(0, 10)
  const start = bimester.start_date ? String(bimester.start_date).slice(0, 10) : null
  const end = bimester.end_date ? String(bimester.end_date).slice(0, 10) : null
  if (start && date < start) return false
  if (end && date > end) return false
  return true
}
