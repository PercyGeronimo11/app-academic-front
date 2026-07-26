<template>
  <div v-if="!displayItems.length" class="risk-detail-empty">
    {{ emptyMessage }}
  </div>

  <div v-else class="risk-rec-list">
    <p v-if="isLowRisk" class="risk-detail-hint mb-3">
      Acciones preventivas o de seguimiento puntual (el riesgo global sigue siendo bajo).
    </p>
    <article
      v-for="(item, index) in displayItems"
      :key="`${item.category}-${index}`"
      class="risk-rec-card"
      :class="`risk-rec-card--${(item.priority || 'medium').toLowerCase()}`"
    >
      <div class="risk-rec-card__top">
        <span class="risk-rec-card__category">{{ getCategoryLabel(item.category) }}</span>
        <span class="risk-rec-card__tone">{{ item.toneLabel }}</span>
      </div>
      <h6 class="risk-rec-card__title">{{ item.title }}</h6>
      <p class="risk-rec-card__desc">{{ item.description }}</p>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RISK_LEVELS } from '@/types/academicRisk'
import { getCategoryLabel } from '@/utils/academicRisk'
import { presentRecommendationsForDisplay } from '@/utils/academicRiskPresentation'

const props = defineProps({
  recommendations: {
    type: Array,
    default: () => [],
  },
  riskLevel: {
    type: Number,
    default: null,
  },
})

const displayItems = computed(() => (
  presentRecommendationsForDisplay(props.recommendations, props.riskLevel)
))

const isLowRisk = computed(() => (
  props.riskLevel === RISK_LEVELS.VERY_LOW || props.riskLevel === RISK_LEVELS.LOW
))

const emptyMessage = computed(() => (
  isLowRisk.value
    ? 'No hay acciones prioritarias. El alumno mantiene un buen perfil.'
    : 'No hay recomendaciones registradas para este estudiante.'
))
</script>
