<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4 home-student-kpis">
      <CCol xs="12" md="4">
        <HomeStudentKpiCard
          label="Asistencias registradas hoy"
          :value="String(kpis.asistencias_hoy ?? 0)"
          hint="Registros del día en el colegio"
          icon="fa-user-check"
          tone="brand"
        />
      </CCol>
      <CCol xs="12" md="4">
        <HomeStudentKpiCard
          label="Alumnos esperados"
          :value="String(kpis.alumnos_esperados ?? 0)"
          hint="Alumnos activos"
          icon="fa-users"
          tone="indigo"
        />
      </CCol>
      <CCol xs="12" md="4">
        <HomeStudentKpiCard
          label="Trámites por completar"
          :value="String(kpis.pending_complete_requests ?? 0)"
          hint="Aprobados listos para marcar"
          cta="Ver trámites"
          :to="links.requests || '/auxiliar-tramites'"
          icon="fa-clipboard-check"
          tone="amber"
        />
      </CCol>
    </CRow>

    <CRow class="g-3 mb-4">
      <CCol xs="12" md="4">
        <router-link class="home-cta" :to="links.register_qr || '/assistances/auxiliar/register-qr'">
          <i class="fas fa-qrcode"></i>
          <div>
            <strong>Registrar asistencia</strong>
            <span>QR o búsqueda de alumno</span>
          </div>
        </router-link>
      </CCol>
      <CCol xs="12" md="4">
        <router-link class="home-cta home-cta--secondary" :to="links.register_dni || '/assistances/auxiliar/register-dni'">
          <i class="fas fa-id-card"></i>
          <div>
            <strong>Registro DNI</strong>
            <span>Ingreso manual</span>
          </div>
        </router-link>
      </CCol>
      <CCol xs="12" md="4">
        <router-link class="home-cta home-cta--tertiary" :to="links.seguimiento || '/assistances/seguimiento'">
          <i class="fas fa-chart-bar"></i>
          <div>
            <strong>Seguimiento diario</strong>
            <span>Ver avance de asistencia</span>
          </div>
        </router-link>
      </CCol>
    </CRow>

    <section v-if="(announcements.unread_count || 0) > 0" class="home-panel">
      <div class="home-panel__head">
        <h2>
          <i class="fas fa-bullhorn home-panel__title-icon" aria-hidden="true"></i>
          Comunicados
        </h2>
        <router-link :to="links.announcements || '/my-announcements'">Ver todos</router-link>
      </div>
      <p class="home-panel__badge mb-2">{{ announcements.unread_count }} no leído(s)</p>
      <ul class="home-list">
        <li v-for="item in announcementItems" :key="item.id">
          <strong>{{ item.title }}</strong>
        </li>
      </ul>
    </section>
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
</script>
