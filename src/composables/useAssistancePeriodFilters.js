import { computed, ref } from 'vue'
import PeriodService from '@/services/PeriodService'
import BimesterService from '@/services/BimesterService'
import {
  formatIsoDate,
  resolveActivePeriod,
  resolveDefaultBimesterId,
} from '@/utils/schoolPeriodDefaults'

/**
 * Filtros de periodo/bimestre para reportes de asistencia QR.
 * Default: periodo activo + bimestre vigente (hoy / último pasado / primero).
 * Opción "" = "Todo el periodo".
 */
export function useAssistancePeriodFilters() {
  const periods = ref([])
  const bimesters = ref([])
  const periodId = ref(null)
  const bimesterId = ref('')
  const loadingFilters = ref(false)

  const selectedPeriod = computed(() =>
    periods.value.find((p) => Number(p.id) === Number(periodId.value)) || null,
  )

  const queryParams = computed(() => {
    const params = {}
    if (periodId.value !== null && periodId.value !== undefined && periodId.value !== '') {
      params.period_id = Number(periodId.value) || periodId.value
    }
    if (bimesterId.value !== null && bimesterId.value !== undefined && String(bimesterId.value) !== '') {
      params.bimester_id = Number(bimesterId.value) || bimesterId.value
    }
    return params
  })

  const applyDefaultBimester = () => {
    const defaultId = resolveDefaultBimesterId(bimesters.value, { maxNumber: 4 })
    bimesterId.value = defaultId != null ? String(defaultId) : ''
  }

  const loadBimesters = async () => {
    const year = selectedPeriod.value?.year
    if (!year) {
      bimesters.value = []
      return
    }
    const response = await BimesterService.list(year)
    const list = response.data?.data || []
    bimesters.value = list.map((b) => ({
      ...b,
      start_date: formatIsoDate(b.start_date),
      end_date: formatIsoDate(b.end_date),
    }))
  }

  const loadFilters = async () => {
    loadingFilters.value = true
    try {
      const response = await PeriodService.getItems()
      const list = response.data?.data || []
      periods.value = list.map((p) => ({
        ...p,
        start_time: formatIsoDate(p.start_time),
        end_time: formatIsoDate(p.end_time),
      }))

      const active = await resolveActivePeriod()
      const matched = active
        ? periods.value.find((p) => Number(p.id) === Number(active.id))
        : null
      periodId.value = matched?.id ?? periods.value.find((p) => p.status)?.id ?? periods.value[0]?.id ?? null

      await loadBimesters()
      applyDefaultBimester()
    } finally {
      loadingFilters.value = false
    }
  }

  const onPeriodChange = async () => {
    await loadBimesters()
    applyDefaultBimester()
  }

  return {
    periods,
    bimesters,
    periodId,
    bimesterId,
    loadingFilters,
    selectedPeriod,
    queryParams,
    loadFilters,
    onPeriodChange,
  }
}
