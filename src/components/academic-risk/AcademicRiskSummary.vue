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
        <div class="risk-dist__triple">
          <span v-for="n in [1, 2, 3]" :key="`${item.key}-b${n}`" class="risk-dist__bim">
            <small>B{{ n }}</small>
            <strong>{{ item.counts[n] ?? 0 }}</strong>
          </span>
        </div>
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
    counts: props.summary.veryLow || {},
    className: 'risk-dist--very-low',
  },
  {
    key: 'low',
    label: 'Bajo',
    counts: props.summary.low || {},
    className: 'risk-dist--low',
  },
  {
    key: 'medium',
    label: 'Medio',
    counts: props.summary.medium || {},
    className: 'risk-dist--medium',
  },
  {
    key: 'high',
    label: 'Alto',
    counts: props.summary.high || {},
    className: 'risk-dist--high',
  },
  {
    key: 'critical',
    label: 'Crítico',
    counts: props.summary.critical || {},
    className: 'risk-dist--critical',
  },
])
</script>

<style scoped>
.risk-dist__triple {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.risk-dist__bim {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.25rem;
  line-height: 1.15;
}

.risk-dist__bim small {
  font-size: 0.65rem;
  opacity: 0.85;
  font-weight: 600;
}

.risk-dist__bim strong {
  font-size: 1.05rem;
}
</style>
