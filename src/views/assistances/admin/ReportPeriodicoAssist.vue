<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardHeader class="bg-white border-bottom py-3">
            <h5 class="fw-bold text-primary mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Reporte de asistencias
            </h5>
          </CCardHeader>

          <CCardBody class="py-3 px-3 px-md-4">
            <CRow class="g-3 align-items-end">
              <CCol xs="6" md="3" xl="2">
                <label class="form-label fw-semibold mb-1">Desde</label>
                <CFormInput
                  v-model="filtros.desde"
                  type="date"
                  class="w-100"
                  aria-label="Fecha desde"
                />
              </CCol>

              <CCol xs="6" md="3" xl="2">
                <label class="form-label fw-semibold mb-1">Hasta</label>
                <CFormInput
                  v-model="filtros.hasta"
                  type="date"
                  class="w-100"
                  aria-label="Fecha hasta"
                />
              </CCol>

              <CCol xs="6" md="3" xl="2">
                <label class="form-label fw-semibold mb-1">Aula</label>
                <div ref="aulaMultiRef" class="aula-multi">
                  <button
                    type="button"
                    class="form-select text-start aula-multi__toggle"
                    :aria-expanded="aulaMenuOpen"
                    @click="aulaMenuOpen = !aulaMenuOpen"
                  >
                    {{ aulaSelectionLabel }}
                  </button>
                  <div v-show="aulaMenuOpen" class="aula-multi__menu">
                    <label class="aula-multi__item aula-multi__item--all" @click.prevent="toggleAllAulas">
                      <input
                        type="checkbox"
                        :checked="allAulasSelected"
                        tabindex="-1"
                        readonly
                      />
                      <span>Todas</span>
                    </label>
                    <label
                      v-for="aula in aulasOptions"
                      :key="aula.grade_section_id"
                      class="aula-multi__item"
                    >
                      <input
                        type="checkbox"
                        :value="String(aula.grade_section_id)"
                        v-model="filtros.aula_ids"
                      />
                      <span>{{ aula.grado }}° {{ aula.seccion }}</span>
                    </label>
                    <div v-if="!aulasOptions.length" class="aula-multi__empty">
                      Consulte para cargar aulas
                    </div>
                  </div>
                </div>
              </CCol>

              <CCol xs="6" md="3" xl="2">
                <CButton color="primary" class="w-100" @click="consultarReporte">
                  <i class="fas fa-search me-1"></i>
                  Consultar
                </CButton>
              </CCol>

              <CCol xs="6" md="3" xl="2">
                <CButton color="success" class="text-white w-100" @click="descargarExcel">
                  <i class="fas fa-file-excel me-1"></i>
                  Descargar
                </CButton>
              </CCol>

              <CCol xs="6" md="3" xl="2">
                <CButton color="info" variant="outline" class="w-100" @click="toggleViewMode">
                  <i :class="[viewMode === 'table' ? 'fas fa-chart-bar' : 'fas fa-table', 'me-1']"></i>
                  {{ viewMode === 'table' ? 'Ver gráfico' : 'Ver tabla' }}
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Cards resumen: 2 por fila en móvil -->
    <CRow class="mb-1 g-2">
      <CCol xs="6" lg="3">
        <CCard class="text-white bg-primary shadow h-100 summary-card">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Total Registros</div>
            <div class="summary-card__value">
              {{ data.total_registros }}
              <span class="summary-card__pct">({{ porcentaje(data.total_registros) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('A'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Total Asistencias</div>
            <div class="summary-card__value">
              {{ data.t_asistencias }}
              <span class="summary-card__pct">({{ porcentaje(data.t_asistencias) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TL'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Leves</div>
            <div class="summary-card__value">
              {{ data.t_tard_leve }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_leve) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TM'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Moderadas</div>
            <div class="summary-card__value">
              {{ data.t_tard_moderado }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_moderado) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TG'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Grave</div>
            <div class="summary-card__value">
              {{ data.t_tard_grave }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_grave) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TE'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Extrema</div>
            <div class="summary-card__value">
              {{ data.t_tard_extremo }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_extremo) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('FI'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Total Faltas</div>
            <div class="summary-card__value">
              {{ data.t_faltas }}
              <span class="summary-card__pct">({{ porcentaje(data.t_faltas) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tabla o gráfico (exclusivo) -->
    <CRow class="mb-3 mt-2">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody :class="viewMode === 'table' ? 'p-0' : ''">
            <div v-if="viewMode === 'table'" class="modern-table-shell assist-table-tight">
              <CTable hover responsive align="middle" class="mb-0">
                <CTableHead color="info" class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-white text-start">Aula</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-md-table-cell">Total</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Puntual</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Leve</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Moderada</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Grave</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Extrema</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-lg-none">Tard.</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Faltas</CTableHeaderCell>
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
                        <CBadge :class="colorEstado('FI')" class="assist-badge-sm">{{ item.t_faltas }}</CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>
            </div>

            <div v-else class="report-chart-panel">
              <h5 class="fw-bold text-secondary mb-3 text-center">
                Distribución de asistencias por aula
              </h5>
              <div class="report-chart-scroll">
                <div class="report-chart-inner">
                  <CChartBar
                    :key="`chart-${secciones.length}-${filtros.aula_ids.join(',')}`"
                    :data="chartData"
                    :options="options"
                    :plugins="plugins"
                  />
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import AssistanceService from '@/services/AssistanceService'
import { colorEstado, colorFijoEstado, ESTADOS_ASISTENCIA, textoEstado } from '@/utils/utils'
import { formatDate } from '@/utils/time'
import { exportarExcel } from '@/utils/exportExcel'
import Swal from 'sweetalert2'

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

const resumenFromAulas = (lista, fechas = {}) => ({
  total_registros: lista.reduce((sum, item) => sum + Number(item.total || 0), 0),
  t_asistencias: lista.reduce((sum, item) => sum + Number(item.t_asistencias || 0), 0),
  t_tard_leve: lista.reduce((sum, item) => sum + Number(item.t_tard_leve || 0), 0),
  t_tard_moderado: lista.reduce((sum, item) => sum + Number(item.t_tard_moderado || 0), 0),
  t_tard_grave: lista.reduce((sum, item) => sum + Number(item.t_tard_grave || 0), 0),
  t_tard_extremo: lista.reduce((sum, item) => sum + Number(item.t_tard_extremo || 0), 0),
  t_faltas: lista.reduce((sum, item) => sum + Number(item.t_faltas || 0), 0),
  fecha_inicio: fechas.fecha_inicio || '',
  fecha_fin: fechas.fecha_fin || '',
})

const seccionesAll = ref([])
const dataAll = ref(emptyResumen())
const viewMode = ref('table')
const aulaMenuOpen = ref(false)
const aulaMultiRef = ref(null)

const toISODate = (d) => d.toISOString().split('T')[0]
const today = new Date()
const weekAgo = new Date(today)
weekAgo.setDate(today.getDate() - 6)

const filtros = ref({
  desde: toISODate(weekAgo),
  hasta: toISODate(today),
  aula_ids: [],
})

const aulasOptions = computed(() => seccionesAll.value)

const selectedAulaIds = computed(() =>
  (filtros.value.aula_ids || []).map((id) => String(id)),
)

const allAulasSelected = computed(() => !selectedAulaIds.value.length)

const aulaSelectionLabel = computed(() => {
  const ids = selectedAulaIds.value
  if (!ids.length) return 'Todas'
  if (ids.length === 1) {
    const aula = aulasOptions.value.find((item) => String(item.grade_section_id) === ids[0])
    return aula ? `${aula.grado}° ${aula.seccion}` : '1 aula'
  }
  return `${ids.length} aulas`
})

const toggleAllAulas = () => {
  filtros.value.aula_ids = []
}

const onDocumentClick = (event) => {
  if (!aulaMultiRef.value) return
  if (!aulaMultiRef.value.contains(event.target)) {
    aulaMenuOpen.value = false
  }
}

const secciones = computed(() => {
  const ids = selectedAulaIds.value
  if (!ids.length) return seccionesAll.value
  return seccionesAll.value.filter((item) => ids.includes(String(item.grade_section_id)))
})

const data = computed(() => {
  if (!selectedAulaIds.value.length) return dataAll.value
  return resumenFromAulas(secciones.value, {
    fecha_inicio: dataAll.value.fecha_inicio,
    fecha_fin: dataAll.value.fecha_fin,
  })
})

const chartData = computed(() => {
  const lista = secciones.value
  return {
    labels: lista.map((item) => `${item.grado}° ${item.seccion}`),
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

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'table' ? 'chart' : 'table'
}

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

  AssistanceService.getAsistenciaBySeccion({
    desde: filtros.value.desde,
    hasta: filtros.value.hasta,
  }).then((res) => {
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

    filtros.value.aula_ids = selectedAulaIds.value.filter((id) =>
      lista.some((aula) => String(aula.grade_section_id) === id),
    )
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

const pct = (valor, total) => {
  if (!total) return '0.0%'
  return `${((valor / total) * 100).toFixed(1)}%`
}

const descargarExcel = () => {
  if (!secciones.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin datos',
      text: 'Consulte un reporte con resultados antes de descargar el Excel.',
    })
    return
  }

  const total = data.value.total_registros || 0
  const ids = selectedAulaIds.value
  const aulaLabel = !ids.length
    ? 'Todas'
    : secciones.value.map((item) => `${item.grado}° ${item.seccion}`).join(', ') || 'Aulas seleccionadas'

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
      ['Faltas (FI+FJ)', `${data.value.t_faltas} (${pct(data.value.t_faltas, total)})`],
    ],
    data: secciones.value,
    columns: [
      {
        header: 'Aula',
        key: 'aula',
        width: 14,
        formatter: (item) => `${item.grado}° ${item.seccion}`,
      },
      { header: 'Total', key: 'total', width: 10 },
      {
        header: 'Puntual (A)',
        key: 't_asistencias',
        width: 12,
        formatter: (item) => `${item.t_asistencias} (${pct(item.t_asistencias, item.total)})`,
      },
      {
        header: 'Tardanza leve (TL)',
        key: 't_tard_leve',
        width: 16,
        formatter: (item) => `${item.t_tard_leve} (${pct(item.t_tard_leve, item.total)})`,
      },
      {
        header: 'Tardanza moderada (TM)',
        key: 't_tard_moderado',
        width: 18,
        formatter: (item) => `${item.t_tard_moderado} (${pct(item.t_tard_moderado, item.total)})`,
      },
      {
        header: 'Tardanza grave (TG)',
        key: 't_tard_grave',
        width: 16,
        formatter: (item) => `${item.t_tard_grave} (${pct(item.t_tard_grave, item.total)})`,
      },
      {
        header: 'Tardanza extrema (TE)',
        key: 't_tard_extremo',
        width: 18,
        formatter: (item) => `${item.t_tard_extremo} (${pct(item.t_tard_extremo, item.total)})`,
      },
      {
        header: 'Faltas (FI+FJ)',
        key: 't_faltas',
        width: 12,
        formatter: (item) => `${item.t_faltas} (${pct(item.t_faltas, item.total)})`,
      },
    ],
    summaryRow: {
      aula: 'TOTAL GENERAL',
      total,
      t_asistencias: `${data.value.t_asistencias} (${pct(data.value.t_asistencias, total)})`,
      t_tard_leve: `${data.value.t_tard_leve} (${pct(data.value.t_tard_leve, total)})`,
      t_tard_moderado: `${data.value.t_tard_moderado} (${pct(data.value.t_tard_moderado, total)})`,
      t_tard_grave: `${data.value.t_tard_grave} (${pct(data.value.t_tard_grave, total)})`,
      t_tard_extremo: `${data.value.t_tard_extremo} (${pct(data.value.t_tard_extremo, total)})`,
      t_faltas: `${data.value.t_faltas} (${pct(data.value.t_faltas, total)})`,
    },
  })
}

const porcentaje = (valor) => {
  if (!data.value.total_registros) return 0
  return ((valor / data.value.total_registros) * 100).toFixed(1)
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 16, bottom: 8 },
  },
  plugins: {
    legend: {
      position: 'top',
    },
    datalabels: {
      anchor: 'end',
      align: 'top',
      offset: 2,
      clamp: true,
      font: { size: 10, weight: '600' },
      formatter: (value) => (value ? value : ''),
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        autoSkip: false,
      },
    },
    y: {
      beginAtZero: true,
      grace: '8%',
    },
  },
}

const plugins = [ChartDataLabels]

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  consultarReporte()
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<style scoped>
.aula-multi {
  position: relative;
  width: 100%;
}

.aula-multi__toggle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.aula-multi__menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  min-width: 11rem;
  max-height: 16rem;
  overflow-y: auto;
  background: #fff;
  border: 1px solid var(--cui-border-color, #d8dbe0);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.12);
  padding: 0.35rem 0;
}

.aula-multi__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
}

.aula-multi__item:hover {
  background: rgba(61, 148, 214, 0.08);
}

.aula-multi__item--all {
  font-weight: 600;
  border-bottom: 1px solid var(--cui-border-color, #d8dbe0);
  margin-bottom: 0.15rem;
  padding-bottom: 0.5rem;
}

.aula-multi__empty {
  padding: 0.65rem 0.75rem;
  font-size: 0.8rem;
  color: var(--cui-secondary-color, #6c757d);
}

.report-chart-panel {
  min-height: 36rem;
}

.report-chart-scroll {
  overflow-x: auto;
  width: 100%;
}

.report-chart-inner {
  position: relative;
  min-width: 960px;
  height: 32rem;
  width: 100%;
}

.report-chart-inner :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.summary-card__body {
  padding: 0.75rem 0.85rem;
}

.summary-card__label {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.summary-card__value {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.summary-card__pct {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.85;
}

@media (min-width: 992px) {
  .summary-card__body {
    padding: 1rem 1.15rem;
  }

  .summary-card__label {
    font-size: 0.95rem;
  }

  .summary-card__value {
    font-size: 1.4rem;
  }

  .summary-card__pct {
    font-size: 0.9rem;
  }
}
</style>
