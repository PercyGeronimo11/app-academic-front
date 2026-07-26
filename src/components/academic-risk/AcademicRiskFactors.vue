<template>
  <div v-if="!presentedFactors.length" class="risk-detail-empty">
    {{ emptyMessage }}
  </div>
  <div v-else class="risk-factor-list">
    <p v-if="isLowRisk" class="risk-detail-hint mb-3">
      Estos son puntos de vigilancia (no indican necesariamente un problema grave).
    </p>
    <article
      v-for="factor in presentedFactors"
      :key="factor.concept"
      class="risk-factor-card"
    >
      <div class="risk-factor-card__top">
        <div>
          <h6 class="risk-factor-card__title">{{ factor.label }}</h6>
          <p class="risk-factor-card__meta mb-0">{{ factor.valueDescription }}</p>
          <p class="risk-factor-card__influence mb-0">{{ factor.influenceSentence }}</p>
        </div>
        <span class="risk-factor-card__pct">{{ factor.percentLabel }}</span>
      </div>
      <div class="risk-factor-card__bar">
        <span :style="{ width: `${Math.min(100, Number(factor.importance) * 100)}%` }"></span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RISK_LEVELS } from '@/types/academicRisk'
import { presentFactorsForDisplay } from '@/utils/academicRiskPresentation'

const props = defineProps({
  factors: {
    type: Array,
    default: () => [],
  },
  riskLevel: {
    type: Number,
    default: null,
  },
})

const presentedFactors = computed(() => (
  presentFactorsForDisplay(props.factors, props.riskLevel)
))

const isLowRisk = computed(() => (
  props.riskLevel === RISK_LEVELS.VERY_LOW || props.riskLevel === RISK_LEVELS.LOW
))

const emptyMessage = computed(() => (
  isLowRisk.value
    ? 'Sin señales fuertes de riesgo en los factores del modelo.'
    : 'No hay factores registrados.'
))
</script>
