import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import AcademicRiskService from '@/services/AcademicRiskService'
import BimesterService from '@/services/BimesterService'

const EMPTY_SUMMARY = {
  total_students: 0,
  predicted_students: 0,
  pending_students: 0,
  coverage_percentage: 0,
  risk_counts: {
    very_low: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
  high_or_critical: 0,
  high_or_critical_percentage: 0,
  classrooms_count: 0,
  last_updated: null,
}

const EMPTY_ALERTS = {
  high_risk: [],
  pending: [],
  high_risk_total: 0,
  pending_total: 0,
}

const extractLaravelData = (response) => response?.data?.data ?? []

export const useAcademicRiskDashboardStore = defineStore('academicRiskDashboard', () => {
  const filters = ref({
    schoolYear: null,
    bimester: null,
  })

  const schoolYears = ref([])
  const bimesters = ref([])

  const summary = ref({ ...EMPTY_SUMMARY })
  const alerts = ref({ ...EMPTY_ALERTS })
  const topClassrooms = ref([])
  const classrooms = ref([])

  const loading = ref(false)
  const updating = ref(false)
  const error = ref(null)
  const connectionError = ref(false)
  const scope = ref({
    role: null,
    unrestricted: false,
    canUpdatePredictions: false,
    isStudentView: false,
  })

  const selectedBimester = computed(() => (
    bimesters.value.find((item) => item.number === filters.value.bimester) || null
  ))

  const canQuery = computed(() => (
    Boolean(filters.value.schoolYear) && Boolean(filters.value.bimester)
  ))

  const canUpdatePredictions = computed(() => (
    scope.value.canUpdatePredictions
    && Boolean(filters.value.schoolYear)
    && Boolean(filters.value.bimester)
    && !updating.value
    && !loading.value
  ))

  const loadSchoolYears = async () => {
    const response = await BimesterService.list()
    const data = extractLaravelData(response)
    const years = [...new Set(data.map((item) => item.year))].sort((a, b) => b - a)
    schoolYears.value = years.length ? years : [new Date().getFullYear()]
    if (!filters.value.schoolYear) {
      filters.value.schoolYear = schoolYears.value[0]
    }
  }

  const loadBimesters = async () => {
    if (!filters.value.schoolYear) {
      bimesters.value = []
      return
    }
    const response = await BimesterService.list(filters.value.schoolYear)
    bimesters.value = extractLaravelData(response)
      .filter((item) => item.number <= 3)
      .sort((a, b) => a.number - b.number)

    if (!bimesters.value.some((item) => item.number === filters.value.bimester)) {
      filters.value.bimester = bimesters.value[0]?.number ?? null
    }
  }

  const loadScope = async () => {
    const response = await AcademicRiskService.getScope(filters.value.schoolYear)
    const data = response.data?.data ?? {}
    scope.value = {
      role: data.role ?? null,
      unrestricted: Boolean(data.unrestricted),
      canUpdatePredictions: Boolean(data.can_generate_predictions ?? data.can_update_predictions),
      isStudentView: data.role === 'ESTUDIANTE',
    }
  }

  const queryParams = () => ({
    school_year: filters.value.schoolYear,
    bimester: filters.value.bimester,
  })

  const loadOverview = async () => {
    if (!canQuery.value) return
    loading.value = true
    error.value = null
    connectionError.value = false

    try {
      const response = await AcademicRiskService.getDashboard(queryParams())
      const data = response.data?.data ?? {}
      summary.value = { ...EMPTY_SUMMARY, ...(data.summary || {}) }
      alerts.value = { ...EMPTY_ALERTS, ...(data.alerts || {}) }
      topClassrooms.value = data.top_classrooms || []
    } catch (err) {
      if (!err.response) connectionError.value = true
      error.value = err.response?.data?.message
        || 'No se pudo cargar el dashboard de alerta temprana.'
      summary.value = { ...EMPTY_SUMMARY }
      alerts.value = { ...EMPTY_ALERTS }
      topClassrooms.value = []
    } finally {
      loading.value = false
    }
  }

  const loadClassrooms = async () => {
    if (!canQuery.value) return
    loading.value = true
    error.value = null
    connectionError.value = false

    try {
      const response = await AcademicRiskService.getClassrooms(queryParams())
      const data = response.data?.data ?? {}
      summary.value = { ...EMPTY_SUMMARY, ...(data.summary || {}) }
      classrooms.value = data.classrooms || []
    } catch (err) {
      if (!err.response) connectionError.value = true
      error.value = err.response?.data?.message
        || 'No se pudo cargar el comparativo de aulas.'
      summary.value = { ...EMPTY_SUMMARY }
      classrooms.value = []
    } finally {
      loading.value = false
    }
  }

  const bootstrapOverview = async () => {
    loading.value = true
    error.value = null
    connectionError.value = false
    try {
      await loadSchoolYears()
      await loadBimesters()
      await loadScope()
      await loadOverview()
    } catch (err) {
      if (!err.response) connectionError.value = true
      error.value = 'No se pudo inicializar el dashboard.'
      loading.value = false
    }
  }

  const bootstrapClassrooms = async () => {
    loading.value = true
    error.value = null
    connectionError.value = false
    try {
      await loadSchoolYears()
      await loadBimesters()
      await loadScope()
      await loadClassrooms()
    } catch (err) {
      if (!err.response) connectionError.value = true
      error.value = 'No se pudo inicializar el comparativo de aulas.'
      loading.value = false
    }
  }

  const onSchoolYearChange = async (year) => {
    filters.value.schoolYear = year
    await loadBimesters()
    await loadScope()
  }

  const onBimesterChange = (bimester) => {
    filters.value.bimester = bimester
  }

  const updatePredictionsAll = async () => {
    updating.value = true
    connectionError.value = false

    try {
      const response = await AcademicRiskService.updatePredictionsAll({
        school_year: filters.value.schoolYear,
        bimester: filters.value.bimester,
      })
      await loadClassrooms()
      return response.data
    } catch (err) {
      if (!err.response) connectionError.value = true
      const data = err.response?.data ?? {}
      err.validationPayload = data
      throw err
    } finally {
      updating.value = false
    }
  }

  return {
    filters,
    schoolYears,
    bimesters,
    summary,
    alerts,
    topClassrooms,
    classrooms,
    loading,
    updating,
    error,
    connectionError,
    scope,
    selectedBimester,
    canQuery,
    canUpdatePredictions,
    bootstrapOverview,
    bootstrapClassrooms,
    loadOverview,
    loadClassrooms,
    onSchoolYearChange,
    onBimesterChange,
    updatePredictionsAll,
  }
})
