import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import BimesterService from '@/services/BimesterService'
import GradeSectionService from '@/services/GradeSectionService'
import MLService from '@/services/MLService'
import StudentService from '@/services/StudentService'
import {
  PREDICTION_STATUS,
  RISK_LEVELS,
} from '@/types/academicRisk'
import {
  buildStudentFullName,
  getModelCodeByBimester,
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

const resolvePredictionForBimester = (predictions, bimester) => {
  const modelCode = getModelCodeByBimester(bimester)
  if (!Array.isArray(predictions) || !modelCode) return null
  return predictions.find((item) => item.prediction_model === modelCode) || null
}

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
  const drawerVisible = ref(false)
  const selectedRow = ref(null)
  const error = ref(null)
  const connectionError = ref(false)

  const filteredRows = computed(() => {
    if (!filters.value.studentId) return rows.value
    return rows.value.filter((row) => row.studentId === filters.value.studentId)
  })

  const canUpdate = computed(() => (
    Boolean(filters.value.schoolYear)
    && Boolean(filters.value.bimester)
    && Boolean(filters.value.gradeSectionId)
    && !updating.value
  ))

  const selectedGradeSection = computed(() => (
    gradeSections.value.find((item) => item.id === filters.value.gradeSectionId) || null
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

  const loadGradeSections = async () => {
    const response = await GradeSectionService.getGradeSections()
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
    const response = await StudentService.getItemsByGradeAndSection(filters.value.gradeSectionId)
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

    const builtRows = await Promise.all(studentItems.map(async (student) => {
      const base = student.raw
      let prediction = null

      try {
        const response = await MLService.getPredictionsByStudent(student.id)
        prediction = resolvePredictionForBimester(response.data, filters.value.bimester)
      } catch {
        prediction = null
      }

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
    }))

    rows.value = builtRows
    computeSummary(filteredRows.value)
  }

  const initializeFilters = async () => {
    loading.value = true
    error.value = null
    connectionError.value = false

    try {
      await loadSchoolYears()
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
      await loadBimesters()
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
    error.value = null
    connectionError.value = false

    try {
      const response = await MLService.updatePredictions({
        school_year: filters.value.schoolYear,
        bimester: filters.value.bimester,
        grade_section_id: filters.value.gradeSectionId,
      })

      await buildRows()
      return response.data
    } catch (err) {
      if (!err.response) connectionError.value = true
      const message = err.response?.data?.error
        || err.response?.data?.message
        || 'No se pudieron actualizar las predicciones.'
      error.value = message
      throw err
    } finally {
      updating.value = false
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
    drawerVisible,
    selectedRow,
    error,
    connectionError,
    canUpdate,
    selectedGradeSection,
    initializeFilters,
    onSchoolYearChange,
    onBimesterChange,
    onGradeSectionChange,
    onStudentChange,
    refreshRows,
    updatePredictions,
    openDetail,
    closeDetail,
  }
})
