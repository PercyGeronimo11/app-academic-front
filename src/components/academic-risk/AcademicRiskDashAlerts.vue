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
              <span :class="getRiskChipClass(item.risk_level)">
                {{ item.risk_label || getRiskLabel(item.risk_level) }}
              </span>
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 h-100 risk-alert-card">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-primary">
              <i class="fas fa-chalkboard me-2"></i>
              Top aulas (alto / crítico)
            </h6>
            <CBadge color="primary">{{ topClassrooms.length }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!topClassrooms.length" class="risk-empty">
            No hay aulas con alumnos en alto o crítico para este filtro.
          </div>
          <div v-else class="risk-rank-list">
            <button
              v-for="item in topClassrooms"
              :key="item.grade_section_id"
              type="button"
              class="risk-rank-item"
              @click="$emit('open-classroom', item)"
            >
              <div class="risk-rank-item__main">
                <span class="risk-rank-item__rank">#{{ item.rank }}</span>
                <div>
                  <strong>{{ item.label }}</strong>
                  <span class="d-block text-body-secondary small">
                    {{ item.total_students }} alumnos · cobertura {{ formatPercent(item.coverage_percentage) }}
                  </span>
                </div>
              </div>
              <div class="risk-rank-item__meta text-end">
                <div>{{ item.high_or_critical }} alto/crítico</div>
                <span :class="getSemaphoreClass(item.semaphore_level)" class="small">
                  {{ item.semaphore_label }}
                </span>
              </div>
            </button>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { computed } from 'vue'
import {
  formatPercent,
  getRiskChipClass,
  getRiskLabel,
  getSemaphoreClass,
} from '@/utils/academicRisk'

const props = defineProps({
  alerts: {
    type: Object,
    required: true,
  },
  classrooms: {
    type: Array,
    default: () => [],
  },
  previewLimit: {
    type: Number,
    default: 10,
  },
})

defineEmits(['open-student', 'open-classroom'])

const topClassrooms = computed(() => {
  const ranked = [...(props.classrooms || [])]
    .filter((item) => Number(item.high_or_critical || 0) > 0)
    .sort((a, b) => {
      const byCount = Number(b.high_or_critical || 0) - Number(a.high_or_critical || 0)
      if (byCount !== 0) return byCount
      const byPct = Number(b.high_or_critical_percentage || 0) - Number(a.high_or_critical_percentage || 0)
      if (byPct !== 0) return byPct
      return String(a.label || '').localeCompare(String(b.label || ''))
    })
    .slice(0, props.previewLimit)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }))

  return ranked
})
</script>
