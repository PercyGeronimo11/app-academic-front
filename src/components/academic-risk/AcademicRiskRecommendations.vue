<template>
  <div v-if="!groupedRecommendations.length" class="text-body-secondary">
    No hay recomendaciones registradas para este estudiante.
  </div>

  <CAccordion v-else always-open>
    <CAccordionItem
      v-for="group in groupedRecommendations"
      :key="group.category"
      :item-key="group.category"
    >
      <CAccordionHeader>
        {{ group.label }}
        <CBadge color="secondary" class="ms-2">{{ group.items.length }}</CBadge>
      </CAccordionHeader>
      <CAccordionBody>
        <div
          v-for="(item, index) in group.items"
          :key="`${group.category}-${index}`"
          class="recommendation-item"
        >
          <div class="d-flex align-items-center gap-2 mb-2">
            <span :class="getPriorityChipClass(item.priority)">
              {{ getPriorityLabel(item.priority) }}
            </span>
            <strong>{{ item.title }}</strong>
          </div>
          <p class="mb-0 text-body-secondary">{{ item.description }}</p>
        </div>
      </CAccordionBody>
    </CAccordionItem>
  </CAccordion>
</template>

<script setup>
import { computed } from 'vue'

import { RECOMMENDATION_CATEGORIES } from '@/types/academicRisk'
import {
  getCategoryLabel,
  getPriorityChipClass,
  getPriorityLabel,
} from '@/utils/academicRisk'

const props = defineProps({
  recommendations: {
    type: Array,
    default: () => [],
  },
})

const CATEGORY_ORDER = [
  RECOMMENDATION_CATEGORIES.ACADEMIC,
  RECOMMENDATION_CATEGORIES.ATTENDANCE,
  RECOMMENDATION_CATEGORIES.BEHAVIOR,
  RECOMMENDATION_CATEGORIES.TUTORING,
  RECOMMENDATION_CATEGORIES.FAMILY,
]

const groupedRecommendations = computed(() => {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    label: getCategoryLabel(category),
    items: props.recommendations.filter((item) => item.category === category),
  }))

  return groups.filter((group) => group.items.length > 0)
})
</script>
