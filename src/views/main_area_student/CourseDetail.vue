<template>
  <div class="course-detail">
    <CCard class="shadow-sm border-0 mb-3">
      <CCardBody class="py-3 px-3 px-md-4">
        <div class="course-header">
          <p class="course-eyebrow">Mi curso</p>
          <h1 class="course-title">{{ courseClassData.course_name || 'Curso' }}</h1>
          <p v-if="courseClassData.teacher_name" class="course-subtitle">
            Docente: {{ courseClassData.teacher_name }}
          </p>

          <nav class="course-tabs" aria-label="Opciones del curso">
            <router-link
              v-for="tab in tabs"
              :key="tab.to"
              :to="tab.to"
              class="course-tab"
              :class="{ 'course-tab--active': isTabActive(tab) }"
            >
              <i :class="tab.icon" aria-hidden="true"></i>
              <span>{{ tab.label }}</span>
            </router-link>
          </nav>

          <div class="course-toolbar">
            <div
              class="course-toolbar__filters"
              :class="{ 'course-toolbar__filters--single': !isAssistanceTab }"
            >
              <div class="course-toolbar__field">
                <label class="course-toolbar__label" for="student-course-bimester">Bimestre</label>
                <CFormSelect
                  id="student-course-bimester"
                  v-model="studentBimesterId"
                  :disabled="!bimesters.length"
                >
                  <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
                    {{ item.name }}
                  </option>
                </CFormSelect>
              </div>

              <template v-if="isAssistanceTab">
                <div class="course-toolbar__field">
                  <label class="course-toolbar__label" for="student-date-from">Desde</label>
                  <CFormInput id="student-date-from" v-model="assistanceDateFrom" type="date" />
                </div>
                <div class="course-toolbar__field">
                  <label class="course-toolbar__label" for="student-date-to">Hasta</label>
                  <CFormInput id="student-date-to" v-model="assistanceDateTo" type="date" />
                </div>
              </template>
            </div>

            <div v-if="isAssistanceTab" class="course-schedule">
              <p class="course-schedule__label">Horario</p>
              <p v-if="scheduleLoading" class="course-schedule__empty mb-0">
                <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                Cargando horario...
              </p>
              <p v-else-if="scheduleError" class="course-schedule__empty mb-0">{{ scheduleError }}</p>
              <p v-else-if="!schedules.length" class="course-schedule__empty mb-0">
                Sin horario configurado
              </p>
              <ul v-else class="course-schedule__list">
                <li
                  v-for="slot in schedules"
                  :key="slot.id || `${slot.day_of_week}-${slot.start_time}`"
                  class="course-schedule__chip"
                >
                  <i class="fas fa-clock" aria-hidden="true"></i>
                  {{ slot.day_label || dayLabel(slot.day_of_week) }}
                  {{ formatTime(slot.start_time) }}–{{ formatTime(slot.end_time) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <div v-if="!filtersReady" class="module-loading">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando...
    </div>
    <div v-else class="course-tab-panel">
      <router-view :key="route.fullPath" />
    </div>

    <AnnouncementLoginModal :course-class-id="course_class_id" />
  </div>
</template>

<script setup>
import { ref, computed, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import CourseClassService from '@/services/CourseClassService'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import ScheduleService from '@/services/ScheduleService'
import AnnouncementLoginModal from '@/components/announcements/AnnouncementLoginModal.vue'
import { filterActivePeriodBimesters, pickCurrentBimesterId } from '@/utils/bimester'

const DAY_LABELS = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
}

const route = useRoute()
const course_class_id = computed(() => Number(route.params.courseClass))

const courseClassData = ref({
  course_name: '',
  teacher_name: '',
})

const bimesters = ref([])
const studentBimesterId = ref(null)
const assistanceDateFrom = ref('')
const assistanceDateTo = ref('')
const filtersReady = ref(false)
const schedules = ref([])
const scheduleLoading = ref(false)
const scheduleError = ref('')

provide('studentBimesters', bimesters)
provide('studentBimesterId', studentBimesterId)
provide('assistanceDateFrom', assistanceDateFrom)
provide('assistanceDateTo', assistanceDateTo)

const isAssistanceTab = computed(() => route.path.endsWith('/assistance'))

const tabs = computed(() => {
  const id = course_class_id.value
  return [
    {
      label: 'Asistencias',
      to: `/courses/student/${id}/assistance`,
      match: 'assistance',
      icon: 'fas fa-clipboard-check',
    },
    {
      label: 'Orden mérito',
      to: `/courses/student/${id}/merit`,
      match: 'merit',
      icon: 'fas fa-medal',
    },
    {
      label: 'Conducta',
      to: `/courses/student/${id}/conduct`,
      match: 'conduct',
      icon: 'fas fa-exclamation-triangle',
    },
  ]
})

const isTabActive = (tab) => {
  const base = `/courses/student/${course_class_id.value}/`
  return route.path === `${base}${tab.match}`
}

const dayLabel = (day) => DAY_LABELS[Number(day)] || `Día ${day}`

const formatTime = (value) => {
  if (!value) return '—'
  return String(value).slice(0, 5)
}

const applyBimesterDates = () => {
  const selected = bimesters.value.find(
    (item) => Number(item.id) === Number(studentBimesterId.value)
  )
  assistanceDateFrom.value = selected?.start_date ? String(selected.start_date).slice(0, 10) : ''
  assistanceDateTo.value = selected?.end_date ? String(selected.end_date).slice(0, 10) : ''
}

watch(studentBimesterId, (value) => {
  const numeric = value != null && value !== '' ? Number(value) : null
  if (numeric !== value) {
    studentBimesterId.value = numeric
    return
  }
  applyBimesterDates()
})

const loadCourse = async (id) => {
  try {
    const response = await CourseClassService.getCourseClass(id)
    courseClassData.value = response.data?.data || {
      course_name: '',
      teacher_name: '',
    }
  } catch (error) {
    console.error('Error al obtener datos del curso:', error)
  }
}

const loadSchedule = async (id) => {
  scheduleLoading.value = true
  scheduleError.value = ''
  try {
    const response = await ScheduleService.listByCourseClass(id)
    if (response.data?.success === false) {
      scheduleError.value = response.data?.message || 'No se pudo cargar el horario.'
      schedules.value = []
      return
    }
    schedules.value = response.data?.data?.schedules || []
  } catch (error) {
    scheduleError.value = error.response?.data?.message || 'Error al cargar el horario.'
    schedules.value = []
  } finally {
    scheduleLoading.value = false
  }
}

const loadBimesters = async () => {
  try {
    const response = await CompetencyScoreService.listBimesters()
    bimesters.value = filterActivePeriodBimesters(response.data?.data || [])
    studentBimesterId.value = pickCurrentBimesterId(bimesters.value)
  } catch (error) {
    console.error(error)
    bimesters.value = []
    studentBimesterId.value = null
  } finally {
    filtersReady.value = true
  }
}

watch(
  course_class_id,
  (id) => {
    if (!id) return
    loadCourse(id)
    loadSchedule(id)
  },
  { immediate: true }
)

loadBimesters()
</script>

<style scoped>
.course-detail {
  padding: var(--rp-space-4) 0 var(--rp-space-8);
  max-width: var(--rp-page-max-width);
  margin-inline: auto;
}

.course-eyebrow {
  margin: 0;
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: var(--rp-tracking-wide);
  text-transform: uppercase;
  color: var(--rp-text-subtle);
}

.course-title {
  margin: var(--rp-space-1) 0 0;
  color: var(--rp-text-heading);
  font-size: 1.25rem;
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-tight);
  letter-spacing: -0.02em;
  overflow-wrap: break-word;
}

.course-subtitle {
  margin: var(--rp-space-1) 0 0;
  font-size: var(--rp-text-base);
  color: var(--rp-text-muted);
}

.course-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
  overflow-x: auto;
  margin-top: var(--rp-space-3);
  padding-bottom: 0.15rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.course-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0.55rem 0.95rem;
  font-size: var(--rp-text-sm, 0.875rem);
  font-weight: var(--rp-weight-semibold, 700);
  color: var(--rp-text-muted);
  text-decoration: none;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface);
  white-space: nowrap;
}

.course-tab i {
  font-size: 0.85em;
}

.course-tab:hover {
  color: var(--rp-text-brand);
  border-color: var(--rp-border-brand);
  background: var(--rp-surface-brand-soft);
  text-decoration: none;
}

.course-tab--active {
  color: var(--rp-text-on-brand);
  background: var(--rp-brand-500);
  border-color: var(--rp-brand-500);
}

.course-tab--active:hover {
  color: var(--rp-text-on-brand);
  background: var(--rp-brand-600);
  border-color: var(--rp-brand-600);
}

.course-toolbar {
  margin-top: var(--rp-space-3);
  padding-top: var(--rp-space-3);
  border-top: 1px solid var(--rp-border);
}

.course-toolbar__filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.course-toolbar__field {
  min-width: 0;
}

.course-toolbar__label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rp-text-muted);
}

.course-schedule {
  margin-top: 0.85rem;
}

.course-schedule__label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rp-text-muted);
}

.course-schedule__empty {
  margin-top: 0.35rem;
  font-size: var(--rp-text-sm, 0.875rem);
  color: var(--rp-text-muted);
}

.course-schedule__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0;
}

.course-schedule__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2rem;
  padding: 0.2rem 0.7rem;
  border-radius: var(--rp-radius-pill, 999px);
  background: var(--rp-surface-muted);
  border: 1px solid var(--rp-border);
  color: var(--rp-text-heading);
  font-size: 0.8125rem;
  font-weight: var(--rp-weight-semibold, 600);
}

.course-schedule__chip i {
  color: var(--rp-text-brand);
  font-size: 0.75rem;
}

.course-tab-panel {
  min-width: 0;
}

@media (min-width: 576px) {
  .course-toolbar__filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .course-toolbar__filters--single {
    grid-template-columns: minmax(0, 16rem);
  }
}

@media (min-width: 768px) {
  .course-title {
    font-size: 1.5rem;
  }

  .course-tab {
    font-size: var(--rp-text-base, 0.9rem);
  }
}
</style>
