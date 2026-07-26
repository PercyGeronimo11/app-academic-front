<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4">
      <CCol xs="12" sm="6" xl="3">
        <div class="home-kpi home-kpi--alert">
          <div class="home-kpi__label">Alto + Crítico</div>
          <div class="home-kpi__value">{{ kpis.high_or_critical ?? 0 }}</div>
          <div class="home-kpi__hint">{{ kpis.high ?? 0 }} alto · {{ kpis.critical ?? 0 }} crítico</div>
        </div>
      </CCol>
      <CCol xs="12" sm="6" xl="3">
        <div class="home-kpi home-kpi--indigo">
          <div class="home-kpi__label">Cobertura predicción</div>
          <div class="home-kpi__value">{{ formatPct(kpis.coverage_percentage) }}</div>
          <div class="home-kpi__hint">
            {{ kpis.predicted_students ?? 0 }} / {{ kpis.total_students ?? 0 }} ·
            {{ kpis.pending_students ?? 0 }} sin predicción
          </div>
        </div>
      </CCol>
      <CCol xs="12" sm="6" xl="3">
        <div class="home-kpi home-kpi--slate">
          <div class="home-kpi__label">Asistencia del periodo</div>
          <div class="home-kpi__value home-kpi__value--sm">
            <template v-if="attendance">
              A {{ attendance.presentes }} · T {{ attendance.tardanzas }} · F {{ attendance.faltas }}
            </template>
            <template v-else>—</template>
          </div>
          <div class="home-kpi__hint">Totales del año activo</div>
        </div>
      </CCol>
      <CCol xs="12" sm="6" xl="3">
        <router-link class="home-kpi home-kpi--amber home-kpi--link" :to="links.requests || '/admin-tramites'">
          <div class="home-kpi__label">Trámites por revisar</div>
          <div class="home-kpi__value">{{ kpis.pending_requests ?? 0 }}</div>
          <div class="home-kpi__hint">Ir a trámites virtuales</div>
        </router-link>
      </CCol>
    </CRow>

    <CRow class="g-3">
      <CCol xs="12" lg="7">
        <section class="home-panel">
          <div class="home-panel__head">
            <h2>Top alertas de riesgo</h2>
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
            <h2>Comunicados</h2>
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
</script>
