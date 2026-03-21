<template>
  <CContainer fluid>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <CRow class="align-items-center">
              <CCol md="8">
                <h4 class="fw-bold text-primary mb-3">
                  <i class="fas fa-chart-line me-2"></i>
                  Reporte de asistencias
                </h4>

                <!-- Filtros -->
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <CFormSelect v-model="filtros.tipo" @change="onChangeTipo" style="width: 160px;">
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </CFormSelect>


                  <!-- Fecha -->
                  <CFormInput v-if="filtros.tipo === 'diario' || filtros.tipo === 'semanal'" type="date"
                    v-model="filtros.fecha" style="width: 150px;" />

                  <!-- Mes -->
                  <CFormSelect v-if="filtros.tipo === 'mensual'" v-model="filtros.mes" style="width: 150px;">
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                      {{ mes.label }}
                    </option>
                  </CFormSelect>

                  <!-- Botón -->
                  <CButton color="primary" @click="consultarReporte">
                    <i class="fas fa-search me-1"></i> Consultar
                  </CButton>

                </div>
              </CCol>

              <CCol md="4" class="text-md-end mt-3 mt-md-0">
                <CBadge color="dark" class="px-3 py-2 fs-6">
                  <div class="my-1"> 📅 Desde : {{ data.fecha_inicio }}</div>
                  <div class="my-1">📅 Hasta : {{ data.fecha_fin }}</div>
                </CBadge>
              </CCol>

            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Cards resumen -->
    <CRow class="mb-2">
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-primary shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Alumnos</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_registros }} <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total_registros) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-success shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_presentes }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.total_presentes)
                }}%)</span>
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
              {{ data.total_tardanzas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.total_tardanzas)
                }}%)</span>
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
              {{ data.total_faltas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.total_faltas)
                }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tabla secciones -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardHeader class="bg-white border-bottom py-2">
            <div class="d-flex justify-content-between align-items-center">

              <h5 class="fw-bold  text-primary mb-0">
                <i class="fas fa-chart-bar me-2"></i>
                Seguimiento por aula
              </h5>

              <div class="d-flex align-items-center">
                <span class="me-2 text-success fw-semibold ">
                  En seguimiento <i class="fas fa-eye me-2"></i>
                </span>
              </div>

            </div>
          </CCardHeader>

          <!-- BODY -->
          <CCardBody class="p-0">

            <CTable hover responsive align="middle" class="mb-0 text-center">

              <!-- CABECERA -->
              <CTableHead class="table-dark text-center">
                <CTableRow>
                  <CTableHeaderCell class="text-center">Sección</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Total</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Asistencias</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Tardanzas</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Faltas</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <!-- CUERPO -->
              <CTableBody>
                <CTableRow v-for="item in secciones" :key="item.id">

                  <CTableDataCell class="fw-semibold text-center">
                    {{ item.grado }}° {{ item.seccion }}
                  </CTableDataCell>

                  <CTableDataCell>
                    <CBadge color="primary" class="px-3 py-1 fs-6">
                      {{ item.total }}
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell>
                    <CBadge color="success" class="px-3 py-1 fs-6">
                      {{ item.asistencias }}
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell>
                    <CBadge color="warning" class="px-3 py-1 fs-6">
                      {{ item.tardanzas }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="danger" class="px-3 py-1 fs-6">
                      {{ item.faltas }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <i class="fas fa-eye text-primary" style="cursor:pointer; font-size:16px"
                      @click="verDetalle(item)"></i>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>


    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody>
            <h5 class="fw-bold text-secondary mb-4 ms-4 text-center">
              Distribución de asistencias por aula
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
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import AssistanceService from '@/services/AssistanceService'
import { useRouter } from 'vue-router'
import { CCard, CCardBody, CCol, CRow } from '@coreui/vue'
import { meses } from '../../../utils/utils'

const router = useRouter()
const secciones = ref([])
const data = ref({
  total_registros: 0,
  total_presentes: 0,
  total_tardanzas: 0,
  total_faltas: 0,
  fecha_inicio: '',
  fecha_fin: ''
})
const filtros = ref({
  tipo: 'diario',
  fecha: new Date().toISOString().split('T')[0], // fecha actual
  mes: new Date().getMonth() + 1
})

const asistenciasArr = ref([])
const tardanzasArr = ref([])
const faltasArr = ref([])


const chartData = computed(() => ({
  labels: ['1-A°', '1-B°', '1-C°', '1-D°', '2-A°', '2-B°', '2-C°', '2-D°', '3-A°', '3-B°', '3-C°', '3-D°', '4-A°', '4-B°', '4-C°', '4-D°', '5-A°', '5-B°', '5-C°', '5-D°'],
  datasets: [
    {
      label: 'Asistencias',
      data: asistenciasArr.value,
      backgroundColor: '#2eb85c',
      barThickness: 10
    },
    {
      label: 'Tardanzas',
      data: tardanzasArr.value,
      backgroundColor: '#f9b115',
      barThickness: 10
    },
    {
      label: 'Faltas',
      data: faltasArr.value,
      backgroundColor: '#e55353',
      barThickness: 10
    }
  ]
}))



const consultarReporte = () => {

  let params = {
    tipo: filtros.value.tipo
  }

  if (filtros.value.tipo === 'diario' || filtros.value.tipo === 'semanal') {
    params.fecha = filtros.value.fecha
  }

  if (filtros.value.tipo === 'mensual') {
    params.nro_mes = filtros.value.mes
  }

  AssistanceService.getAsistenciaBySeccion(params).then(res => {
    const lista = res.data.data

    secciones.value = lista
    data.value = res.data

    // limpiar arrays
    asistenciasArr.value = []
    tardanzasArr.value = []
    faltasArr.value = []

    // llenar arrays ordenadamente

    asistenciasArr.value = lista.map(item => item.asistencias)
    tardanzasArr.value = lista.map(item => item.tardanzas)
    faltasArr.value = lista.map(item => item.faltas)
  })
  console.log('total asistencias:', asistenciasArr.value)
  console.log('total tardanzas:', tardanzasArr.value)
  console.log('total faltas:', faltasArr.value)
}

const onChangeTipo = () => {
  filtros.value.fecha = ''
}

const verDetalle = (item) => {
  router.push(`/assistances/seguimiento/seccion/${item.grade_section_id}`)
}


const porcentaje = (valor) => {
  if (!data.value.total_registros) return 0
  return ((valor / data.value.total_registros) * 100).toFixed(1)
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

const plugins = [ChartDataLabels]

onMounted(() => {
  consultarReporte()
})

</script>
<style scoped></style>