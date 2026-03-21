<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-2 px-3 px-md-4 gap-2">

            <!-- Título -->
            <div class="text-center">
              <h5 class="fw-bold text-primary mb-0">
                Reporte total de asistencias
              </h5>
            </div>

            <!-- Botón / Acción -->
            <CButton class="bg-dark w-30 w-md-auto shadow-sm" @click="verDetalle(alumno)">
              <i class="fas fa-eye text-white"></i>
              <span class="text-white fw-semibold"> Ver detalle</span>
            </CButton>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>


    <CRow class="mb-2">
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-primary shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Registros</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_registros }}
              <span class="fs-6 fw-normal opacity-75">
                (100%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Asistencias -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-success shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_asistencias }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total_asistencias) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Tardanzas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-warning shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Tardanzas</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_tardanzas }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total_tardanzas) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Faltas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-danger shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Faltas</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_faltas }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total_faltas) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody>
            <h5 class="fw-bold text-secondary mb-4 ms-4 text-center">
              Distribución de asistencias por mes
            </h5>

            <div style="overflow-x: auto;">
              <div style="min-width: 900px; height: 500px;">
                <CChartBar :data="chartData" :options="options" :plugins="plugins" />
              </div>
            </div>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AssistanceService from '../../../services/AssistanceService'
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useRouter } from 'vue-router'
import { CButton, CCard, CCardBody } from '@coreui/vue'

const router = useRouter()
// Simulación de respuesta de API
const data = ref({
  total_registros: 0,
  total_asistencias: 0,
  total_tardanzas: 0,
  total_faltas: 0,
})

const list_asistencias = ref([])
const list_tardanzas = ref([])
const list_faltas = ref([])

const chartData = computed(() => ({
  labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Asistencias',
      data: list_asistencias.value,
      backgroundColor: '#2eb85c',
      barThickness: 10
    },
    {
      label: 'Tardanzas',
      data: list_tardanzas.value,
      backgroundColor: '#f9b115',
      barThickness: 10
    },
    {
      label: 'Faltas',
      data: list_faltas.value,
      backgroundColor: '#e55353',
      barThickness: 10
    }
  ]
}))


const options = {
  responsive: true,

  plugins: {
    legend: {
      position: 'top'
    }
  },

  scales: {
    y: {
      beginAtZero: true
    }
  }
}

// Simular llamada API
const cargarReporte = async () => {
  const response = await AssistanceService.getReporteGeneralAlumno()
  data.value = response.data
  list_asistencias.value = response.data.asistencias
  list_tardanzas.value = response.data.tardanzas
  list_faltas.value = response.data.faltas
}

// calcular porcentaje
const porcentaje = (valor) => {
  if (!data.value.total_registros) return 0
  return ((valor / data.value.total_registros) * 100).toFixed(1)
}

const plugins = [ChartDataLabels]

const verDetalle = () => {
  router.push(`/assistances/alumno/reporte-detallado`)
}

onMounted(() => {
  cargarReporte()
})
</script>

<style scoped></style>
