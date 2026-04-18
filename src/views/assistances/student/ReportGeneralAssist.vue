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
              {{ data.total_registros }} <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total_registros) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('A')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_asistencias }} <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.t_asistencias) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Tardanzas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TL')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Leves</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_leve }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_leve)
                }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TM')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Moderadas</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_moderada }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_moderada)
                }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TG')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Grave</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_grave }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_grave)
                }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TE')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Extrema</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_extrema }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_extrema)
                }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Faltas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('F')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Faltas</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_faltas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_faltas)
                }}%)</span>
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
import { colorEstado, textoEstado, ESTADOS_ASISTENCIA, colorFijoEstado } from '@/utils/utils'

const router = useRouter()
// Simulación de respuesta de API
const data = ref({
  total_registros: 0,
  t_asistencias: 0,
  t_tard_leve: 0,
  t_tard_moderada: 0,
  t_tard_grave: 0,
  t_tard_extrema: 0,
  t_faltas: 0,
})

const list_asistencias = ref([])
const list_tard_leve = ref([])
const list_tard_moderada = ref([])
const list_tard_grave = ref([])
const list_tard_extrema = ref([])
const list_faltas = ref([])


const chartData = computed(() => ({
  labels: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
 {
      label: textoEstado(ESTADOS_ASISTENCIA.ASISTENCIA),
      data: list_asistencias.value,
      backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.ASISTENCIA),
      barThickness: 7
    },
    {
      label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_LEVE),
      data: list_tard_leve.value,
      backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_LEVE),
      barThickness: 7
    },
    {
      label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA),
      data: list_tard_moderada.value,
      backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA),
      barThickness: 7
    },
    {
      label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_GRAVE),
      data: list_tard_grave.value,
      backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_GRAVE),
      barThickness: 7
    },
    {
      label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_EXTREMA),
      data: list_tard_extrema.value,
      backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_EXTREMA),
      barThickness: 7
    },
    {
      label: textoEstado(ESTADOS_ASISTENCIA.FALTA),
      data: list_faltas.value,
      backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.FALTA),
      barThickness: 7
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
  list_tard_leve.value = response.data.tardanzas_leve
  list_tard_moderada.value = response.data.tardanzas_moderada
  list_tard_grave.value = response.data.tardanzas_grave
  list_tard_extrema.value = response.data.tardanzas_extrema
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

<style scoped>
.bg-orange-1 {
  background-color: #eed306;
}

.bg-orange-2 {
  background-color: #ffb300;
}

.bg-orange-3 {
  background-color: #fd841a;
}

.bg-orange-4 {
  background-color: #fa6736;
}

.wrap-text {
  white-space: normal !important;
  /* permite salto */
  line-height: 1.2;
}
</style>
