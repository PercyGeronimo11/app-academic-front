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

            <CRow class="gy-3 align-items-end">

              <CCol xs="12" md="8">
                <div class="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-end">
                  <div class="flex-fill">
                    <label class="form-label fw-semibold mb-1">Desde</label>
                    <CFormInput type="date" v-model="filtros.desde" class="w-100" />
                  </div>
                  <div class="flex-fill">
                    <label class="form-label fw-semibold mb-1">Hasta</label>
                    <CFormInput type="date" v-model="filtros.hasta" class="w-100" />
                  </div>
                  <div class="flex-fill">
                    <label class="form-label fw-semibold mb-1">Aula</label>
                    <CFormSelect v-model="filtros.aula_id" class="w-100">
                      <option value="">Todas</option>
                      <option
                        v-for="aula in aulasOptions"
                        :key="aula.grade_section_id"
                        :value="String(aula.grade_section_id)"
                      >
                        {{ aula.grado }}° {{ aula.seccion }}
                      </option>
                    </CFormSelect>
                  </div>
                  <CButton color="primary" class="w-100 w-md-auto" @click="consultarReporte">
                    <i class="fas fa-search me-1"></i> Consultar
                  </CButton>
                </div>
              </CCol>

              <CCol xs="12" md="4">
                <div class="d-flex flex-column flex-md-row justify-content-md-end gap-2">
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

            <div class="modern-table-shell assist-table-tight">
              <CTable hover align="middle" class="mb-0">
                <CTableHead class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-start">Aula</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-md-table-cell">Total</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Puntual</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Leve</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Moderada</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Grave</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Extrema</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-lg-none">Tard.</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Faltas</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  <template v-if="!secciones.length">
                    <CTableRow>
                      <CTableDataCell colspan="9" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="item in secciones" :key="item.grade_section_id">
                      <CTableDataCell class="fw-semibold text-start">
                        {{ item.grado }}° {{ item.seccion }}
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-none d-md-table-cell">
                        <CBadge color="primary" class="assist-badge-sm">{{ item.total }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado('A')" class="assist-badge-sm">{{ item.t_asistencias }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TL')" class="assist-badge-sm">{{ item.t_tard_leve }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TM')" class="assist-badge-sm">{{ item.t_tard_moderado }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TG')" class="assist-badge-sm">{{ item.t_tard_grave }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TE')" class="assist-badge-sm">{{ item.t_tard_extremo }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-lg-none">
                        <CBadge :class="colorEstado('TM')" class="assist-badge-sm">{{ totalTardanzas(item) }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado('F')" class="assist-badge-sm">{{ item.t_faltas }}</CBadge>
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
import { colorEstado, colorFijoEstado, ESTADOS_ASISTENCIA } from '@/utils/utils'
import { formatDate } from '@/utils/time'
import { exportarExcel } from '@/utils/exportExcel'
import { textoEstado } from '../../../utils/utils'
import Swal from 'sweetalert2'


const router = useRouter()

const emptyResumen = () => ({
  total_registros: 0,
  t_asistencias: 0,
  t_tard_leve: 0,
  t_tard_moderado: 0,
  t_tard_grave: 0,
  t_tard_extremo: 0,
  t_faltas: 0,
  fecha_inicio: '',
  fecha_fin: '',
})

const resumenFromAula = (item, fechas = {}) => ({
  total_registros: Number(item.total || 0),
  t_asistencias: Number(item.t_asistencias || 0),
  t_tard_leve: Number(item.t_tard_leve || 0),
  t_tard_moderado: Number(item.t_tard_moderado || 0),
  t_tard_grave: Number(item.t_tard_grave || 0),
  t_tard_extremo: Number(item.t_tard_extremo || 0),
  t_faltas: Number(item.t_faltas || 0),
  fecha_inicio: fechas.fecha_inicio || '',
  fecha_fin: fechas.fecha_fin || '',
})

const seccionesAll = ref([])
const dataAll = ref(emptyResumen())

const toISODate = (d) => d.toISOString().split('T')[0]
const today = new Date()
const weekAgo = new Date(today)
weekAgo.setDate(today.getDate() - 6)

const filtros = ref({
  desde: toISODate(weekAgo),
  hasta: toISODate(today),
  aula_id: '',
})

const aulasOptions = computed(() => seccionesAll.value)

const secciones = computed(() => {
  if (!filtros.value.aula_id) return seccionesAll.value
  return seccionesAll.value.filter(
    (item) => String(item.grade_section_id) === String(filtros.value.aula_id),
  )
})

const data = computed(() => {
  if (!filtros.value.aula_id) return dataAll.value
  const item = seccionesAll.value.find(
    (aula) => String(aula.grade_section_id) === String(filtros.value.aula_id),
  )
  if (!item) {
    return {
      ...emptyResumen(),
      fecha_inicio: dataAll.value.fecha_inicio,
      fecha_fin: dataAll.value.fecha_fin,
    }
  }
  return resumenFromAula(item, {
    fecha_inicio: dataAll.value.fecha_inicio,
    fecha_fin: dataAll.value.fecha_fin,
  })
})

const chartData = computed(() => {
  const lista = secciones.value
  return {
    labels: lista.map((item) => `${item.grado}-${item.seccion}°`),
    datasets: [
      {
        label: textoEstado(ESTADOS_ASISTENCIA.ASISTENCIA),
        data: lista.map((item) => item.t_asistencias),
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.ASISTENCIA),
        barThickness: 7,
      },
      {
        label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_LEVE),
        data: lista.map((item) => item.t_tard_leve),
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_LEVE),
        barThickness: 7,
      },
      {
        label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA),
        data: lista.map((item) => item.t_tard_moderado),
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA),
        barThickness: 7,
      },
      {
        label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_GRAVE),
        data: lista.map((item) => item.t_tard_grave),
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_GRAVE),
        barThickness: 7,
      },
      {
        label: textoEstado(ESTADOS_ASISTENCIA.TARDANZA_EXTREMA),
        data: lista.map((item) => item.t_tard_extremo),
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_EXTREMA),
        barThickness: 7,
      },
      {
        label: textoEstado(ESTADOS_ASISTENCIA.FALTA),
        data: lista.map((item) => item.t_faltas),
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.FALTA),
        barThickness: 7,
      },
    ],
  }
})

const consultarReporte = () => {
  if (!filtros.value.desde || !filtros.value.hasta) {
    Swal.fire({
      icon: 'warning',
      title: 'Fechas requeridas',
      text: 'Seleccione fecha de inicio y fecha fin.',
    })
    return
  }
  if (filtros.value.hasta < filtros.value.desde) {
    Swal.fire({
      icon: 'warning',
      title: 'Rango inválido',
      text: 'La fecha fin debe ser posterior o igual a la fecha inicio.',
    })
    return
  }

  const params = {
    desde: filtros.value.desde,
    hasta: filtros.value.hasta,
  }

  AssistanceService.getAsistenciaBySeccion(params).then((res) => {
    const lista = res.data.data || []
    seccionesAll.value = lista
    dataAll.value = {
      total_registros: res.data.total_registros || 0,
      t_asistencias: res.data.t_asistencias || 0,
      t_tard_leve: res.data.t_tard_leve || 0,
      t_tard_moderado: res.data.t_tard_moderado || 0,
      t_tard_grave: res.data.t_tard_grave || 0,
      t_tard_extremo: res.data.t_tard_extremo || 0,
      t_faltas: res.data.t_faltas || 0,
      fecha_inicio: res.data.fecha_inicio || '',
      fecha_fin: res.data.fecha_fin || '',
    }

    if (
      filtros.value.aula_id &&
      !lista.some((aula) => String(aula.grade_section_id) === String(filtros.value.aula_id))
    ) {
      filtros.value.aula_id = ''
    }
  }).catch((error) => {
    const message = error.response?.data?.error || 'No se pudo consultar el reporte.'
    Swal.fire({ icon: 'error', title: 'Error', text: message })
  })
}

const totalTardanzas = (item) =>
  Number(item.t_tard_leve || 0) +
  Number(item.t_tard_moderado || 0) +
  Number(item.t_tard_grave || 0) +
  Number(item.t_tard_extremo || 0)

const verDetalle = (item) => {
  router.push(`/assistances/seguimiento/seccion/${item.grade_section_id}`)
}

const pct = (valor, total) => {
  if (!total) return '0.0%'
  return `${((valor / total) * 100).toFixed(1)}%`
}

const descargarExcel = () => {
  if (!secciones.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin datos',
      text: 'Consulte un reporte con resultados antes de descargar el Excel.'
    })
    return
  }

  const total = data.value.total_registros || 0
  const aulaLabel = filtros.value.aula_id
    ? (() => {
        const aula = seccionesAll.value.find(
          (item) => String(item.grade_section_id) === String(filtros.value.aula_id),
        )
        return aula ? `${aula.grado}° ${aula.seccion}` : 'Aula seleccionada'
      })()
    : 'Todas'

  exportarExcel({
    fileName: `reporte_asistencias_${data.value.fecha_inicio}_${data.value.fecha_fin}.xlsx`,
    sheetName: 'Reporte por aula',
    title: 'Reporte de asistencias',
    metaRows: [
      ['Fecha inicio', formatDate(data.value.fecha_inicio)],
      ['Fecha fin', formatDate(data.value.fecha_fin)],
      ['Aula', aulaLabel],
      ['Total registros', total],
      ['Asistencias (A)', `${data.value.t_asistencias} (${pct(data.value.t_asistencias, total)})`],
      ['Tardanza leve (TL)', `${data.value.t_tard_leve} (${pct(data.value.t_tard_leve, total)})`],
      ['Tardanza moderada (TM)', `${data.value.t_tard_moderado} (${pct(data.value.t_tard_moderado, total)})`],
      ['Tardanza grave (TG)', `${data.value.t_tard_grave} (${pct(data.value.t_tard_grave, total)})`],
      ['Tardanza extrema (TE)', `${data.value.t_tard_extremo} (${pct(data.value.t_tard_extremo, total)})`],
      ['Faltas (F)', `${data.value.t_faltas} (${pct(data.value.t_faltas, total)})`]
    ],
    data: secciones.value,
    columns: [
      {
        header: 'Aula',
        key: 'aula',
        width: 14,
        formatter: (item) => `${item.grado}° ${item.seccion}`
      },
      { header: 'Total', key: 'total', width: 10 },
      {
        header: 'Puntual (A)',
        key: 't_asistencias',
        width: 12,
        formatter: (item) => `${item.t_asistencias} (${pct(item.t_asistencias, item.total)})`
      },
      {
        header: 'Tardanza leve (TL)',
        key: 't_tard_leve',
        width: 16,
        formatter: (item) => `${item.t_tard_leve} (${pct(item.t_tard_leve, item.total)})`
      },
      {
        header: 'Tardanza moderada (TM)',
        key: 't_tard_moderado',
        width: 18,
        formatter: (item) => `${item.t_tard_moderado} (${pct(item.t_tard_moderado, item.total)})`
      },
      {
        header: 'Tardanza grave (TG)',
        key: 't_tard_grave',
        width: 16,
        formatter: (item) => `${item.t_tard_grave} (${pct(item.t_tard_grave, item.total)})`
      },
      {
        header: 'Tardanza extrema (TE)',
        key: 't_tard_extremo',
        width: 18,
        formatter: (item) => `${item.t_tard_extremo} (${pct(item.t_tard_extremo, item.total)})`
      },
      {
        header: 'Faltas (F)',
        key: 't_faltas',
        width: 12,
        formatter: (item) => `${item.t_faltas} (${pct(item.t_faltas, item.total)})`
      }
    ],
    summaryRow: {
      aula: 'TOTAL GENERAL',
      total: total,
      t_asistencias: `${data.value.t_asistencias} (${pct(data.value.t_asistencias, total)})`,
      t_tard_leve: `${data.value.t_tard_leve} (${pct(data.value.t_tard_leve, total)})`,
      t_tard_moderado: `${data.value.t_tard_moderado} (${pct(data.value.t_tard_moderado, total)})`,
      t_tard_grave: `${data.value.t_tard_grave} (${pct(data.value.t_tard_grave, total)})`,
      t_tard_extremo: `${data.value.t_tard_extremo} (${pct(data.value.t_tard_extremo, total)})`,
      t_faltas: `${data.value.t_faltas} (${pct(data.value.t_faltas, total)})`
    }
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



