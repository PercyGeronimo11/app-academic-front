<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="report-header">
              <div class="report-header__top">
                <h4 class="report-header__title">
                  Reporte total de asistencias
                </h4>
                <CButton
                  color="info"
                  variant="outline"
                  class="report-header__action"
                  @click="$router.back()"
                >
                  <i class="fas fa-arrow-left me-1"></i>
                  Volver
                </CButton>
              </div>

              <div class="report-header__filters">
                <CRow class="g-2 align-items-end">
                  <CCol xs="12" md="6" lg="4">
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
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

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
            <div class="summary-card__label">Asistencias</div>
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
            <div class="summary-card__label">Tardanza Moderada</div>
            <div class="summary-card__value">
              {{ data.t_tard_moderada }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_moderada) }}%)</span>
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
            <div class="summary-card__label">Tardanzas Extremo</div>
            <div class="summary-card__value">
              {{ data.t_tard_extrema }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_extrema) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('FI'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Faltas injustificadas</div>
            <div class="summary-card__value">
              {{ data.t_faltas_injustificadas ?? 0 }}
              <span class="summary-card__pct">({{ porcentaje(data.t_faltas_injustificadas ?? 0) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('FJ'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Faltas justificadas</div>
            <div class="summary-card__value">
              {{ data.t_faltas_justificadas ?? 0 }}
              <span class="summary-card__pct">({{ porcentaje(data.t_faltas_justificadas ?? 0) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3 mt-2">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody>
            <h5 class="fw-bold text-secondary mb-3 text-center">
              {{ chartTitle }}
            </h5>
            <div class="report-chart-scroll">
              <div class="report-chart-inner" :style="{ minWidth: chartMinWidth }">
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
import AssistanceService from '@/services/AssistanceService'
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useRoute } from 'vue-router'
import { colorEstado } from '@/utils/utils'
import { useAssistancePeriodFilters } from '@/composables/useAssistancePeriodFilters'
import { useAssistanceDashboardChart } from '@/composables/useAssistanceDashboardChart'

const route = useRoute()
const idAlumno = route.params.id

const {
  bimesters,
  periodId,
  bimesterId,
  loadingFilters,
  queryParams,
  loadFilters,
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
  t_faltas_injustificadas: 0,
  t_faltas_justificadas: 0,
})

const chartMinWidth = computed(() => {
  const n = chart.value.labels?.length || 4
  return `${Math.max(480, n * 120)}px`
})

const applyResponse = (payload) => {
  data.value = {
    ...data.value,
    ...payload,
  }
  applyChartFromPayload(payload)
}

const cargarReporte = async () => {
  const response = await AssistanceService.getDashboardAlumno(idAlumno, queryParams.value)
  applyResponse(response.data)
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

onMounted(async () => {
  await loadFilters()
  await cargarReporte()
})
</script>

<style scoped>
.report-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--rp-border, var(--cui-border-color, #d8dbe0));
}

.report-header__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--rp-text-brand, var(--cui-primary, #321fdb));
}

.report-header__action {
  flex-shrink: 0;
  min-height: 44px;
}

.report-chart-scroll {
  overflow-x: auto;
  width: 100%;
}

.report-chart-inner {
  position: relative;
  height: 26rem;
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

@media (max-width: 575.98px) {
  .report-header__title {
    font-size: 1.15rem;
  }

  .report-header__action {
    padding-inline: 0.7rem;
    font-size: 0.85rem;
  }

  .summary-card__label {
    font-size: 0.72rem;
  }

  .summary-card__value {
    font-size: 1rem;
  }

  .summary-card__pct {
    font-size: 0.68rem;
  }
}

@media (min-width: 768px) {
  .report-header__title {
    font-size: 1.5rem;
  }

  .report-chart-inner {
    height: 32rem;
  }
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
