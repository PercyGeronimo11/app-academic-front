<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-2 px-3 px-md-4 gap-2">
            <div class="text-center">
              <h5 class="fw-bold text-primary mb-0">
                Reporte total de asistencias
              </h5>
            </div>

            <CButton class="bg-dark w-30 w-md-auto shadow-sm" @click="verDetalle()">
              <i class="fas fa-eye text-white"></i>
              <span class="text-white fw-semibold"> Ver detalle</span>
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <CRow class="g-2 align-items-end">
              <CCol xs="12" md="6">
                <label class="form-label fw-semibold mb-1">Periodo</label>
                <CFormSelect
                  :model-value="periodId"
                  :disabled="loadingFilters"
                  @update:modelValue="onPeriodSelected"
                >
                  <option v-for="p in periods" :key="p.id" :value="p.id">
                    {{ p.name }}{{ p.status ? ' (activo)' : '' }}
                  </option>
                </CFormSelect>
              </CCol>
              <CCol xs="12" md="6">
                <label class="form-label fw-semibold mb-1">Bimestre</label>
                <CFormSelect
                  :model-value="bimesterId"
                  :disabled="loadingFilters || !periodId"
                  @update:modelValue="onBimesterSelected"
                >
                  <option value="">Todo el periodo</option>
                  <option v-for="b in bimesters" :key="b.id" :value="b.id">
                    {{ b.name || `Bimestre ${b.number}` }}
                  </option>
                </CFormSelect>
              </CCol>
            </CRow>
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
              {{ chartTitle }}
            </h5>

            <div style="overflow-x: auto;">
              <div :style="{ minWidth: chartMinWidth, height: '420px' }">
                <CChartBar :data="chartData" :options="chartOptions" :plugins="plugins" />
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
import { CButton, CCard, CCardBody, CFormSelect } from '@coreui/vue'
import { colorEstado } from '@/utils/utils'
import { useAssistancePeriodFilters } from '@/composables/useAssistancePeriodFilters'
import { useAssistanceDashboardChart } from '@/composables/useAssistanceDashboardChart'

const router = useRouter()

const {
  periods,
  bimesters,
  periodId,
  bimesterId,
  loadingFilters,
  queryParams,
  loadFilters,
  onPeriodChange,
} = useAssistancePeriodFilters()

const {
  chart,
  chartTitle,
  chartData,
  chartOptions,
  applyChartFromPayload,
} = useAssistanceDashboardChart()

const data = ref({
  total_registros: 0,
  t_asistencias: 0,
  t_tard_leve: 0,
  t_tard_moderada: 0,
  t_tard_grave: 0,
  t_tard_extrema: 0,
  t_faltas: 0,
})

const chartMinWidth = computed(() => {
  const n = chart.value.labels?.length || 4
  return `${Math.max(480, n * 120)}px`
})

const applyResponse = (payload) => {
  data.value = payload
  applyChartFromPayload(payload)
}

const cargarReporte = async () => {
  const response = await AssistanceService.getReporteGeneralAlumno(queryParams.value)
  applyResponse(response.data)
}

/** Actualiza el valor ANTES de consultar (evita race de v-model + @change). */
const onPeriodSelected = async (value) => {
  periodId.value = value
  await onPeriodChange()
  await cargarReporte()
}

const onBimesterSelected = async (value) => {
  bimesterId.value = value === null || value === undefined ? '' : value
  await cargarReporte()
}

const porcentaje = (valor) => {
  if (!data.value.total_registros) return 0
  return ((valor / data.value.total_registros) * 100).toFixed(1)
}

const plugins = [ChartDataLabels]

const verDetalle = () => {
  router.push(`/assistances/alumno/reporte-detallado`)
}

onMounted(async () => {
  await loadFilters()
  await cargarReporte()
})
</script>