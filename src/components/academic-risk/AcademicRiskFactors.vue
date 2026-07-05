<template>
  <div class="academic-risk-factor" v-for="factor in factors" :key="factor.factor_name">
    <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
      <div>
        <div class="fw-semibold">{{ formatFactorName(factor.factor_name) }}</div>
        <small class="text-body-secondary">
          Valor: {{ factor.student_value || '—' }} · Impacto: {{ formatImpactLabel(factor.importance) }}
        </small>
      </div>
      <CBadge color="dark">{{ formatImpactPercent(factor.importance) }}</CBadge>
    </div>
    <CProgress
      thin
      :value="Number(factor.importance) * 100"
      color="primary"
      class="mb-3"
    />
  </div>
</template>

<script setup>
import {
  formatFactorName,
  formatImpactLabel,
  formatImpactPercent,
} from '@/utils/academicRisk'

defineProps({
  factors: {
    type: Array,
    default: () => [],
  },
})
</script>
