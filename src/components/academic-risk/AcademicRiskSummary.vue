<template>
  <div class="academic-risk-summary mb-4">
    <div class="academic-risk-summary__grid">
      <div
        v-for="item in distribution"
        :key="item.key"
        class="risk-dist"
        :class="item.className"
      >
        <span class="risk-dist__label">{{ item.label }}</span>
        <strong class="risk-dist__value">{{ item.value }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const distribution = computed(() => [
  {
    key: 'very_low',
    label: 'Muy bajo',
    value: props.summary.veryLow || 0,
    className: 'risk-dist--very-low',
  },
  {
    key: 'low',
    label: 'Bajo',
    value: props.summary.low || 0,
    className: 'risk-dist--low',
  },
  {
    key: 'medium',
    label: 'Medio',
    value: props.summary.medium || 0,
    className: 'risk-dist--medium',
  },
  {
    key: 'high',
    label: 'Alto',
    value: props.summary.high || 0,
    className: 'risk-dist--high',
  },
  {
    key: 'critical',
    label: 'Crítico',
    value: props.summary.critical || 0,
    className: 'risk-dist--critical',
  },
])
</script>
