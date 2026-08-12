/**
 * Presentación pedagógica de factores / recomendaciones (detalle alumno).
 * Agrupa B1/B2, traduce valores y limita ruido cuando el riesgo es bajo.
 */

import { RISK_LEVELS } from '@/types/academicRisk'
import { getRiskLabel } from '@/utils/academicRisk'

const FACTOR_CONCEPT_LABELS = {
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
  AVERAGE_CONDUCT: 'Promedio de gravedad de conducta',
  INCIDENT_COUNT: 'Promedio de gravedad de conducta',
  WORKS: 'Situación laboral (trabaja)',
  FAMILY_SITUATION: 'Situación familiar',
}

const FAMILY_LABELS = {
  PADRES: 'Vive con ambos padres',
  MADRE: 'Vive principalmente con la madre',
  PADRE: 'Vive principalmente con el padre',
  ABUELOS: 'Vive con abuelos',
  TIOS: 'Vive con tíos',
  OTROS: 'Otra situación familiar',
}

export const normalizeFactorConcept = (factorName = '') => (
  String(factorName).replace(/_B[1-4]$/i, '').toUpperCase()
)

export const formatFactorConceptName = (factorName) => {
  const concept = normalizeFactorConcept(factorName)
  return FACTOR_CONCEPT_LABELS[concept] || concept.replaceAll('_', ' ')
}

const parseBimesterSuffix = (factorName = '') => {
  const match = String(factorName).match(/_B([1-4])$/i)
  return match ? Number(match[1]) : null
}

const describeFactorValue = (concept, rawValue) => {
  const value = rawValue == null || rawValue === '' ? null : String(rawValue).trim()
  if (value == null || value === 'nan') return 'Sin dato registrado'

  if (concept === 'TOTAL_ABSENCES') {
    const n = Number(value)
    if (Number.isNaN(n)) return `Dato de faltas: ${value}`
    if (n === 0) return 'Sin faltas registradas'
    return n === 1 ? 'Tiene 1 falta registrada' : `Tiene ${n} faltas registradas`
  }

  if (concept === 'TOTAL_TARDINESS') {
    const n = Number(value)
    if (Number.isNaN(n)) return `Dato de tardanzas: ${value}`
    if (n === 0) return 'Sin tardanzas registradas'
    return n === 1 ? 'Tiene 1 tardanza registrada' : `Tiene ${n} tardanzas registradas`
  }

  if (concept === 'AVERAGE_CONDUCT' || concept === 'INCIDENT_COUNT') {
    const n = Number(value)
    if (Number.isNaN(n)) return `Dato de conducta: ${value}`
    if (n === 0) return 'Sin incidentes de conducta'
    return `Promedio de gravedad de conducta: ${n.toFixed(2)} (escala 1 a 5)`
  }

  if (concept === 'WORKS') {
    const normalized = value.toLowerCase()
    if (['1', 'true', 'si', 'sí', 'yes'].includes(normalized)) {
      return 'El alumno trabaja además de estudiar'
    }
    if (['0', 'false', 'no'].includes(normalized)) {
      return 'El alumno no reporta trabajo adicional'
    }
    return `Situación laboral: ${value}`
  }

  if (concept === 'FAMILY_SITUATION') {
    const key = value.toUpperCase()
    return FAMILY_LABELS[key] || `Situación familiar: ${value}`
  }

  if (['AD', 'A', 'B', 'C'].includes(value.toUpperCase())) {
    return `Calificativo actual: ${value.toUpperCase()}`
  }

  return `Dato del alumno: ${value}`
}

export const formatInfluenceText = (importance) => {
  const pct = Math.round(Number(importance || 0) * 100)
  let weight = 'baja'
  if (pct >= 20) weight = 'alta'
  else if (pct >= 10) weight = 'media'
  return {
    percentLabel: `${pct} %`,
    weightLabel: weight,
    sentence: `Influencia en la predicción: ${pct}% (${weight})`,
  }
}

/**
 * Agrupa B1/B2, limita cantidad según riesgo y prepara textos legibles.
 */
export const presentFactorsForDisplay = (factors = [], riskLevel = null) => {
  const bucket = new Map()

  for (const factor of factors || []) {
    const rawName = factor.factor_name || ''
    const concept = normalizeFactorConcept(rawName)
    if (!concept) continue

    const importance = Number(factor.importance) || 0
    const bimester = parseBimesterSuffix(rawName)
    const existing = bucket.get(concept)

    if (!existing) {
      bucket.set(concept, {
        concept,
        label: formatFactorConceptName(concept),
        importanceSum: importance,
        bestImportance: importance,
        bestValue: factor.student_value,
        bestBimester: bimester,
        sources: 1,
      })
      continue
    }

    existing.importanceSum += importance
    existing.sources += 1

    // Preferir el valor del bimestre más reciente; si empatan, el de mayor importancia
    const shouldReplaceValue = (
      (bimester != null && (existing.bestBimester == null || bimester >= existing.bestBimester))
      || (bimester === existing.bestBimester && importance >= existing.bestImportance)
      || (bimester == null && importance > existing.bestImportance)
    )
    if (shouldReplaceValue) {
      existing.bestValue = factor.student_value
      existing.bestBimester = bimester ?? existing.bestBimester
      existing.bestImportance = Math.max(existing.bestImportance, importance)
    } else {
      existing.bestImportance = Math.max(existing.bestImportance, importance)
    }
  }

  let rows = [...bucket.values()]
    .map((item) => {
      const influence = formatInfluenceText(item.importanceSum)
      return {
        concept: item.concept,
        label: item.label,
        importance: item.importanceSum,
        valueDescription: describeFactorValue(item.concept, item.bestValue),
        influenceSentence: influence.sentence,
        percentLabel: influence.percentLabel,
        weightLabel: influence.weightLabel,
      }
    })
    .sort((a, b) => b.importance - a.importance)

  const level = Number(riskLevel)
  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) {
    rows = rows.slice(0, 3)
  } else if (level === RISK_LEVELS.MEDIUM) {
    rows = rows.slice(0, 4)
  } else {
    rows = rows.slice(0, 5)
  }

  return rows
}

/**
 * Filtra recomendaciones según nivel de riesgo para no saturar alumnos de buen desempeño.
 */
export const presentRecommendationsForDisplay = (recommendations = [], riskLevel = null) => {
  const level = Number(riskLevel)
  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  let items = [...(recommendations || [])].sort(
    (a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9),
  )

  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) {
    // Solo correctivas claras; máximo 3
    items = items
      .filter((item) => item.priority === 'HIGH' || item.priority === 'MEDIUM')
      .slice(0, 3)
      .map((item) => ({
        ...item,
        tone: item.priority === 'HIGH' ? 'corrective' : 'preventive',
        toneLabel: item.priority === 'HIGH' ? 'Seguimiento' : 'Preventiva',
      }))
  } else if (level === RISK_LEVELS.MEDIUM) {
    items = items.slice(0, 5).map((item) => ({
      ...item,
      tone: item.priority === 'HIGH' ? 'corrective' : 'preventive',
      toneLabel: item.priority === 'HIGH' ? 'Prioritaria' : 'Preventiva',
    }))
  } else {
    items = items.map((item) => ({
      ...item,
      tone: 'corrective',
      toneLabel: item.priority === 'HIGH' ? 'Urgente' : 'Importante',
    }))
  }

  return items
}

export const buildRiskGuideMessage = (riskLevel, factorsCount = 0, recommendationsCount = 0) => {
  const level = Number(riskLevel)
  const label = getRiskLabel(level)

  if (!level) {
    return 'Aún no hay predicción para este alumno.'
  }

  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) {
    if (factorsCount === 0 && recommendationsCount === 0) {
      return `Riesgo ${label}: buen desempeño general. No hay puntos críticos de seguimiento.`
    }
    const parts = []
    if (factorsCount > 0) parts.push(`${factorsCount} punto(s) a vigilar`)
    if (recommendationsCount > 0) parts.push(`${recommendationsCount} acción(es) preventiva(s)`)
    return `Riesgo ${label}: buen desempeño general. ${parts.join(' y ')}.`
  }

  if (level === RISK_LEVELS.MEDIUM) {
    return `Riesgo ${label}: conviene seguimiento tutorial. Revise factores y recomendaciones.`
  }

  return `Riesgo ${label}: requiere intervención prioritaria. Revise factores y plan de acción.`
}
