
<template>
  <div>

    <h4 class="mb-4">Reporte General del Alumno</h4>

    <!-- Cards resumen -->
    <CRow>

      <!-- Total registros -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-primary shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Registros</div>
            <div class="fs-4 fw-semibold">
              {{ data.total }}
              <span class="fs-6 fw-normal opacity-75">
                (100%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Asistencias -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-success shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.asistencias }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.asistencias) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Tardanzas -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-warning shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas</div>
            <div class="fs-4 fw-semibold">
              {{ data.tardanzas }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.tardanzas) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Faltas -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-danger shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Faltas</div>
            <div class="fs-4 fw-semibold">
              {{ data.faltas }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.faltas) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

    </CRow>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AssistanceService from '../../../services/AssistanceService'

const route = useRoute()

// ID del alumno desde la URL
const alumnoId = route.params.id

// Simulación de respuesta de API
const data = ref({
  total: 0,
  asistencias: 0,
  tardanzas: 0,
  faltas: 0,
})

// Simular llamada API
const cargarReporte = async () => {
  const response = await AssistanceService.getReporteGeneralAlumno()
  data.value = response.data
}

// calcular porcentaje
const porcentaje = (valor) => {
  if (!data.value.total) return 0
  return ((valor / data.value.total) * 100).toFixed(1)
}

onMounted(() => {
  cargarReporte()
})
</script>

<style scoped></style>

