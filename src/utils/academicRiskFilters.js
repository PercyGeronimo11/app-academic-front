/**
 * Helpers específicos de Alerta Temprana + reexport de defaults de periodo/bimestre.
 */
export {
  formatIsoDate,
  todayIsoDate,
  resolveDefaultBimester,
  resolveDefaultBimesterNumber,
  resolveDefaultBimesterId,
  resolveActiveSchoolYear,
  resolveActivePeriod,
  loadSchoolYearOptions,
} from '@/utils/schoolPeriodDefaults'

export function formatSkippedStudentLabel(item) {
  if (typeof item === 'string') return item
  if (!item || typeof item !== 'object') return String(item ?? '')
  const name = item.name || `Alumno #${item.id ?? '?'}`
  const missing = Array.isArray(item.missing_fields) ? item.missing_fields : []
  if (!missing.length) return name
  return `${name} — ${missing.slice(0, 3).join(' ')}${missing.length > 3 ? '…' : ''}`
}
