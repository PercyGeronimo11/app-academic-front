<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4">
      <CCol xs="12" md="6">
        <div class="home-kpi home-kpi--indigo">
          <div class="home-kpi__label">Asistencias registradas hoy</div>
          <div class="home-kpi__value">{{ kpis.asistencias_hoy ?? 0 }}</div>
          <div class="home-kpi__hint">Registros del día en el colegio</div>
        </div>
      </CCol>
      <CCol xs="12" md="6">
        <div class="home-kpi home-kpi--slate">
          <div class="home-kpi__label">Alumnos esperados</div>
          <div class="home-kpi__value">{{ kpis.alumnos_esperados ?? 0 }}</div>
          <div class="home-kpi__hint">Alumnos activos</div>
        </div>
      </CCol>
    </CRow>

    <CRow class="g-3">
      <CCol xs="12" md="6">
        <router-link
          class="home-cta"
          :to="links.register || links.register_qr || '/assistances/registrar?tab=qr'"
        >
          <i class="fas fa-user-check"></i>
          <div>
            <strong>Registrar asistencia</strong>
            <span>QR o búsqueda de alumno</span>
          </div>
        </router-link>
      </CCol>
      <CCol xs="12" md="6">
        <router-link class="home-cta home-cta--secondary" :to="links.seguimiento || '/assistances/seguimiento'">
          <i class="fas fa-tasks"></i>
          <div>
            <strong>Seguimiento diario</strong>
            <span>Ver asistencias del día</span>
          </div>
        </router-link>
      </CCol>
    </CRow>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const kpis = computed(() => props.data.kpis || {})
const links = computed(() => props.data.links || {})
</script>
