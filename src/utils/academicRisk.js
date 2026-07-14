import { BIMESTER_TO_MODEL, RISK_LEVELS } from '@/types/academicRisk'

const FACTOR_LABELS = {
  MAT_CANTIDAD: 'Matemática - Cantidad',
  MAT_REGULARIDAD: 'Matemática - Regularidad',
  MAT_FORMA: 'Matemática - Forma',
  MAT_DATOS: 'Matemática - Datos',
  COM_ORAL: 'Comunicación - Oral',
  COM_LECTURA: 'Comunicación - Lectura',
  COM_ESCRITURA: 'Comunicación - Escritura',
  CYT_INDAGA: 'Ciencia - Indaga',
  CYT_EXPLICA: 'Ciencia - Explica',
  CYT_DISENA: 'Ciencia - Diseña',
  SOC_HISTORIA: 'Sociales - Historia',
  SOC_ESPACIO: 'Sociales - Espacio',
  SOC_ECONOMIA: 'Sociales - Economía',
  ING_ORAL: 'Inglés - Oral',
  ING_LECTURA: 'Inglés - Lectura',
  ING_ESCRITURA: 'Inglés - Escritura',
  TOTAL_ABSENCES: 'Total de faltas',
  TOTAL_TARDINESS: 'Total de tardanzas',
  INCIDENT_COUNT: 'Incidentes de conducta',
  WORKS: 'Trabaja',
  FAMILY_SITUATION: 'Situación familiar',
}

const CATEGORY_LABELS = {
  ACADEMIC: 'Académicas',
  ATTENDANCE: 'Asistencia',
  BEHAVIOR: 'Conducta',
  TUTORING: 'Tutoría',
  FAMILY: 'Familia',
}

const RISK_LABELS = {
  [RISK_LEVELS.VERY_LOW]: 'Muy Bajo',
  [RISK_LEVELS.LOW]: 'Bajo',
  [RISK_LEVELS.MEDIUM]: 'Medio',
  [RISK_LEVELS.HIGH]: 'Alto',
  [RISK_LEVELS.CRITICAL]: 'Crítico',
}

export const getModelCodeByBimester = (bimester) => BIMESTER_TO_MODEL[bimester] || null

export const formatFactorName = (factorName) => {
  if (!factorName) return 'Factor desconocido'
  const match = factorName.match(/^(.+)_B(\d+)$/)
  if (!match) return factorName
  const [, code, bimester] = match
  const label = FACTOR_LABELS[code] || code.replaceAll('_', ' ')
  return `${label} (B${bimester})`
}

export const formatImpactLabel = (importance) => {
  const value = Number(importance)
  if (value >= 0.2) return 'Alto'
  if (value >= 0.1) return 'Medio'
  return 'Bajo'
}

export const formatImpactPercent = (importance) => `${Math.round(Number(importance) * 100)} %`

export const getRiskLabel = (riskLevel) => RISK_LABELS[riskLevel] || 'Sin dato'

export const getRiskChipClass = (riskLevel) => {
  const classes = {
    [RISK_LEVELS.VERY_LOW]: 'risk-chip risk-chip--very-low',
    [RISK_LEVELS.LOW]: 'risk-chip risk-chip--low',
    [RISK_LEVELS.MEDIUM]: 'risk-chip risk-chip--medium',
    [RISK_LEVELS.HIGH]: 'risk-chip risk-chip--high',
    [RISK_LEVELS.CRITICAL]: 'risk-chip risk-chip--critical',
  }
  return classes[riskLevel] || 'risk-chip risk-chip--unknown'
}

export const getPriorityChipClass = (priority) => {
  const classes = {
    HIGH: 'priority-chip priority-chip--high',
    MEDIUM: 'priority-chip priority-chip--medium',
    LOW: 'priority-chip priority-chip--low',
  }
  return classes[priority] || 'priority-chip priority-chip--medium'
}

export const getPriorityLabel = (priority) => {
  const labels = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }
  return labels[priority] || priority
}

export const getCategoryLabel = (category) => CATEGORY_LABELS[category] || category

export const getStatusBadge = (status) => {
  const map = {
    updated: { color: 'success', label: 'Actualizado' },
    pending: { color: 'warning', label: 'Pendiente' },
    no_data: { color: 'secondary', label: 'Sin datos' },
  }
  return map[status] || map.no_data
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatConfidence = (confidence) => {
  if (confidence == null) return '—'
  const value = Number(confidence)
  if (Number.isNaN(value)) return '—'
  return `${(value <= 1 ? value * 100 : value).toFixed(1)} %`
}

export const buildStudentFullName = (student) => {
  const parts = [student?.surname_father, student?.surname_mother, student?.name || student?.nombres]
  return parts.filter(Boolean).join(' ').trim()
}
