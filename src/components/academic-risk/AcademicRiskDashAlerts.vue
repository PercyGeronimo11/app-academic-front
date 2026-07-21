<template>
  <CRow class="g-3 mb-4">
    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 h-100 risk-alert-card">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-danger">
              <i class="fas fa-bell me-2"></i>
              Riesgo alto / crítico
            </h6>
            <CBadge color="danger">{{ alerts.high_risk_total }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!alerts.high_risk?.length" class="risk-empty">
            No hay alumnos en riesgo alto o crítico para este filtro.
          </div>
          <div v-else class="risk-alert-list">
            <button
              v-for="item in alerts.high_risk"
              :key="`high-${item.student_id}`"
              type="button"
              class="risk-alert-item"
              @click="$emit('open-student', item)"
            >
              <div class="risk-alert-item__main">
                <strong>{{ item.full_name }}</strong>
                <span>{{ item.classroom_label }}</span>
              </div>
              <span :class="getRiskChipClass(item.risk_level)">{{ item.risk_label || getRiskLabel(item.risk_level) }}</span>
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 h-100 risk-alert-card">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0" style="color: #b78103">
              <i class="fas fa-clipboard-list me-2"></i>
              Predicción pendiente
            </h6>
            <CBadge color="warning">{{ alerts.pending_total }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!alerts.pending?.length" class="risk-empty">
            Todos los alumnos del alcance tienen predicción.
          </div>
          <div v-else class="risk-alert-list">
            <button
              v-for="item in alerts.pending"
              :key="`pending-${item.student_id}`"
              type="button"
              class="risk-alert-item"
              @click="$emit('open-student', item)"
            >
              <div class="risk-alert-item__main">
                <strong>{{ item.full_name }}</strong>
                <span>{{ item.classroom_label }}</span>
              </div>
              <span class="risk-chip risk-chip--unknown">Pendiente</span>
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { getRiskChipClass, getRiskLabel } from '@/utils/academicRisk'

defineProps({
  alerts: {
    type: Object,
    required: true,
  },
})

defineEmits(['open-student'])
</script>
