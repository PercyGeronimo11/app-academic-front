<template>
  <div class="home-stack home-student">
    <CRow class="g-3 mb-4 home-student-kpis">
      <CCol v-for="card in kpiCards" :key="card.id" xs="6" md="4" xl="2">
        <HomeStudentKpiCard
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          :cta="card.cta"
          :to="card.to"
          :icon="card.icon"
          :tone="card.tone"
        >
          <template v-if="card.id === 'attendance' && attendance" #value>
            <span class="home-stat-pill home-stat-pill--danger">{{ attendance.faltas }} faltas</span>
            <span class="home-stat-pill home-stat-pill--warn">{{ attendance.tardanzas }} tardanzas</span>
          </template>
          <template v-else-if="card.id === 'requests' && latestRequest" #value>
            <span class="home-kpi__value-text">{{ latestRequest.subject || latestRequest.request_number || `Trámite #${latestRequest.id}` }}</span>
            <span class="home-status-badge mt-1" :class="requestStatusClass">
              {{ latestRequest.current_status }}
            </span>
          </template>
        </HomeStudentKpiCard>
      </CCol>
    </CRow>

    <section class="home-panel">
      <div class="home-panel__head">
        <h2>
          <i class="fas fa-graduation-cap home-panel__title-icon" aria-hidden="true"></i>
          Mis cursos
        </h2>
        <router-link :to="links.courses || '/courses/student/list'">Ver todos</router-link>
      </div>
      <div v-if="!courses.length" class="home-empty home-empty--iconed">
        <i class="fas fa-book" aria-hidden="true"></i>
        <span>No hay cursos para el periodo activo.</span>
      </div>
      <div v-else class="home-courses">
        <article
          v-for="course in courses"
          :key="course.course_class_id"
          class="home-course-card home-course-card--rich"
        >
          <div class="home-course-card__icon" aria-hidden="true">
            <i class="fas" :class="courseIcon(course.course_name)"></i>
          </div>
          <div class="home-course-card__body">
            <h3>{{ course.course_name }}</h3>
            <router-link class="home-course-card__open" :to="course.detail_url">
              Abrir curso
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </router-link>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeStudentKpiCard from '@/components/home/HomeStudentKpiCard.vue'
import { formatConfidence, getRiskLabel } from '@/utils/academicRisk'
import { RISK_LEVELS as LEVELS } from '@/types/academicRisk'
import { buildStudentHomeKpiCards } from '@/utils/studentHomeKpis'

const props = defineProps({
  data: { type: Object, required: true },
})

const links = computed(() => props.data.links || {})
const myRisk = computed(() => props.data.my_risk || null)
const attendance = computed(() => props.data.attendance || null)
const announcements = computed(() => props.data.announcements || {})
const latestRequest = computed(() => props.data.latest_request || null)
const reportCard = computed(() => props.data.report_card || null)
const notifications = computed(() => props.data.notifications || {})
const courses = computed(() => props.data.courses || [])

const riskTone = computed(() => {
  const level = Number(myRisk.value?.risk_level)
  if (!myRisk.value?.has_prediction) return 'slate'
  if (level === LEVELS.VERY_LOW || level === LEVELS.LOW) return 'ok'
  if (level === LEVELS.MEDIUM) return 'amber'
  return 'alert'
})

const riskIcon = computed(() => {
  const level = Number(myRisk.value?.risk_level)
  if (!myRisk.value?.has_prediction) return 'fa-hourglass-half'
  if (level === LEVELS.VERY_LOW || level === LEVELS.LOW) return 'fa-shield-alt'
  if (level === LEVELS.MEDIUM) return 'fa-exclamation-circle'
  return 'fa-exclamation-triangle'
})

const requestStatusClass = computed(() => {
  const status = String(latestRequest.value?.current_status || '').toUpperCase()
  if (status.includes('OBSERVADO')) return 'home-status-badge--warn'
  if (status.includes('COMPLETADO') || status.includes('APROBADO')) return 'home-status-badge--ok'
  if (status.includes('REVISION') || status.includes('PENDIENTE')) return 'home-status-badge--info'
  return 'home-status-badge--neutral'
})

const kpiCards = computed(() => buildStudentHomeKpiCards({
  links: links.value,
  myRisk: myRisk.value,
  attendance: attendance.value,
  announcements: announcements.value,
  latestRequest: latestRequest.value,
  reportCard: reportCard.value,
  notifications: notifications.value,
  riskTone: riskTone.value,
  riskIcon: riskIcon.value,
  formatConfidence,
  getRiskLabel,
}))

const COURSE_ICON_RULES = [
  { match: /matem/i, icon: 'fa-calculator' },
  { match: /comunic|lengua|castellano/i, icon: 'fa-comments' },
  { match: /ingl[eé]s|idioma/i, icon: 'fa-language' },
  { match: /arte|cultura/i, icon: 'fa-palette' },
  { match: /social/i, icon: 'fa-globe-americas' },
  { match: /ciudadan|c[ií]vica|personal/i, icon: 'fa-users' },
  { match: /f[ií]sica/i, icon: 'fa-running' },
  { match: /religi/i, icon: 'fa-pray' },
  { match: /ciencia|tecnolog/i, icon: 'fa-flask' },
  { match: /trabajo|ept/i, icon: 'fa-tools' },
  { match: /tutor/i, icon: 'fa-user-friends' },
]

const courseIcon = (name = '') => {
  const found = COURSE_ICON_RULES.find((rule) => rule.match.test(name))
  return found?.icon || 'fa-book'
}
</script>
