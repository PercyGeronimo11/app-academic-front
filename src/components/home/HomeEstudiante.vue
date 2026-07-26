<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4">
      <CCol xs="12" md="4">
        <div class="home-kpi" :class="riskKpiClass">
          <div class="home-kpi__label">Mi nivel de riesgo</div>
          <div class="home-kpi__value home-kpi__value--sm">
            <template v-if="myRisk?.has_prediction">
              {{ myRisk.risk_label || getRiskLabel(myRisk.risk_level) }}
            </template>
            <template v-else>Sin predicción</template>
          </div>
          <div class="home-kpi__hint">
            <template v-if="myRisk?.has_prediction">
              Confianza {{ formatConfidence(myRisk.confidence) }}
            </template>
            <template v-else>Aún no hay predicción para este bimestre</template>
          </div>
        </div>
      </CCol>
      <CCol xs="12" md="4">
        <router-link class="home-kpi home-kpi--slate home-kpi--link" :to="links.attendance || '/assistances/alumno/reporte'">
          <div class="home-kpi__label">Asistencia del bimestre</div>
          <div class="home-kpi__value home-kpi__value--sm">
            <template v-if="attendance">
              F {{ attendance.faltas }} · T {{ attendance.tardanzas }}
            </template>
            <template v-else>—</template>
          </div>
          <div class="home-kpi__hint">Ver reporte general</div>
        </router-link>
      </CCol>
      <CCol xs="12" md="4">
        <router-link class="home-kpi home-kpi--indigo home-kpi--link" :to="links.report_card || '/my-report-card'">
          <div class="home-kpi__label">Libreta de notas</div>
          <div class="home-kpi__value home-kpi__value--sm">
            {{ reportCard?.bimester?.name || 'Bimestre actual' }}
          </div>
          <div class="home-kpi__hint">
            {{ reportCard?.scores_count ?? 0 }} nota(s) · Ver libreta
          </div>
        </router-link>
      </CCol>
    </CRow>

    <CRow class="g-3 mb-4">
      <CCol xs="12" lg="6">
        <section class="home-panel">
          <div class="home-panel__head">
            <h2>Novedades</h2>
          </div>
          <ul class="home-list">
            <li>
              <router-link :to="links.notifications || '/my-notifications'">
                <strong>{{ notifications.unread_count || 0 }} notificaciones</strong>
                <span class="home-list__meta">no leídas</span>
              </router-link>
            </li>
            <li>
              <router-link :to="links.announcements || '/my-announcements'">
                <strong>{{ announcements.unread_count || 0 }} comunicados</strong>
                <span class="home-list__meta">no leídos</span>
              </router-link>
            </li>
          </ul>
          <ul v-if="announcementItems.length" class="home-list mt-3">
            <li v-for="item in announcementItems" :key="item.id">
              <strong>{{ item.title }}</strong>
            </li>
          </ul>
        </section>
      </CCol>
      <CCol xs="12" lg="6">
        <section class="home-panel">
          <div class="home-panel__head">
            <h2>Mis trámites</h2>
            <router-link :to="links.requests || '/myPaperworks'">Ver todos</router-link>
          </div>
          <div v-if="!latestRequest" class="home-empty">No tienes trámites registrados.</div>
          <div v-else class="home-teaser">
            <strong>{{ latestRequest.subject || `Trámite #${latestRequest.id}` }}</strong>
            <span>{{ latestRequest.current_status }}</span>
          </div>
        </section>
      </CCol>
    </CRow>

    <section class="home-panel">
      <div class="home-panel__head">
        <h2>Mis cursos</h2>
        <router-link :to="links.courses || '/mainAreaStudent'">Ver todos</router-link>
      </div>
      <div v-if="!courses.length" class="home-empty">No hay cursos para el periodo activo.</div>
      <div v-else class="home-courses">
        <article v-for="course in courses" :key="course.course_class_id" class="home-course-card">
          <div>
            <h3>{{ course.course_name }}</h3>
          </div>
          <div class="home-course-card__actions">
            <router-link :to="course.detail_url">Abrir</router-link>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatConfidence, getRiskLabel } from '@/utils/academicRisk'
import { RISK_LEVELS as LEVELS } from '@/types/academicRisk'

const props = defineProps({
  data: { type: Object, required: true },
})

const links = computed(() => props.data.links || {})
const myRisk = computed(() => props.data.my_risk || null)
const attendance = computed(() => props.data.attendance || null)
const reportCard = computed(() => props.data.report_card || null)
const notifications = computed(() => props.data.notifications || {})
const announcements = computed(() => props.data.announcements || {})
const announcementItems = computed(() => announcements.value.items || [])
const latestRequest = computed(() => props.data.latest_request || null)
const courses = computed(() => props.data.courses || [])

const riskKpiClass = computed(() => {
  const level = Number(myRisk.value?.risk_level)
  if (!myRisk.value?.has_prediction) return 'home-kpi--slate'
  if (level === LEVELS.VERY_LOW || level === LEVELS.LOW) return 'home-kpi--ok'
  if (level === LEVELS.MEDIUM) return 'home-kpi--amber'
  return 'home-kpi--alert'
})
</script>
