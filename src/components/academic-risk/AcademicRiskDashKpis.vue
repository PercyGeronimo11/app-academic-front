<template>
  <div class="risk-kpis mb-4">
    <CRow class="g-3">
      <CCol xs="12" sm="6" lg="4">
        <div class="risk-kpi risk-kpi--indigo">
          <div class="risk-kpi__icon"><i class="fas fa-user-graduate"></i></div>
          <div>
            <div class="risk-kpi__label">Alumnos evaluados</div>
            <div class="risk-kpi__value">{{ summary.predicted_students }}</div>
            <div class="risk-kpi__hint">de {{ summary.total_students }} totales</div>
          </div>
        </div>
      </CCol>
      <CCol xs="12" sm="6" lg="4">
        <div class="risk-kpi risk-kpi--slate">
          <div class="risk-kpi__icon"><i class="fas fa-hourglass-half"></i></div>
          <div>
            <div class="risk-kpi__label">Sin predicción</div>
            <div class="risk-kpi__value">{{ summary.pending_students }}</div>
            <div class="risk-kpi__hint">Cobertura {{ formatPercent(summary.coverage_percentage) }}</div>
          </div>
        </div>
      </CCol>
      <CCol xs="12" sm="6" lg="4">
        <div class="risk-kpi risk-kpi--alert">
          <div class="risk-kpi__icon"><i class="fas fa-exclamation-circle"></i></div>
          <div>
            <div class="risk-kpi__label">Alto + Crítico</div>
            <div class="risk-kpi__value">{{ summary.high_or_critical }}</div>
            <div class="risk-kpi__hint">{{ formatPercent(summary.high_or_critical_percentage) }} del evaluado</div>
          </div>
        </div>
      </CCol>
    </CRow>

    <CRow class="g-3 mt-1">
      <CCol v-for="item in distribution" :key="item.key" xs="6" md>
        <div class="risk-dist" :class="item.className">
          <span class="risk-dist__label">{{ item.label }}</span>
          <strong class="risk-dist__value">{{ item.value }}</strong>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatPercent } from '@/utils/academicRisk'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const distribution = computed(() => {
  const counts = props.summary.risk_counts || {}
  return [
    { key: 'very_low', label: 'Muy bajo', value: counts.very_low || 0, className: 'risk-dist--very-low' },
    { key: 'low', label: 'Bajo', value: counts.low || 0, className: 'risk-dist--low' },
    { key: 'medium', label: 'Medio', value: counts.medium || 0, className: 'risk-dist--medium' },
    { key: 'high', label: 'Alto', value: counts.high || 0, className: 'risk-dist--high' },
    { key: 'critical', label: 'Crítico', value: counts.critical || 0, className: 'risk-dist--critical' },
  ]
})
</script>
