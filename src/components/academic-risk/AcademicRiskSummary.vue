<template>
  <CRow class="mb-3 g-3">
    <CCol sm="6" md="4" lg="2">
      <CCard class="summary-card summary-card--primary shadow-sm border-0 h-100">
        <CCardBody>
          <div class="summary-card__label">Total alumnos</div>
          <div class="summary-card__value">{{ summary.totalStudents }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="6" md="4" lg="2">
      <CCard class="summary-card summary-card--very-low shadow-sm border-0 h-100">
        <CCardBody>
          <div class="summary-card__label">Muy Bajo</div>
          <div class="summary-card__value">{{ summary.veryLow }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="6" md="4" lg="2">
      <CCard class="summary-card summary-card--low shadow-sm border-0 h-100">
        <CCardBody>
          <div class="summary-card__label">Bajo</div>
          <div class="summary-card__value">{{ summary.low }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="6" md="4" lg="2">
      <CCard class="summary-card summary-card--medium shadow-sm border-0 h-100">
        <CCardBody>
          <div class="summary-card__label">Medio</div>
          <div class="summary-card__value">{{ summary.medium }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="6" md="4" lg="2">
      <CCard class="summary-card summary-card--high shadow-sm border-0 h-100">
        <CCardBody>
          <div class="summary-card__label">Alto</div>
          <div class="summary-card__value">{{ summary.high }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol sm="6" md="4" lg="2">
      <CCard class="summary-card summary-card--critical shadow-sm border-0 h-100">
        <CCardBody>
          <div class="summary-card__label">Crítico</div>
          <div class="summary-card__value">{{ summary.critical }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12">
      <CCard class="summary-card summary-card--info shadow-sm border-0">
        <CCardBody class="d-flex flex-column flex-md-row justify-content-between gap-2">
          <div>
            <div class="summary-card__label">Última actualización</div>
            <div class="summary-card__value summary-card__value--sm">
              {{ formatDateTime(summary.lastUpdated) }}
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
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
