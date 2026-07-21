<template>
  <CCard class="shadow-sm border-0 mb-4">
    <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4 d-flex justify-content-between align-items-center">
      <h6 class="fw-bold mb-0">
        <i class="fas fa-trophy me-2 text-primary"></i>
        Aulas con mayor concentración de riesgo
      </h6>
      <CButton color="link" class="text-decoration-none" @click="$emit('go-classrooms')">
        Ver todas
      </CButton>
    </CCardHeader>
    <CCardBody class="px-4 pb-4">
      <div v-if="!classrooms.length" class="risk-empty">
        No hay aulas con datos para el bimestre seleccionado.
      </div>
      <div v-else class="risk-rank-list">
        <button
          v-for="item in classrooms"
          :key="item.grade_section_id"
          type="button"
          class="risk-rank-item"
          @click="$emit('open-classroom', item)"
        >
          <div class="risk-rank-item__left">
            <span class="risk-rank-item__rank">#{{ item.rank }}</span>
            <div>
              <strong>{{ item.label }}</strong>
              <div class="small text-body-secondary">
                {{ item.high_or_critical }} en alto/crítico · cobertura {{ formatPercent(item.coverage_percentage) }}
              </div>
            </div>
          </div>
          <div class="risk-rank-item__right">
            <span :class="getSemaphoreClass(item.semaphore_level)">{{ item.semaphore_label }}</span>
            <strong>{{ formatPercent(item.high_or_critical_percentage) }}</strong>
          </div>
        </button>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { formatPercent, getSemaphoreClass } from '@/utils/academicRisk'

defineProps({
  classrooms: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['open-classroom', 'go-classrooms'])
</script>
