<template>
  <div class="course-detail">
    <CCard class="shadow-sm border-0 mb-3">
      <CCardBody class="py-3 px-3 px-md-4">
        <div class="course-header">
          <div class="course-header__top">
            <div class="course-header__intro">
              <h1 class="course-title mb-1">{{ courseTitle }}</h1>
              <p v-if="courseClassroom" class="course-subtitle mb-1">{{ courseClassroom }}</p>
              <p v-if="studentsCountLabel" class="course-students mb-0">{{ studentsCountLabel }}</p>
            </div>
            <div class="course-header__actions">
              <CButton
                color="info"
                variant="outline"
                class="course-header__action"
                @click="goBack"
              >
                <i class="fas fa-arrow-left me-1"></i>
                Volver
              </CButton>
            </div>
          </div>

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

          <div v-if="isGradesTab" class="course-grades-legend">
            <div class="course-grades-legend__content">
              <p class="course-grades-legend__title mb-1">LEYENDA:</p>
              <ul v-if="competenciesLegend.length" class="course-grades-legend__list mb-0">
                <li v-for="comp in competenciesLegend" :key="comp.id || comp.number || comp.code">
                  <strong>{{ comp.number || comp.code }}</strong>
                  {{ comp.name }}
                </li>
              </ul>
              <p v-else class="course-grades-legend__empty mb-0">
                Se mostrará al cargar las competencias del curso.
              </p>
            </div>
            <CButton
              color="info"
              variant="outline"
              class="course-header__action course-grades-legend__action"
              title="Importar SIAGIE"
              @click="importModalVisible = true"
            >
              <i class="fas fa-file-import me-1"></i>
              Importar SIAGIE
            </CButton>
          </div>

          <div v-if="isConductTab" class="course-conduct-toolbar">
            <div class="course-conduct-toolbar__filter">
              <label class="course-conduct-toolbar__label" for="conduct-bimester">Bimestre</label>
              <CFormSelect
                id="conduct-bimester"
                v-model="conductBimesterId"
                :disabled="!conductBimesters.length"
              >
                <option v-for="item in conductBimesters" :key="item.id" :value="Number(item.id)">
                  {{ item.name }}
                </option>
              </CFormSelect>
            </div>
            <CButton
              color="primary"
              class="course-header__action"
              @click="openConductRegister"
            >
              <i class="fas fa-plus me-1"></i>
              Registrar
            </CButton>
          </div>

          <div v-if="isAssistanceTab" class="course-assistance-toolbar">
            <div class="course-assistance-toolbar__date">
              <label class="course-assistance-toolbar__label" for="assistance-date">Fecha</label>
              <CFormInput
                id="assistance-date"
                v-model="assistanceDate"
                type="date"
              />
            </div>
            <div class="course-assistance-toolbar__schedule">
              <template v-if="assistanceScheduleLabel">
                <i class="fas fa-clock me-1" aria-hidden="true"></i>
                {{ assistanceScheduleLabel }}
              </template>
              <template v-else>
                Sin horario configurado
              </template>
            </div>
            <CButton
              color="primary"
              class="course-header__action course-assistance-toolbar__save"
              :disabled="!assistanceCanUpdate || assistanceSaving"
              @click="triggerAssistanceSave"
            >
              <i v-if="assistanceSaving" class="fas fa-spinner fa-spin me-1"></i>
              <i v-else class="fas fa-save me-1"></i>
              Actualizar asistencia
            </CButton>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <div v-if="importSuccess" class="module-alert module-alert--success mb-3">
      {{ importSuccess }}
    </div>

    <div class="course-tab-panel">
      <router-view :key="route.fullPath" />
    </div>

    <ImportSiagieCourseModal
      :visible="importModalVisible"
      :course-class-id="course_class_id"
      @close="importModalVisible = false"
      @imported="onImported"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CourseClassService from '@/services/CourseClassService'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import ImportSiagieCourseModal from '@/views/grades/ImportSiagieCourseModal.vue'
import { filterActivePeriodBimesters, pickCurrentBimesterId } from '@/utils/bimester'

const route = useRoute()
const router = useRouter()
const course_class_id = computed(() => Number(route.params.courseClass))

const courseClassData = ref({
  course_name: '',
  teacher_name: '',
  grade: null,
  section: null,
  students_count: 0,
})

const importModalVisible = ref(false)
const importSuccess = ref('')
const gradesReloadToken = ref(0)
const tableStudentsCount = ref(null)
const competenciesLegend = ref([])
const conductBimesters = ref([])
const conductBimesterId = ref(null)
const conductRegisterSignal = ref(0)
const assistanceDate = ref(getTodayDatePeru())
const assistanceScheduleLabel = ref('')
const assistanceCanUpdate = ref(false)
const assistanceSaving = ref(false)
const assistanceSaveSignal = ref(0)
let importSuccessTimer = null

function getTodayDatePeru() {
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60
  const peruOffset = -5
  date.setHours(date.getHours() - offset + peruOffset)
  return date.toISOString().split('T')[0]
}

provide('courseGradesReloadToken', gradesReloadToken)
provide('setCourseStudentsCount', (count) => {
  tableStudentsCount.value = count == null ? null : Number(count)
})
provide('setCourseCompetenciesLegend', (items) => {
  competenciesLegend.value = Array.isArray(items) ? items : []
})
provide('conductBimesterId', conductBimesterId)
provide('conductRegisterSignal', conductRegisterSignal)
provide('assistanceDate', assistanceDate)
provide('assistanceScheduleLabel', assistanceScheduleLabel)
provide('assistanceCanUpdate', assistanceCanUpdate)
provide('assistanceSaving', assistanceSaving)
provide('assistanceSaveSignal', assistanceSaveSignal)

const isGradesTab = computed(() => route.path.includes('/grades'))
const isConductTab = computed(() => route.path.includes('/conduct'))
const isAssistanceTab = computed(() => route.path.includes('/assistance'))

const courseTitle = computed(() => {
  const name = courseClassData.value.course_name
  return name ? `Área de ${name}` : 'Área del curso'
})

const courseClassroom = computed(() => {
  const { grade, section } = courseClassData.value
  if (grade && section) return `Grado ${grade} — Sección ${section}`
  if (grade) return `Grado ${grade}`
  if (section) return `Sección ${section}`
  return ''
})

const studentsCountLabel = computed(() => {
  const count = tableStudentsCount.value != null
    ? tableStudentsCount.value
    : Number(courseClassData.value.students_count || 0)
  return count === 1 ? '1 alumno' : `${count} alumnos`
})

const tabs = computed(() => {
  const id = course_class_id.value
  return [
    {
      label: 'Asistencias',
      to: `/courses/teacher/${id}/assistance`,
      match: 'assistance',
      icon: 'fas fa-clipboard-check',
    },
    {
      label: 'Conducta',
      to: `/courses/teacher/${id}/conduct`,
      match: 'conduct',
      icon: 'fas fa-exclamation-triangle',
    },
    {
      label: 'Notas',
      to: `/courses/teacher/${id}/grades`,
      match: 'grades',
      icon: 'fas fa-chart-bar',
    },
  ]
})

const isTabActive = (tab) => {
  const base = `/courses/teacher/${course_class_id.value}/`
  return route.path === `${base}${tab.match}`
}

const goBack = () => router.push('/courses/teacher/list')

const openConductRegister = () => {
  conductRegisterSignal.value += 1
}

const triggerAssistanceSave = () => {
  assistanceSaveSignal.value += 1
}

const loadConductBimesters = async () => {
  try {
    const response = await CompetencyScoreService.listBimesters()
    const filtered = filterActivePeriodBimesters(response.data?.data || [])
    conductBimesters.value = filtered
    if (
      !filtered.some((item) => Number(item.id) === Number(conductBimesterId.value))
    ) {
      conductBimesterId.value = pickCurrentBimesterId(filtered)
    }
  } catch {
    conductBimesters.value = []
    conductBimesterId.value = null
  }
}

const onImported = async ({ message } = {}) => {
  importModalVisible.value = false
  importSuccess.value = message || 'Notas importadas correctamente.'
  if (importSuccessTimer) clearTimeout(importSuccessTimer)
  importSuccessTimer = setTimeout(() => {
    importSuccess.value = ''
  }, 4000)
  gradesReloadToken.value += 1
  await loadCourse(course_class_id.value)
}

const loadCourse = async (id) => {
  try {
    const response = await CourseClassService.getCourseClass(id)
    courseClassData.value = response.data?.data || {
      course_name: '',
      teacher_name: '',
      grade: null,
      section: null,
      students_count: 0,
    }
  } catch (error) {
    console.error('Error al cargar datos del curso:', error)
  }
}

watch(
  course_class_id,
  (id) => {
    if (id) loadCourse(id)
  },
  { immediate: true }
)

watch(isGradesTab, (onGrades) => {
  if (!onGrades) {
    tableStudentsCount.value = null
    competenciesLegend.value = []
  }
})

watch(
  isConductTab,
  async (onConduct) => {
    if (onConduct) await loadConductBimesters()
  },
  { immediate: true }
)

watch(isAssistanceTab, (onAssistance) => {
  if (!onAssistance) {
    assistanceScheduleLabel.value = ''
    assistanceCanUpdate.value = false
    assistanceSaving.value = false
    tableStudentsCount.value = null
  }
})
</script>

<style scoped>
.course-detail {
  padding: var(--rp-space-4) 0 var(--rp-space-8);
  max-width: var(--rp-page-max-width);
  margin-inline: auto;
}

.course-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
  margin-bottom: var(--rp-space-3);
  padding-bottom: var(--rp-space-3);
  border-bottom: 1px solid var(--rp-border);
}

.course-header__intro {
  min-width: 0;
  flex: 1;
}

.course-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: var(--rp-weight-bold, 800);
  line-height: var(--rp-leading-tight, 1.25);
  color: var(--rp-text-brand);
  overflow-wrap: break-word;
}

.course-subtitle {
  font-size: var(--rp-text-base, 0.95rem);
  color: var(--rp-text-muted);
}

.course-students {
  font-size: var(--rp-text-sm, 0.875rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-brand);
}

.course-header__actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--rp-space-2);
  flex-shrink: 0;
}

.course-header__action {
  flex-shrink: 0;
  white-space: nowrap;
}

.course-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rp-space-2);
}

.course-grades-legend {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
  margin-top: var(--rp-space-3);
  padding-top: var(--rp-space-3);
  border-top: 1px solid var(--rp-border);
}

.course-grades-legend__content {
  flex: 1;
  min-width: 0;
}

.course-grades-legend__title {
  font-size: 0.72rem;
  font-weight: var(--rp-weight-bold, 700);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--rp-text-muted);
  line-height: 1.2;
}

.course-grades-legend__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.1rem;
}

.course-grades-legend__list li {
  font-size: 0.75rem;
  line-height: 1.25;
  color: var(--rp-text-muted);
}

.course-grades-legend__list strong {
  color: var(--rp-text-heading);
  margin-right: 0.25rem;
}

.course-grades-legend__empty {
  font-size: 0.75rem;
  color: var(--rp-text-muted);
}

.course-grades-legend__action {
  flex-shrink: 0;
  align-self: center;
}

.course-conduct-toolbar,
.course-assistance-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--rp-space-3);
  margin-top: var(--rp-space-3);
  padding-top: var(--rp-space-3);
  border-top: 1px solid var(--rp-border);
}

.course-conduct-toolbar__filter,
.course-assistance-toolbar__date {
  flex: 0 1 16rem;
  min-width: 10rem;
}

.course-conduct-toolbar__label,
.course-assistance-toolbar__label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rp-text-muted);
}

.course-assistance-toolbar__schedule {
  flex: 1 1 auto;
  min-width: 0;
  padding-bottom: 0.45rem;
  font-size: var(--rp-text-sm, 0.875rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-assistance-toolbar__save {
  flex-shrink: 0;
}

.course-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex: 0 0 auto;
  padding: 0.55rem 0.95rem;
  font-size: var(--rp-text-base, 0.9rem);
  font-weight: var(--rp-weight-semibold, 700);
  color: var(--rp-text-muted);
  text-decoration: none;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface);
  white-space: nowrap;
  transition:
    background-color var(--rp-transition-fast),
    color var(--rp-transition-fast),
    border-color var(--rp-transition-fast);
}

.course-tab i {
  font-size: 0.85em;
  opacity: 0.9;
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

.course-tab-panel {
  min-width: 0;
}

@media (max-width: 575.98px) {
  .course-header__top {
    flex-direction: row;
    align-items: flex-start;
  }

  .course-title {
    font-size: 1.2rem;
  }

  .course-header__action {
    padding-inline: 0.55rem;
    font-size: 0.8rem;
  }

  .course-grades-legend {
    flex-direction: column;
    align-items: stretch;
  }

  .course-grades-legend__action {
    align-self: flex-start;
  }

  .course-conduct-toolbar,
  .course-assistance-toolbar {
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: nowrap;
    gap: var(--rp-space-2);
  }

  .course-conduct-toolbar__filter,
  .course-assistance-toolbar__date {
    flex: 1 1 auto;
    min-width: 0;
  }

  .course-assistance-toolbar__schedule {
    flex: 0 1 auto;
    max-width: 38%;
    font-size: 0.75rem;
    padding-bottom: 0.55rem;
  }

  .course-conduct-toolbar .course-header__action,
  .course-assistance-toolbar .course-header__action {
    flex-shrink: 0;
    padding-inline: 0.55rem;
    font-size: 0.78rem;
  }

  .course-tab {
    padding: 0.5rem 0.75rem;
    font-size: var(--rp-text-sm, 0.85rem);
  }
}

@media (min-width: 768px) {
  .course-title {
    font-size: 1.5rem;
  }
}
</style>
