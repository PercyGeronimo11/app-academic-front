<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4 home-student-kpis">
      <CCol xs="6" md="3">
        <HomeStudentKpiCard
          label="Pendientes de mesa"
          :value="String(kpis.pending_mesa ?? 0)"
          hint="Requieren revisión o acción"
          cta="Ir a trámites"
          :to="links.requests || '/mesa-tramites'"
          icon="fa-inbox"
          tone="amber"
        />
      </CCol>
      <CCol xs="6" md="3">
        <HomeStudentKpiCard
          label="Observados"
          :value="String(kpis.observed_mesa ?? 0)"
          hint="Esperan subsanación del estudiante"
          cta="Ver historial"
          :to="links.requests_history || '/mesa-tramites/historial'"
          icon="fa-eye"
          tone="alert"
        />
      </CCol>
      <CCol xs="6" md="3">
        <HomeStudentKpiCard
          label="Comunicados sin leer"
          :value="String(kpis.unread_announcements ?? 0)"
          hint="Comunicados vigentes"
          cta="Ver comunicados"
          :to="links.announcements || '/my-announcements'"
          icon="fa-bullhorn"
          tone="indigo"
        />
      </CCol>
      <CCol xs="6" md="3">
        <HomeStudentKpiCard
          label="Notificaciones"
          :value="String(kpis.unread_notifications ?? 0)"
          hint="Avisos en bandeja"
          cta="Ver notificaciones"
          to="/my-notifications"
          icon="fa-bell"
          tone="brand"
        />
      </CCol>
    </CRow>

    <div class="home-quick-links mb-4">
      <router-link class="home-quick-link" :to="links.requests || '/mesa-tramites'">
        <i class="fas fa-tasks" aria-hidden="true"></i>
        Trámites en proceso
      </router-link>
      <router-link class="home-quick-link" :to="links.requests_history || '/mesa-tramites/historial'">
        <i class="fas fa-history" aria-hidden="true"></i>
        Historial de trámites
      </router-link>
      <router-link class="home-quick-link" :to="links.announcements || '/my-announcements'">
        <i class="fas fa-envelope-open" aria-hidden="true"></i>
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
              <i class="fas fa-bullhorn home-panel__title-icon" aria-hidden="true"></i>
              Comunicados recientes
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
      <CCol xs="12" lg="5">
        <section class="home-panel h-100">
          <div class="home-panel__head">
            <h2>
              <i class="fas fa-inbox home-panel__title-icon" aria-hidden="true"></i>
              Mesa de partes
            </h2>
          </div>
          <p class="home-empty mb-3">
            Atienda los trámites pendientes, observe o no admita según corresponda.
          </p>
          <router-link class="home-cta" :to="links.requests || '/mesa-tramites'">
            <i class="fas fa-folder-open"></i>
            <div>
              <strong>Abrir bandeja en proceso</strong>
              <span>{{ kpis.pending_mesa ?? 0 }} trámite(s) por revisar</span>
            </div>
          </router-link>
        </section>
      </CCol>
    </CRow>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeStudentKpiCard from '@/components/home/HomeStudentKpiCard.vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const kpis = computed(() => props.data.kpis || {})
const links = computed(() => props.data.links || {})
const announcements = computed(() => props.data.announcements || {})
const announcementItems = computed(() => announcements.value.items || [])

const formatDateTime = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
