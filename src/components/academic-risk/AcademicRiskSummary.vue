<template>
  <div class="academic-risk-summary mb-3">
    <div class="academic-risk-summary__grid">
      <CCard class="summary-card summary-card--very-low h-100">
        <CCardBody>
          <div class="summary-card__label">Muy Bajo</div>
          <div class="summary-card__value">{{ summary.veryLow }}</div>
        </CCardBody>
      </CCard>

      <CCard class="summary-card summary-card--low h-100">
        <CCardBody>
          <div class="summary-card__label">Bajo</div>
          <div class="summary-card__value">{{ summary.low }}</div>
        </CCardBody>
      </CCard>

      <CCard class="summary-card summary-card--medium h-100">
        <CCardBody>
          <div class="summary-card__label">Medio</div>
          <div class="summary-card__value">{{ summary.medium }}</div>
        </CCardBody>
      </CCard>

      <CCard class="summary-card summary-card--high h-100">
        <CCardBody>
          <div class="summary-card__label">Alto</div>
          <div class="summary-card__value">{{ summary.high }}</div>
        </CCardBody>
      </CCard>

      <CCard class="summary-card summary-card--critical h-100">
        <CCardBody>
          <div class="summary-card__label">Crítico</div>
          <div class="summary-card__value">{{ summary.critical }}</div>
        </CCardBody>
      </CCard>
    </div>

    <CCard class="summary-card summary-card--info mt-3">
      <CCardBody class="d-flex flex-column flex-md-row justify-content-between gap-2">
        <div>
          <div class="summary-card__label">Última actualización</div>
          <div class="summary-card__value summary-card__value--sm">
            {{ formatDateTime(summary.lastUpdated) }}
          </div>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup>
import { formatDateTime } from '@/utils/academicRisk'

defineProps({
  summary: {
    type: Object,
    required: true,
  },
})
</script>
