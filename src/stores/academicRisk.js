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
import {
  loadSchoolYearOptions,
  resolveActiveSchoolYear,
} from '@/utils/academicRiskFilters'

const BIMESTER_COLUMNS = [1, 2, 3]

const emptyBimesterCounts = () => ({ 1: 0, 2: 0, 3: 0 })

const EMPTY_SUMMARY = {
  totalStudents: 0,
  veryLow: emptyBimesterCounts(),
  low: emptyBimesterCounts(),
  medium: emptyBimesterCounts(),
  high: emptyBimesterCounts(),
  critical: emptyBimesterCounts(),
  lastUpdated: null,
}

const extractLaravelData = (response) => response?.data?.data ?? []

const mapPredictionSlot = (prediction) => {
  if (!prediction) {
    return {
      riskLevel: null,
      riskLabel: null,
      confidence: null,
      status: PREDICTION_STATUS.PENDING,
      lastUpdated: null,
      prediction: null,
    }
  }
  return {
    riskLevel: prediction.risk_level ?? null,
    riskLabel: prediction.risk_label ?? null,
    confidence: prediction.confidence ?? null,
    status: PREDICTION_STATUS.UPDATED,
    lastUpdated: prediction.prediction_date ?? null,
    prediction,
  }
}

const buildObservation = (byBimester, predictableBimesters, skipHints = {}) => {
  const parts = []
  for (const n of BIMESTER_COLUMNS) {
    const slot = byBimester[n]
    const hint = skipHints[n]
    if (hint) {
      parts.push(`B${n}: ${hint}`)
      continue
    }
    if (predictableBimesters.includes(n) && !slot?.prediction) {
      parts.push(`B${n}: sin predicción`)
    }
  }
  return parts.join(' · ') || '—'
}

export const useAcademicRiskStore = defineStore('academicRisk', () => {
  const filters = ref({
    schoolYear: null,
    grade: null,
    section: null,
    gradeSectionId: null,
    studentId: null,
    bimester: null, // legado / dashboard query
  })

  const schoolYears = ref([])
  const bimesters = ref([])
  const gradeSections = ref([])
  const students = ref([])
  const rows = ref([])
  const summary = ref({ ...EMPTY_SUMMARY, veryLow: emptyBimesterCounts(), low: emptyBimesterCounts(), medium: emptyBimesterCounts(), high: emptyBimesterCounts(), critical: emptyBimesterCounts() })
  const activeSchoolYear = ref(null)
  const currentBimester = ref(null)
  const predictableBimesters = ref([])
  const lastSkipHints = ref({}) // studentId -> { 1: 'datos incompletos', ... }

  const loading = ref(false)
  const updating = ref(false)
  const predictingStudentId = ref(null)
  const drawerVisible = ref(false)
  const selectedRow = ref(null)
  const selectedDetailBimester = ref(null)
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

  const gradeOptions = computed(() => {
    const set = new Set(gradeSections.value.map((g) => String(g.grade)))
    return [...set].sort((a, b) => Number(a) - Number(b))
  })

  const sectionOptions = computed(() => {
    if (!filters.value.grade) return []
    return gradeSections.value
      .filter((g) => String(g.grade) === String(filters.value.grade))
      .map((g) => String(g.section))
      .sort()
  })

  const canUpdate = computed(() => (
    scope.value.canUpdatePredictions
    && predictableBimesters.value.length > 0
    && Boolean(filters.value.schoolYear)
    && Boolean(filters.value.gradeSectionId)
    && !updating.value
    && !predictingStudentId.value
  ))

  const canPredictIndividual = computed(() => (
    scope.value.canUpdatePredictions
    && predictableBimesters.value.length > 0
    && Boolean(filters.value.schoolYear)
    && !updating.value
  ))

  const selectedGradeSection = computed(() => (
    gradeSections.value.find((item) => item.id === filters.value.gradeSectionId) || null
  ))

  const resetSummary = () => {
    summary.value = {
      totalStudents: 0,
      veryLow: emptyBimesterCounts(),
      low: emptyBimesterCounts(),
      medium: emptyBimesterCounts(),
      high: emptyBimesterCounts(),
      critical: emptyBimesterCounts(),
      lastUpdated: null,
    }
  }

  const computeSummary = (items) => {
    const next = {
      totalStudents: items.length,
      veryLow: emptyBimesterCounts(),
      low: emptyBimesterCounts(),
      medium: emptyBimesterCounts(),
      high: emptyBimesterCounts(),
      critical: emptyBimesterCounts(),
      lastUpdated: null,
    }
    let latestDate = null

    items.forEach((row) => {
      BIMESTER_COLUMNS.forEach((n) => {
        const level = row.byBimester?.[n]?.riskLevel
        if (level === RISK_LEVELS.VERY_LOW) next.veryLow[n] += 1
        if (level === RISK_LEVELS.LOW) next.low[n] += 1
        if (level === RISK_LEVELS.MEDIUM) next.medium[n] += 1
        if (level === RISK_LEVELS.HIGH) next.high[n] += 1
        if (level === RISK_LEVELS.CRITICAL) next.critical[n] += 1

        const updated = row.byBimester?.[n]?.lastUpdated
        if (updated) {
          const current = new Date(updated)
          if (!latestDate || current > latestDate) latestDate = current
        }
      })
    })

    next.lastUpdated = latestDate ? latestDate.toISOString() : null
    summary.value = next
  }

  const syncGradeSectionIdFromParts = () => {
    const match = gradeSections.value.find(
      (g) => String(g.grade) === String(filters.value.grade)
        && String(g.section) === String(filters.value.section),
    )
    filters.value.gradeSectionId = match?.id ?? null
  }

  const loadSchoolYears = async () => {
    schoolYears.value = await loadSchoolYearOptions()
    activeSchoolYear.value = await resolveActiveSchoolYear(schoolYears.value)
    filters.value.schoolYear = activeSchoolYear.value
  }

  const loadBimesters = async () => {
    if (!filters.value.schoolYear) {
      bimesters.value = []
      return
    }
    const response = await BimesterService.list(filters.value.schoolYear)
    bimesters.value = extractLaravelData(response)
      .sort((a, b) => a.number - b.number)
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
    currentBimester.value = data.current_bimester ?? null
    predictableBimesters.value = Array.isArray(data.predictable_bimesters)
      ? data.predictable_bimesters.map(Number)
      : []
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

    if (filters.value.gradeSectionId) {
      const current = gradeSections.value.find((g) => g.id === filters.value.gradeSectionId)
      if (current) {
        filters.value.grade = String(current.grade)
        filters.value.section = String(current.section)
      }
    }

    if (!filters.value.grade || !gradeOptions.value.includes(String(filters.value.grade))) {
      filters.value.grade = gradeOptions.value[0] ?? null
    }
    const sections = gradeSections.value
      .filter((g) => String(g.grade) === String(filters.value.grade))
      .map((g) => String(g.section))
    if (!filters.value.section || !sections.includes(String(filters.value.section))) {
      filters.value.section = sections[0] ?? null
    }
    syncGradeSectionIdFromParts()
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

  const fetchPredictionsForBimester = async (bimesterNumber) => {
    try {
      const response = await MLService.getPredictionsByClassroom({
        gradeSectionId: filters.value.gradeSectionId,
        schoolYear: filters.value.schoolYear,
        bimester: bimesterNumber,
      })
      return response.data?.predictions_by_student || {}
    } catch {
      return {}
    }
  }

  const buildRows = async () => {
    if (!filters.value.gradeSectionId) {
      rows.value = []
      resetSummary()
      return
    }

    const classroom = selectedGradeSection.value
    const classroomLabel = classroom?.label || '—'
    const studentItems = students.value

    if (!studentItems.length) {
      rows.value = []
      resetSummary()
      return
    }

    const maps = await Promise.all(
      BIMESTER_COLUMNS.map((n) => fetchPredictionsForBimester(n)),
    )

    const builtRows = studentItems.map((student) => {
      const byBimester = {}
      BIMESTER_COLUMNS.forEach((n, idx) => {
        const map = maps[idx]
        const prediction = map[String(student.id)] || map[student.id] || null
        byBimester[n] = mapPredictionSlot(prediction)
      })

      const preferred = [...BIMESTER_COLUMNS].reverse().find((n) => byBimester[n].prediction)
        || BIMESTER_COLUMNS[0]
      const primary = byBimester[preferred]
      const hints = lastSkipHints.value[student.id] || {}

      return {
        studentId: student.id,
        studentCode: student.studentCode,
        fullName: student.label,
        classroomLabel,
        byBimester,
        observation: buildObservation(byBimester, predictableBimesters.value, hints),
        // compat drawer / acciones
        riskLevel: primary.riskLevel,
        riskLabel: primary.riskLabel,
        confidence: primary.confidence,
        status: primary.status,
        lastUpdated: primary.lastUpdated,
        prediction: primary.prediction,
        detailBimester: preferred,
      }
    })

    rows.value = builtRows
    computeSummary(filteredRows.value)
  }

  const ingestSkipHints = (skippedStudents = []) => {
    const next = { ...lastSkipHints.value }
    skippedStudents.forEach((item) => {
      if (!item?.id) return
      const id = item.id
      if (!next[id]) next[id] = {}
      const b = Number(item.bimester)
      if (b >= 1 && b <= 3) {
        next[id][b] = 'datos incompletos'
      }
    })
    lastSkipHints.value = next
  }

  const ingestMissingByBimester = (studentId, missingByBimester = {}) => {
    const next = { ...lastSkipHints.value }
    next[studentId] = { ...(next[studentId] || {}) }
    Object.entries(missingByBimester).forEach(([b, fields]) => {
      const n = Number(b)
      if (n >= 1 && n <= 3) {
        next[studentId][n] = Array.isArray(fields) && fields.length
          ? 'datos incompletos'
          : 'falló'
      }
    })
    // Also mark failed bimestres from by_bimester without success
    lastSkipHints.value = next
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

  const onGradeChange = async (grade) => {
    filters.value.grade = grade
    const sections = gradeSections.value
      .filter((g) => String(g.grade) === String(grade))
      .map((g) => String(g.section))
    filters.value.section = sections[0] ?? null
    syncGradeSectionIdFromParts()
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

  const onSectionChange = async (section) => {
    filters.value.section = section
    syncGradeSectionIdFromParts()
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

  const onGradeSectionChange = async (gradeSectionId) => {
    filters.value.gradeSectionId = gradeSectionId
    const current = gradeSections.value.find((g) => g.id === gradeSectionId)
    if (current) {
      filters.value.grade = String(current.grade)
      filters.value.section = String(current.section)
    }
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
        grade_section_id: filters.value.gradeSectionId,
      })
      ingestSkipHints(response.data?.skipped_students || [])
      // Clear OK bimestres hints from successful by_bimester
      const byB = response.data?.by_bimester || {}
      Object.entries(byB).forEach(([b, body]) => {
        const n = Number(b)
        const skippedIds = new Set((body.skipped_students || []).map((s) => s.id))
        students.value.forEach((st) => {
          if (!skippedIds.has(st.id) && body.success !== false) {
            if (lastSkipHints.value[st.id]?.[n]) {
              const copy = { ...lastSkipHints.value }
              copy[st.id] = { ...copy[st.id] }
              delete copy[st.id][n]
              lastSkipHints.value = copy
            }
          }
        })
      })
      await buildRows()
      return response.data
    } catch (err) {
      if (!err.response) connectionError.value = true
      const data = err.response?.data ?? {}
      err.validationPayload = data
      ingestSkipHints(data.skipped_students || [])
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
        student_id: studentId,
      })
      ingestMissingByBimester(studentId, response.data?.missing_by_bimester || {})
      const byB = response.data?.by_bimester || {}
      Object.entries(byB).forEach(([b, body]) => {
        const n = Number(b)
        if (body?.success) {
          const copy = { ...lastSkipHints.value }
          if (copy[studentId]) {
            copy[studentId] = { ...copy[studentId] }
            delete copy[studentId][n]
            lastSkipHints.value = copy
          }
        } else if (body?.code === 'incomplete_data') {
          ingestMissingByBimester(studentId, { [n]: body.missing_fields || [] })
        }
      })
      await buildRows()
      return response.data
    } catch (err) {
      if (!err.response) connectionError.value = true
      const data = err.response?.data ?? {}
      err.validationPayload = data
      if (data.missing_by_bimester) {
        ingestMissingByBimester(studentId, data.missing_by_bimester)
      }
      Object.entries(data.by_bimester || {}).forEach(([b, body]) => {
        if (body?.missing_fields?.length) {
          ingestMissingByBimester(studentId, { [b]: body.missing_fields })
        }
      })
      await buildRows()
      throw err
    } finally {
      predictingStudentId.value = null
    }
  }

  const openDetail = (row, bimesterNumber = null) => {
    const n = bimesterNumber || row.detailBimester || 1
    const slot = row.byBimester?.[n] || mapPredictionSlot(null)
    selectedDetailBimester.value = n
    selectedRow.value = {
      ...row,
      riskLevel: slot.riskLevel,
      riskLabel: slot.riskLabel,
      confidence: slot.confidence,
      status: slot.status,
      lastUpdated: slot.lastUpdated,
      prediction: slot.prediction,
      detailBimester: n,
    }
    drawerVisible.value = true
  }

  const setDetailBimester = (n) => {
    if (!selectedRow.value) return
    openDetail(selectedRow.value, n)
  }

  const closeDetail = () => {
    drawerVisible.value = false
    selectedRow.value = null
    selectedDetailBimester.value = null
  }

  return {
    filters,
    schoolYears,
    bimesters,
    gradeSections,
    gradeOptions,
    sectionOptions,
    students,
    rows,
    filteredRows,
    summary,
    activeSchoolYear,
    currentBimester,
    predictableBimesters,
    loading,
    updating,
    predictingStudentId,
    drawerVisible,
    selectedRow,
    selectedDetailBimester,
    error,
    connectionError,
    scope,
    canUpdate,
    canPredictIndividual,
    selectedGradeSection,
    initializeFilters,
    onGradeChange,
    onSectionChange,
    onGradeSectionChange,
    onStudentChange,
    refreshRows,
    updatePredictions,
    predictStudent,
    openDetail,
    setDetailBimester,
    closeDetail,
  }
})
