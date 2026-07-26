/**
 * Defaults de periodo escolar / bimestre (fuente única en front).
 *
 * Periodo: siempre el activo (status=true).
 * Bimestre: hoy ∈ [inicio, fin] → si no, último pasado → si no, primero.
 */

import PeriodService from '@/services/PeriodService'
import BimesterService from '@/services/BimesterService'

const extractLaravelData = (response) => response?.data?.data ?? []

export const formatIsoDate = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export const todayIsoDate = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * @param {Array<{start_date?: string, end_date?: string, number?: number|string}>} bimesters
 * @param {{ maxNumber?: number, today?: string }} [options]
 * @returns {object|null} bimestre seleccionado (objeto completo)
 */
export function resolveDefaultBimester(bimesters = [], options = {}) {
  const maxNumber = options.maxNumber ?? 4
  const today = options.today || todayIsoDate()

  const list = [...(bimesters || [])]
    .filter((item) => Number(item.number) <= maxNumber)
    .sort((a, b) => Number(a.number) - Number(b.number))

  if (!list.length) return null

  const current = list.find((item) => {
    const start = formatIsoDate(item.start_date)
    const end = formatIsoDate(item.end_date)
    return Boolean(start && end && start <= today && today <= end)
  })
  if (current) return current

  const past = list
    .filter((item) => {
      const end = formatIsoDate(item.end_date)
      return Boolean(end && end < today)
    })
    .sort((a, b) => formatIsoDate(b.end_date).localeCompare(formatIsoDate(a.end_date)))

  if (past.length) return past[0]

  return list[0]
}

export function resolveDefaultBimesterNumber(bimesters = [], options = {}) {
  const selected = resolveDefaultBimester(bimesters, options)
  return selected ? Number(selected.number) : null
}

export function resolveDefaultBimesterId(bimesters = [], options = {}) {
  const selected = resolveDefaultBimester(bimesters, options)
  return selected?.id != null ? Number(selected.id) : null
}

/**
 * Año del periodo activo; si no está en availableYears, el primero de la lista.
 */
export async function resolveActiveSchoolYear(availableYears = []) {
  try {
    const response = await PeriodService.getItems()
    const periods = extractLaravelData(response)
    const active = periods.find((period) => period.status)
    const activeYear = active?.year != null ? Number(active.year) : null
    if (activeYear && (!availableYears.length || availableYears.includes(activeYear))) {
      return activeYear
    }
  } catch {
    // fallback
  }

  if (availableYears.length) return availableYears[0]
  return new Date().getFullYear()
}

export async function resolveActivePeriod() {
  try {
    const response = await PeriodService.getItems()
    const periods = extractLaravelData(response)
    return periods.find((period) => period.status) || periods[0] || null
  } catch {
    return null
  }
}

export async function loadSchoolYearOptions() {
  const response = await BimesterService.list()
  const data = extractLaravelData(response)
  const years = [...new Set(data.map((item) => Number(item.year)))].sort((a, b) => b - a)
  return years.length ? years : [new Date().getFullYear()]
}
