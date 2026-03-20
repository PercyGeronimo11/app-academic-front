<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="d-flex justify-content-between align-items-center py-3 px-4">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <h4 class="fw-bold text-primary mb-0">
                  Reporte General de Asistencias
                </h4>
              </div>
            </div>
            <!-- Indicador visual -->
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow-sm"
              style="cursor:pointer; background: linear-gradient(135deg, #321fdb, #1f1498); transition: all 0.2s ease;"
              @click="verDetalle(alumno)">
              <i class="fas fa-eye text-white"></i>
              <span class="text-white fw-semibold">Ver detalle</span>
            </div>
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
              {{ data.total }}
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
              {{ data.asistencias }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.asistencias) }}%)
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
              {{ data.tardanzas }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.tardanzas) }}%)
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
              {{ data.faltas }}
              <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.faltas) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <div style="overflow-x: auto;">
      <div style="min-width: 900px; height: 500px;">
        <CChartBar :data="chartData" :options="options" :plugins="plugins" />
      </div>
    </div>
  </CContainer>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '../../../services/AssistanceService'
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useRouter } from 'vue-router'
import { CCard, CCardBody } from '@coreui/vue'

const router = useRouter()
// Simulación de respuesta de API
const data = ref({
  total: 0,
  asistencias: 0,
  tardanzas: 0,
  faltas: 0,
})


const chartData = {
  labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Asistencias',
      data: [10, 15, 4, 5, 14, 13, 4, 12, 22, 18],
      backgroundColor: '#2eb85c',
      barThickness: 10
    },
    {
      label: 'Tardanzas',
      data: [8, 5, 14, 3, 5, 7, 5, 5, 0, 2],
      backgroundColor: '#f9b115',
      barThickness: 10
    },
    {
      label: 'Faltas',
      data: [4, 1, 4, 12, 1, 4, 13, 2, 1, 1],
      backgroundColor: '#e55353',
      barThickness: 10
    }
  ]
}

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
}

// calcular porcentaje
const porcentaje = (valor) => {
  if (!data.value.total) return 0
  return ((valor / data.value.total) * 100).toFixed(1)
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
