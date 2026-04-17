<template>
  <CContainer fluid>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">

          <!-- 🔹 HEADER -->
          <CCardHeader class="bg-white border-bottom py-3">
            <h5 class="fw-bold text-primary mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Reporte de asistencias
            </h5>
          </CCardHeader>

          <CCardBody class="py-3 px-3 px-md-4">

            <CRow class="gy-3 align-items-center">

              <!-- 🔍 Filtros -->

              <CCol xs="12" md="8">
                <div class="d-flex flex-column flex-md-row gap-2">

                  <CFormSelect v-model="filtros.tipo" @change="onChangeTipo" class="w-100 w-md-auto">
                    <option value="diario">Diario</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </CFormSelect>

                  <!-- Fecha -->
                  <CFormInput v-if="filtros.tipo === 'diario' || filtros.tipo === 'semanal'" type="date"
                    v-model="filtros.fecha" class="w-100 w-md-auto" />

                  <!-- Mes -->
                  <CFormSelect v-if="filtros.tipo === 'mensual'" v-model="filtros.mes" class="w-100 w-md-auto">
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                      {{ mes.label }}
                    </option>
                  </CFormSelect>

                  <!-- Botón consultar -->
                  <CButton color="primary" @click="consultarReporte" class="w-100 w-md-auto">
                    <i class="fas fa-search me-1"></i> Consultar
                  </CButton>

                </div>
              </CCol>

              <!-- 📊 Info + acciones -->
              <CCol xs="12" md="4">
                <div class="d-flex flex-column flex-md-row justify-content-md-end gap-2">

                  <!-- Rango de fechas -->
                  <CBadge class="text-dark border px-3 py-2 text-center text-md-start">
                    <small>
                      📅 {{ formatDate(data.fecha_inicio) }} — {{ formatDate(data.fecha_fin) }}
                    </small>
                  </CBadge>

                  <!-- Descargar Excel -->
                  <CButton color="success" class="text-white w-100 w-md-auto" @click="descargarExcel">
                    <i class="fas fa-file-excel me-1"></i>
                    Descargar
                  </CButton>

                </div>
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
              {{ data.t_tard_moderado }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_moderado)
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
              {{ data.t_tard_extremo }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_extremo)
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

    <!-- Tabla secciones -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">

          <CCardBody class="p-0">

            <div class="modern-table-shell">
              <CTable hover responsive align="middle" class="mb-0 text-center">

                <!-- CABECERA -->
                <CTableHead class="modern-table-header text-center">
                  <CTableRow>
                    <CTableHeaderCell class="text-center">Aula</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Total</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Puntual</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Leve</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Moderada</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Grave</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Extrema</CTableHeaderCell>
                    <CTableHeaderCell class="text-center ">Faltas</CTableHeaderCell>
                    <CTableHeaderCell class="text-center ">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <!-- CUERPO -->
                <CTableBody>
                  <template v-if="!secciones.length">
                    <CTableRow>
                      <CTableDataCell colspan="6" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
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
                        <CBadge :class="colorEstado('A')">
                          {{ item.t_asistencias }}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge :class="colorEstado('TL')">
                          {{ item.t_tard_leve }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('TM')">
                          {{ item.t_tard_moderado }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('TG')">
                          {{ item.t_tard_grave }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('TE')">
                          {{ item.t_tard_extremo }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('F')">
                          {{ item.t_faltas }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <i class="fas fa-eye text-primary" style="cursor:pointer; font-size:16px"
                          @click="verDetalle(item)"></i>
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>
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
import { meses, colorEstado, colorFijoEstado, ESTADOS_ASISTENCIA } from '@/utils/utils'
import { formatDate } from '@/utils/time'
import { exportarExcel } from '@/utils/exportExcel'
import { textoEstado } from '../../../utils/utils'


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
const list_tard_leve = ref([])
const list_tard_moderado = ref([])
const list_tard_grave = ref([])
const list_tard_extremo = ref([])
const list_faltas = ref([])
const labelsArr = ref([])


const chartData = computed(() => ({
  labels: labelsArr.value,
  datasets: [
    {
      label: textoEstado(ESTADOS_ASISTENCIA.ASISTENCIA),
      data: asistenciasArr.value,
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
      data: list_tard_moderado.value,
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
      data: list_tard_extremo.value,
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
    list_tard_leve.value = []
    list_tard_moderado.value = []
    list_tard_grave.value = []
    list_tard_extremo.value = []
    list_faltas.value = []
    labelsArr.value = []

    // llenar arrays ordenadamente

    asistenciasArr.value = lista.map(item => item.t_asistencias)
    list_tard_leve.value = lista.map(item => item.t_tard_leve)
    list_tard_moderado.value = lista.map(item => item.t_tard_moderado)
    list_tard_grave.value = lista.map(item => item.t_tard_grave)
    list_tard_extremo.value = lista.map(item => item.t_tard_extremo)
    list_faltas.value = lista.map(item => item.t_faltas)
    labelsArr.value = lista.map(item => `${item.grado}-${item.seccion}°`)
  })
  console.log('total asistencias:', asistenciasArr.value)
  console.log('total faltas:', list_faltas.value)
}

const onChangeTipo = () => {
  filtros.value.fecha = ''
}

const verDetalle = (item) => {
  router.push(`/assistances/seguimiento/seccion/${item.grade_section_id}`)
}


const descargarExcel = () => {
  exportarExcel({
    fileName: 'reporte_asistencia.xlsx',
    sheetName: 'Asistencia',
    data: secciones.value,
    columns: [
      {
        header: 'Sección',
        key: 'seccion',
        width: 20,
        formatter: (item) => `${item.grado}° ${item.seccion}`
      },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Asistencias', key: 'asistencias', width: 15 },
      { header: 'Tardanzas', key: 'tardanzas', width: 15 },
      { header: 'Faltas', key: 'faltas', width: 15 }
    ]
  })
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



