<template>
  <CCard class="shadow-sm border-0 mb-4">
    <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="fw-bold mb-0">
          <i class="fas fa-user-graduate me-2"></i>
          Alumnos{{ classroomLabel ? ` — ${classroomLabel}` : '' }}
        </h6>
        <CBadge color="primary">{{ students.length }}</CBadge>
      </div>
    </CCardHeader>
    <CCardBody class="px-4 pb-4">
      <div v-if="!students.length" class="risk-empty">
        No hay alumnos en esta aula para el filtro seleccionado.
      </div>
      <div v-else class="risk-alert-list">
        <button
          v-for="item in students"
          :key="item.student_id"
          type="button"
          class="risk-alert-item"
          @click="$emit('open-student', item)"
        >
          <div class="risk-alert-item__main">
            <strong>{{ item.full_name }}</strong>
            <span>{{ item.student_code || 'Sin código' }}</span>
          </div>
          <span
            v-if="item.risk_level"
            :class="getRiskChipClass(item.risk_level)"
          >
            {{ item.risk_label || getRiskLabel(item.risk_level) }}
          </span>
          <span v-else class="risk-chip risk-chip--unknown">Pendiente</span>
        </button>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { getRiskChipClass, getRiskLabel } from '@/utils/academicRisk'

defineProps({
  students: {
    type: Array,
    default: () => [],
  },
  classroomLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['open-student'])
</script>
