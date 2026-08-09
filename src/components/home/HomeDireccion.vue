<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4 home-student-kpis">
      <CCol xs="12" sm="6" xl="3">
        <HomeStudentKpiCard
          label="Alto + Crítico"
          :value="String(kpis.high_or_critical ?? 0)"
          :hint="`${kpis.high ?? 0} alto · ${kpis.critical ?? 0} crítico`"
          cta="Ver riesgo"
          :to="links.academic_risk || '/prediccion/dashboard'"
          icon="fa-exclamation-triangle"
          tone="alert"
        />
      </CCol>
      <CCol xs="12" sm="6" xl="3">
        <HomeStudentKpiCard
          label="Cobertura predicción"
          :value="formatPct(kpis.coverage_percentage)"
          :hint="`${kpis.predicted_students ?? 0} / ${kpis.total_students ?? 0} · ${kpis.pending_students ?? 0} sin predicción`"
          cta="Ver dashboard"
          :to="links.academic_risk || '/prediccion/dashboard'"
          icon="fa-chart-pie"
          tone="indigo"
        />
      </CCol>
      <CCol xs="12" sm="6" xl="3">
        <HomeStudentKpiCard
          label="Asistencia del periodo"
          :value="attendanceSummary"
          hint="Totales del año activo"
          cta="Ver reporte"
          :to="links.attendance_report || '/assistances/admin/reporte-periodico'"
          icon="fa-calendar-check"
          tone="brand"
        />
      </CCol>
      <CCol xs="12" sm="6" xl="3">
        <HomeStudentKpiCard
          label="Trámites por revisar"
          :value="String(kpis.pending_requests ?? 0)"
          hint="Cola de administración"
          cta="Ir a trámites"
          :to="links.requests || '/admin-tramites'"
          icon="fa-folder-open"
          tone="amber"
        />
      </CCol>
    </CRow>

    <div class="home-quick-links mb-4">
      <router-link class="home-quick-link" :to="links.academic_risk || '/prediccion/dashboard'">
        <i class="fas fa-chart-line" aria-hidden="true"></i>
        Riesgo académico
      </router-link>
      <router-link class="home-quick-link" :to="links.attendance_report || '/assistances/admin/reporte-periodico'">
        <i class="fas fa-clipboard-list" aria-hidden="true"></i>
        Reporte asistencia
      </router-link>
      <router-link class="home-quick-link" :to="links.requests || '/admin-tramites'">
        <i class="fas fa-inbox" aria-hidden="true"></i>
        Trámites
      </router-link>
      <router-link class="home-quick-link" :to="links.announcements || '/my-announcements'">
        <i class="fas fa-bullhorn" aria-hidden="true"></i>
        Comunicados
      </router-link>
      <router-link class="home-quick-link" to="/announcements/publish">
        <i class="fas fa-pen" aria-hidden="true"></i>
        Publicar comunicado
      </router-link>
    </div>

    <CRow class="g-3">
      <CCol xs="12" lg="7">
        <section class="home-panel">
          <div class="home-panel__head">
            <h2>
              <i class="fas fa-exclamation-circle home-panel__title-icon" aria-hidden="true"></i>
              Top alertas de riesgo
            </h2>
            <router-link :to="links.academic_risk || '/prediccion/dashboard'">Ver más</router-link>
          </div>
          <div v-if="!alerts.length" class="home-empty">No hay alumnos en riesgo alto/crítico.</div>
          <ul v-else class="home-list">
            <li v-for="item in alerts" :key="item.student_id">
              <div>
                <strong>{{ item.full_name }}</strong>
                <span class="home-list__meta">{{ item.classroom_label }}</span>
              </div>
              <span :class="getRiskChipClass(item.risk_level)">{{ item.risk_label || getRiskLabel(item.risk_level) }}</span>
            </li>
          </ul>
        </section>
      </CCol>
      <CCol xs="12" lg="5">
        <section class="home-panel">
          <div class="home-panel__head">
            <h2>
              <i class="fas fa-bullhorn home-panel__title-icon" aria-hidden="true"></i>
              Comunicados
            </h2>
            <router-link :to="links.announcements || '/my-announcements'">Ver todos</router-link>
          </div>
          <p class="home-panel__badge mb-3">{{ announcements.unread_count || 0 }} no leído(s)</p>
          <div v-if="!announcementItems.length" class="home-empty">Sin comunicados nuevos.</div>
          <ul v-else class="home-list">
            <li v-for="item in announcementItems" :key="item.id">
              <div>
                <strong>{{ item.title }}</strong>
                <span class="home-list__meta">{{ formatDateTime(item.published_at) }}</span>
              </div>
            </li>
          </ul>
        </section>
      </CCol>
    </CRow>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeStudentKpiCard from '@/components/home/HomeStudentKpiCard.vue'
import { formatDateTime, getRiskChipClass, getRiskLabel } from '@/utils/academicRisk'

const props = defineProps({
  data: { type: Object, required: true },
})

const kpis = computed(() => props.data.kpis || {})
const attendance = computed(() => kpis.value.attendance || null)
const links = computed(() => props.data.links || {})
const alerts = computed(() => props.data.alerts?.high_risk || [])
const announcements = computed(() => props.data.announcements || {})
const announcementItems = computed(() => announcements.value.items || [])

const formatPct = (value) => `${Number(value || 0).toFixed(1)} %`

const attendanceSummary = computed(() => {
  if (!attendance.value) return '—'
  return `A ${attendance.value.presentes} · T ${attendance.value.tardanzas} · F ${attendance.value.faltas}`
})
</script>
