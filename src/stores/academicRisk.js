import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import AcademicRiskService from '@/services/AcademicRiskService'
import BimesterService from '@/services/BimesterService'
import MLService from '@/services/MLService'
import {
  PREDICTION_STATUS,
  RISK_LEVELS,
} from '@/types/academicRisk'
import {
  buildStudentFullName,
} from '@/utils/academicRisk'

const EMPTY_SUMMARY = {
  totalStudents: 0,
  veryLow: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
  lastUpdated: null,
}

const extractLaravelData = (response) => response?.data?.data ?? []

const buildRowStatus = (prediction) => {
  if (!prediction) return PREDICTION_STATUS.PENDING
  return PREDICTION_STATUS.UPDATED
}

export const useAcademicRiskStore = defineStore('academicRisk', () => {
  const filters = ref({
    schoolYear: null,
    bimester: null,
    gradeSectionId: null,
    studentId: null,
  })

  const schoolYears = ref([])
  const bimesters = ref([])
  const gradeSections = ref([])
  const students = ref([])
  const rows = ref([])
  const summary = ref({ ...EMPTY_SUMMARY })

  const loading = ref(false)
  const updating = ref(false)
  const predictingStudentId = ref(null)
  const drawerVisible = ref(false)
  const selectedRow = ref(null)
  const error = ref(null)
  const connectionError = ref(false)
  const scope = ref({
    role: null,
    unrestricted: false,
    canUpdatePredictions: false,
    isStudentView: false,
  })

  const filteredRows = computed(() => {
    if (!filters.value.studentId) return rows.value
    return rows.value.filter((row) => row.studentId === filters.value.studentId)
  })

  const canUpdate = computed(() => (
    scope.value.canUpdatePredictions
    && Boolean(filters.value.schoolYear)
    && Boolean(filters.value.bimester)
    && Boolean(filters.value.gradeSectionId)
    && !updating.value
    && !predictingStudentId.value
  ))

  const canPredictIndividual = computed(() => (
    scope.value.canUpdatePredictions
    && Boolean(filters.value.schoolYear)
    && Boolean(filters.value.bimester)
    && !updating.value
  ))

  const selectedGradeSection = computed(() => (
    gradeSections.value.find((item) => item.id === filters.value.gradeSectionId) || null
  ))

  const selectedBimester = computed(() => (
    bimesters.value.find((item) => item.number === filters.value.bimester) || null
  ))

  const resetSummary = () => {
    summary.value = { ...EMPTY_SUMMARY }
  }

  const computeSummary = (items) => {
    const next = { ...EMPTY_SUMMARY, totalStudents: items.length }
    let latestDate = null

    items.forEach((row) => {
      if (row.riskLevel === RISK_LEVELS.VERY_LOW) next.veryLow += 1
      if (row.riskLevel === RISK_LEVELS.LOW) next.low += 1
      if (row.riskLevel === RISK_LEVELS.MEDIUM) next.medium += 1
      if (row.riskLevel === RISK_LEVELS.HIGH) next.high += 1
      if (row.riskLevel === RISK_LEVELS.CRITICAL) next.critical += 1

      if (row.lastUpdated) {
        const current = new Date(row.lastUpdated)
        if (!latestDate || current > latestDate) latestDate = current
      }
    })

    next.lastUpdated = latestDate ? latestDate.toISOString() : null
    summary.value = next
  }

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

  const loadGradeSections = async () => {
    const params = filters.value.schoolYear
      ? { school_year: filters.value.schoolYear }
      : {}
    const response = await AcademicRiskService.getGradeSections(params)
    gradeSections.value = extractLaravelData(response).map((item) => ({
      id: item.id,
      label: `${item.grade_name || item.grade}° ${item.section_name || item.section}`,
      grade: item.grade_name || item.grade,
      section: item.section_name || item.section,
    }))

    if (!gradeSections.value.some((item) => item.id === filters.value.gradeSectionId)) {
      filters.value.gradeSectionId = gradeSections.value[0]?.id ?? null
    }
  }

  const loadStudents = async () => {
    if (!filters.value.gradeSectionId) {
      students.value = []
      return
    }
    const params = filters.value.schoolYear
      ? { school_year: filters.value.schoolYear }
      : {}
    const response = await AcademicRiskService.getStudents(
      filters.value.gradeSectionId,
      params,
    )
    students.value = extractLaravelData(response)
      .filter((student) => student.status !== false && student.status !== 0)
      .map((student) => ({
      id: student.id,
      label: buildStudentFullName(student),
      studentCode: student.student_code || student.codigo || `ID-${student.id}`,
      raw: student,
    }))

    if (filters.value.studentId && !students.value.some((item) => item.id === filters.value.studentId)) {
      filters.value.studentId = null
    }

    if (scope.value.isStudentView && students.value.length === 1) {
      filters.value.studentId = students.value[0].id
    }
  }

  const buildRows = async () => {
    if (!filters.value.gradeSectionId || !filters.value.bimester) {
      rows.value = []
      resetSummary()
      return
    }

    const classroom = selectedGradeSection.value
    const classroomLabel = classroom?.label || '—'
    const studentItems = students.value.length
      ? students.value
      : []

    if (!studentItems.length) {
      rows.value = []
      resetSummary()
      return
    }

    let predictionsByStudent = {}
    try {
      const response = await MLService.getPredictionsByClassroom({
        gradeSectionId: filters.value.gradeSectionId,
        schoolYear: filters.value.schoolYear,
        bimester: filters.value.bimester,
      })
      predictionsByStudent = response.data?.predictions_by_student || {}
    } catch {
      predictionsByStudent = {}
    }

    const builtRows = studentItems.map((student) => {
      const prediction = predictionsByStudent[String(student.id)]
        || predictionsByStudent[student.id]
        || null
      const status = buildRowStatus(prediction)

      return {
        studentId: student.id,
        studentCode: student.studentCode,
        fullName: student.label,
        classroomLabel,
        riskLevel: prediction?.risk_level ?? null,
        riskLabel: prediction?.risk_label ?? null,
        confidence: prediction?.confidence ?? null,
        status,
        lastUpdated: prediction?.prediction_date ?? null,
        prediction,
      }
    })

    rows.value = builtRows
    computeSummary(filteredRows.value)
  }

  const initializeFilters = async () => {
    loading.value = true
    error.value = null
    connectionError.value = false

    try {
      await loadSchoolYears()
      await loadScope()
      await Promise.all([loadBimesters(), loadGradeSections()])
      await loadStudents()
      await buildRows()
    } catch (err) {
      if (!err.response) connectionError.value = true
      error.value = err.response?.data?.error
        || err.response?.data?.message
        || 'No se pudo cargar la información del módulo.'
      rows.value = []
      resetSummary()
    } finally {
      loading.value = false
    }
  }

  const onSchoolYearChange = async (schoolYear) => {
    filters.value.schoolYear = schoolYear
    filters.value.bimester = null
    filters.value.studentId = null
    loading.value = true
    error.value = null

    try {
      await loadScope()
      await loadBimesters()
      await loadGradeSections()
      await loadStudents()
      await buildRows()
    } catch (err) {
      error.value = err.response?.data?.message || 'No se pudieron actualizar los bimestres.'
    } finally {
      loading.value = false
    }
  }

  const onBimesterChange = async (bimester) => {
    filters.value.bimester = bimester
    filters.value.studentId = null
    loading.value = true
    error.value = null

    try {
      await loadGradeSections()
      await loadStudents()
      await buildRows()
    } catch (err) {
      error.value = err.response?.data?.message || 'No se pudieron actualizar las aulas.'
    } finally {
      loading.value = false
    }
  }

  const onGradeSectionChange = async (gradeSectionId) => {
    filters.value.gradeSectionId = gradeSectionId
    filters.value.studentId = null
    loading.value = true
    error.value = null

    try {
      await loadStudents()
      await buildRows()
    } catch (err) {
      error.value = err.response?.data?.message || 'No se pudieron actualizar los alumnos.'
    } finally {
      loading.value = false
    }
  }

  const onStudentChange = (studentId) => {
    filters.value.studentId = studentId || null
    computeSummary(filteredRows.value)
  }

  const refreshRows = async () => {
    loading.value = true
    error.value = null
    connectionError.value = false

    try {
      await buildRows()
    } catch (err) {
      if (!err.response) connectionError.value = true
      error.value = err.response?.data?.error || 'No se pudo actualizar la tabla.'
    } finally {
      loading.value = false
    }
  }

  const updatePredictions = async () => {
    updating.value = true
    connectionError.value = false

    try {
      const response = await AcademicRiskService.updatePredictions({
        school_year: filters.value.schoolYear,
        bimester: filters.value.bimester,
        grade_section_id: filters.value.gradeSectionId,
      })

      await buildRows()
      return response.data
    } catch (err) {
      if (!err.response) connectionError.value = true
      const data = err.response?.data ?? {}
      err.validationPayload = data
      // No asignar error de tabla: el modal/toast muestra el detalle y la lista debe permanecer.
      throw err
    } finally {
      updating.value = false
    }
  }

  const predictStudent = async (studentId) => {
    predictingStudentId.value = studentId
    connectionError.value = false

    try {
      const response = await AcademicRiskService.predictStudent({
        school_year: filters.value.schoolYear,
        bimester: filters.value.bimester,
        student_id: studentId,
      })

      await buildRows()
      return response.data
    } catch (err) {
      if (!err.response) connectionError.value = true
      const data = err.response?.data ?? {}
      err.validationPayload = data
      // No asignar error de tabla: Swal muestra faltantes y la lista permanece visible.
      throw err
    } finally {
      predictingStudentId.value = null
    }
  }

  const openDetail = (row) => {
    selectedRow.value = row
    drawerVisible.value = true
  }

  const closeDetail = () => {
    drawerVisible.value = false
    selectedRow.value = null
  }

  return {
    filters,
    schoolYears,
    bimesters,
    gradeSections,
    students,
    rows,
    filteredRows,
    summary,
    loading,
    updating,
    predictingStudentId,
    drawerVisible,
    selectedRow,
    error,
    connectionError,
    scope,
    canUpdate,
    canPredictIndividual,
    selectedGradeSection,
    selectedBimester,
    initializeFilters,
    onSchoolYearChange,
    onBimesterChange,
    onGradeSectionChange,
    onStudentChange,
    refreshRows,
    updatePredictions,
    predictStudent,
    openDetail,
    closeDetail,
  }
})
