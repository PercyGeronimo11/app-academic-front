import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import PushNotificationService from '@/services/PushNotificationService'
import AcademicRiskService from '@/services/AcademicRiskService'
import {
  loadSchoolYearOptions,
  resolveActiveSchoolYear,
} from '@/utils/schoolPeriodDefaults'

const extractData = (response) => response?.data ?? {}

const buildStudentLabel = (student) => {
  if (!student) return ''
  const parts = [student.name, student.surname_father, student.surname_mother].filter(Boolean)
  return parts.join(' ')
}

export const usePushNotificationsStore = defineStore('pushNotifications', () => {
  const filters = ref({
    schoolYear: null,
    gradeSectionId: null,
    studentId: null,
    type: 'absence',
    status: '',
    dateFrom: '',
    dateTo: '',
  })

  const scope = ref({
    role: null,
    unrestricted: false,
    isStudentView: false,
    accessibleGradeSectionIds: [],
  })

  const gradeSections = ref([])
  const students = ref([])
  const items = ref([])
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  })

  const loading = ref(false)
  const error = ref(null)
  const schoolYears = ref([])

  const canFilterByGradeSection = computed(() => !scope.value.isStudentView)

  const loadSchoolYears = async () => {
    schoolYears.value = await loadSchoolYearOptions()
    if (!filters.value.schoolYear) {
      filters.value.schoolYear = await resolveActiveSchoolYear(schoolYears.value)
    }
  }

  const loadScope = async () => {
    const response = await PushNotificationService.getScope({
      school_year: filters.value.schoolYear,
    })
    const data = extractData(response)

    scope.value = {
      role: data.role,
      unrestricted: Boolean(data.unrestricted),
      isStudentView: Boolean(data.is_student_view),
      accessibleGradeSectionIds: data.accessible_grade_section_ids ?? [],
    }
  }

  const loadGradeSections = async () => {
    if (scope.value.isStudentView) {
      gradeSections.value = []
      return
    }

    const response = await PushNotificationService.getGradeSections({
      school_year: filters.value.schoolYear,
      status: 1,
    })

    gradeSections.value = extractData(response).map((item) => ({
      id: item.id,
      label: item.label || `${item.grade_name} — ${item.section_name}`,
    }))

    if (!filters.value.gradeSectionId && gradeSections.value.length) {
      filters.value.gradeSectionId = gradeSections.value[0].id
    }
  }

  const loadStudents = async () => {
    if (scope.value.isStudentView || !filters.value.gradeSectionId) {
      students.value = []
      return
    }

    const response = await AcademicRiskService.getStudents(filters.value.gradeSectionId, {
      school_year: filters.value.schoolYear,
    })
    const list = extractData(response.data)

    students.value = list.map((student) => ({
      id: student.id,
      label: buildStudentLabel(student),
    }))
  }

  const loadHistory = async (page = 1) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page,
        per_page: pagination.value.per_page,
        school_year: filters.value.schoolYear,
        type: filters.value.type || undefined,
        status: filters.value.status || undefined,
        date_from: filters.value.dateFrom || undefined,
        date_to: filters.value.dateTo || undefined,
      }

      if (!scope.value.isStudentView && filters.value.gradeSectionId) {
        params.grade_section_id = filters.value.gradeSectionId
      }

      if (!scope.value.isStudentView && filters.value.studentId) {
        params.student_id = filters.value.studentId
      }

      const response = await PushNotificationService.getHistory(params)
      const data = extractData(response)

      items.value = data.items ?? []
      pagination.value = data.pagination ?? pagination.value
    } catch (err) {
      error.value = err?.response?.data?.message || 'No se pudo cargar el historial de notificaciones.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    await loadSchoolYears()
    await loadScope()
    await loadGradeSections()
    if (!scope.value.isStudentView) {
      await loadStudents()
    }
    await loadHistory()
  }

  const setGradeSection = async (gradeSectionId) => {
    filters.value.gradeSectionId = gradeSectionId
    filters.value.studentId = null
    await loadStudents()
    await loadHistory()
  }

  const setStudent = async (studentId) => {
    filters.value.studentId = studentId || null
    await loadHistory()
  }

  const setSchoolYear = async (schoolYear) => {
    filters.value.schoolYear = Number(schoolYear)
    filters.value.gradeSectionId = null
    filters.value.studentId = null
    await loadGradeSections()
    await loadStudents()
    await loadHistory()
  }

  const markAsRead = async (id) => {
    await PushNotificationService.markAsRead(id)
    const item = items.value.find((entry) => entry.id === id)
    if (item) {
      item.read_at = new Date().toISOString()
    }
  }

  return {
    filters,
    scope,
    gradeSections,
    students,
    items,
    pagination,
    loading,
    error,
    schoolYears,
    canFilterByGradeSection,
    initialize,
    loadHistory,
    setGradeSection,
    setStudent,
    setSchoolYear,
    markAsRead,
  }
})
