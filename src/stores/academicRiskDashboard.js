import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import AcademicRiskService from '@/services/AcademicRiskService'
import BimesterService from '@/services/BimesterService'
import {
  loadSchoolYearOptions,
  resolveActiveSchoolYear,
  resolveDefaultBimesterNumber,
} from '@/utils/academicRiskFilters'
import { resolveDefaultBimester } from '@/utils/schoolPeriodDefaults'

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
    gradeSectionId: null, // null = Todas
  })

  const schoolYears = ref([])
  const bimesters = ref([])
  const gradeSections = ref([])
  const activeSchoolYear = ref(null)

  const summary = ref({ ...EMPTY_SUMMARY })
  const alerts = ref({ ...EMPTY_ALERTS })
  const topClassrooms = ref([])
  const classrooms = ref([])
  const students = ref([])
  const insights = ref({
    top_factors: [],
    top_recommendations: [],
    top_merit: [],
    top_punctuality: [],
  })

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

  /** Evita bootstrap / overview duplicados (remount HMR, doble navigate). */
  let bootstrapPromise = null
  let overviewPromise = null
  let lastOverviewKey = null

  const selectedBimester = computed(() => (
    bimesters.value.find((item) => item.number === filters.value.bimester) || null
  ))

  const selectedGradeSection = computed(() => {
    if (!filters.value.gradeSectionId) return null
    return gradeSections.value.find((item) => item.id === filters.value.gradeSectionId) || null
  })

  const isAllClassrooms = computed(() => filters.value.gradeSectionId == null)

  const currentWritableBimester = computed(() => {
    if (!activeSchoolYear.value || Number(filters.value.schoolYear) !== Number(activeSchoolYear.value)) {
      return null
    }
    return resolveDefaultBimester(bimesters.value, { maxNumber: 3 })
  })

  const isWritableWindow = computed(() => {
    const current = currentWritableBimester.value
    return Boolean(
      current
      && Number(filters.value.schoolYear) === Number(activeSchoolYear.value)
      && Number(filters.value.bimester) === Number(current.number),
    )
  })

  const canQuery = computed(() => (
    Boolean(filters.value.schoolYear) && Boolean(filters.value.bimester)
  ))

  const canUpdatePredictions = computed(() => (
    scope.value.canUpdatePredictions
    && isWritableWindow.value
    && Boolean(filters.value.schoolYear)
    && Boolean(filters.value.bimester)
    && !updating.value
    && !loading.value
  ))

  const overviewKey = () => {
    const f = filters.value
    return `${f.schoolYear ?? ''}|${f.bimester ?? ''}|${f.gradeSectionId ?? 'all'}`
  }

  const loadSchoolYears = async () => {
    schoolYears.value = await loadSchoolYearOptions()
    activeSchoolYear.value = await resolveActiveSchoolYear(schoolYears.value)
    if (!filters.value.schoolYear) {
      filters.value.schoolYear = activeSchoolYear.value
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
      filters.value.bimester = resolveDefaultBimesterNumber(bimesters.value, { maxNumber: 3 })
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

  const loadGradeSections = async () => {
    if (!filters.value.schoolYear) {
      gradeSections.value = []
      return
    }
    const response = await AcademicRiskService.getGradeSections({
      school_year: filters.value.schoolYear,
    })
    gradeSections.value = extractLaravelData(response).map((item) => ({
      id: Number(item.id),
      label: item.label || `${item.grade} ${item.section}`,
      grade: item.grade,
      section: item.section,
    }))

    if (
      filters.value.gradeSectionId != null
      && !gradeSections.value.some((item) => item.id === filters.value.gradeSectionId)
    ) {
      filters.value.gradeSectionId = null
    }
  }

  /** Tras tener año: bimestres + scope + aulas en paralelo. */
  const loadYearDependentMeta = async () => {
    await Promise.all([
      loadBimesters(),
      loadScope(),
      loadGradeSections(),
    ])
  }

  const queryParams = () => {
    const params = {
      school_year: filters.value.schoolYear,
      bimester: filters.value.bimester,
    }
    if (filters.value.gradeSectionId != null) {
      params.grade_section_id = filters.value.gradeSectionId
    }
    return params
  }

  const applyOverviewPayload = (data) => {
    summary.value = { ...EMPTY_SUMMARY, ...(data.summary || {}) }
    alerts.value = { ...EMPTY_ALERTS, ...(data.alerts || {}) }
    topClassrooms.value = data.top_classrooms || []
    classrooms.value = data.classrooms || []
    students.value = data.students || []
    insights.value = {
      top_factors: data.insights?.top_factors || [],
      top_recommendations: data.insights?.top_recommendations || [],
      top_merit: data.insights?.top_merit || [],
      top_punctuality: data.insights?.top_punctuality || [],
    }
  }

  const resetOverviewPayload = () => {
    summary.value = { ...EMPTY_SUMMARY }
    alerts.value = { ...EMPTY_ALERTS }
    topClassrooms.value = []
    classrooms.value = []
    students.value = []
    insights.value = {
      top_factors: [],
      top_recommendations: [],
      top_merit: [],
      top_punctuality: [],
    }
  }

  /**
   * @param {{ force?: boolean }} [options]
   */
  const loadOverview = async (options = {}) => {
    const force = Boolean(options?.force)
    if (!canQuery.value) return

    const key = overviewKey()

    // Misma consulta ya en vuelo → reutilizar
    if (overviewPromise && lastOverviewKey === key) {
      return overviewPromise
    }

    // Misma clave recién cargada y no force → no repetir
    if (!force && !overviewPromise && lastOverviewKey === key && !error.value && !connectionError.value) {
      return
    }

    lastOverviewKey = key
    loading.value = true
    error.value = null
    connectionError.value = false

    overviewPromise = (async () => {
      try {
        const response = await AcademicRiskService.getDashboard(queryParams())
        // Si el usuario cambió filtros mientras tanto, descartar resultado viejo
        if (overviewKey() !== key) return
        applyOverviewPayload(response.data?.data ?? {})
      } catch (err) {
        if (overviewKey() !== key) return
        if (!err.response) connectionError.value = true
        error.value = err.response?.data?.message
          || 'No se pudo cargar el dashboard de alerta temprana.'
        resetOverviewPayload()
      } finally {
        if (lastOverviewKey === key) {
          overviewPromise = null
          loading.value = false
        }
      }
    })()

    return overviewPromise
  }

  const bootstrapOverview = async () => {
    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = (async () => {
      loading.value = true
      error.value = null
      connectionError.value = false
      try {
        await loadSchoolYears()
        await loadYearDependentMeta()
        await loadOverview({ force: true })
      } catch (err) {
        if (!err.response) connectionError.value = true
        error.value = 'No se pudo inicializar el dashboard.'
        loading.value = false
      }
    })().finally(() => {
      bootstrapPromise = null
    })

    return bootstrapPromise
  }

  const onSchoolYearChange = async (year) => {
    filters.value.schoolYear = year
    filters.value.gradeSectionId = null
    lastOverviewKey = null
    await loadYearDependentMeta()
  }

  const onBimesterChange = (bimester) => {
    filters.value.bimester = bimester
  }

  const onGradeSectionChange = (gradeSectionId) => {
    filters.value.gradeSectionId = gradeSectionId == null || gradeSectionId === ''
      ? null
      : Number(gradeSectionId)
  }

  const updatePredictions = async () => {
    updating.value = true
    connectionError.value = false

    try {
      let response
      if (filters.value.gradeSectionId == null) {
        response = await AcademicRiskService.updatePredictionsAll({
          school_year: filters.value.schoolYear,
          bimester: filters.value.bimester,
        })
      } else {
        response = await AcademicRiskService.updatePredictions({
          school_year: filters.value.schoolYear,
          bimester: filters.value.bimester,
          grade_section_id: filters.value.gradeSectionId,
        })
      }
      await loadOverview({ force: true })
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
    gradeSections,
    activeSchoolYear,
    summary,
    alerts,
    topClassrooms,
    classrooms,
    students,
    insights,
    loading,
    updating,
    error,
    connectionError,
    scope,
    selectedBimester,
    selectedGradeSection,
    isAllClassrooms,
    isWritableWindow,
    canQuery,
    canUpdatePredictions,
    bootstrapOverview,
    loadOverview,
    onSchoolYearChange,
    onBimesterChange,
    onGradeSectionChange,
    updatePredictions,
  }
})
