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
        <router-link class="home-cta" :to="links.register_qr || '/assistances/auxiliar/register-qr'">
          <i class="fas fa-qrcode"></i>
          <div>
            <strong>Registro QR</strong>
            <span>Escanear asistencia</span>
          </div>
        </router-link>
      </CCol>
      <CCol xs="12" md="6">
        <router-link class="home-cta home-cta--secondary" :to="links.register_dni || '/assistances/auxiliar/register-dni'">
          <i class="fas fa-id-card"></i>
          <div>
            <strong>Registro DNI</strong>
            <span>Ingreso manual</span>
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
