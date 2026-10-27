<template>
  <CRow class="g-3 mb-4">
    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 risk-alert-card">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-danger">
              <i class="fas fa-bell me-2"></i>
              Top alumnos - Riesgo alto
            </h6>
            <CBadge color="danger">{{ highRiskItems.length }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!highRiskItems.length" class="risk-empty">
            No hay alumnos en riesgo alto o crítico para este filtro.
          </div>
          <div v-else class="risk-alert-list risk-alert-list--scroll">
            <div
              v-for="(item, index) in highRiskItems"
              :key="`high-${item.student_id}`"
              class="risk-alert-item risk-alert-item--static"
            >
              <div class="risk-alert-item__main risk-alert-item__main--ranked">
                <span class="risk-rank-item__rank">#{{ index + 1 }}</span>
                <div>
                  <strong>{{ item.full_name }}</strong>
                  <span class="d-block">{{ item.classroom_label }}</span>
                </div>
              </div>
              <div class="risk-alert-item__side">
                <span :class="getRiskChipClass(item.risk_level)">
                  {{ item.risk_label || getRiskLabel(item.risk_level) }}
                </span>
                <span class="risk-alert-item__conf">{{ formatConfidence(item.confidence) }}</span>
              </div>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 risk-alert-card">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-success">
              <i class="fas fa-user-check me-2"></i>
              Top alumnos - sin riesgo
            </h6>
            <CBadge color="success">{{ lowRiskItems.length }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!lowRiskItems.length" class="risk-empty">
            No hay alumnos con riesgo bajo en este alcance.
          </div>
          <div v-else class="risk-alert-list risk-alert-list--scroll">
            <div
              v-for="(item, index) in lowRiskItems"
              :key="`low-${item.student_id}`"
              class="risk-alert-item risk-alert-item--static"
            >
              <div class="risk-alert-item__main risk-alert-item__main--ranked">
                <span class="risk-rank-item__rank">#{{ index + 1 }}</span>
                <div>
                  <strong>{{ item.full_name }}</strong>
                  <span class="d-block">{{ item.classroom_label }}</span>
                </div>
              </div>
              <div class="risk-alert-item__side">
                <span :class="getRiskChipClass(item.risk_level)">
                  {{ item.risk_label || getRiskLabel(item.risk_level) }}
                </span>
                <span class="risk-alert-item__conf">{{ formatConfidence(item.confidence) }}</span>
              </div>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { computed } from 'vue'
import { formatConfidence, getRiskChipClass, getRiskLabel } from '@/utils/academicRisk'

const props = defineProps({
  alerts: {
    type: Object,
    required: true,
  },
})

const highRiskItems = computed(() => props.alerts?.high_risk || [])
const lowRiskItems = computed(() => props.alerts?.low_risk || [])
</script>
