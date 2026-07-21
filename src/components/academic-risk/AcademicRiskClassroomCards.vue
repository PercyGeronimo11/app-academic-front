<template>
  <div class="classroom-grid">
    <article
      v-for="item in classrooms"
      :key="item.grade_section_id"
      class="classroom-card"
      :class="`classroom-card--level-${item.semaphore_level || 0}`"
    >
      <header class="classroom-card__header">
        <div>
          <span class="classroom-card__rank">#{{ item.rank }}</span>
          <h5 class="classroom-card__title mb-0">{{ item.label }}</h5>
        </div>
        <span :class="getSemaphoreClass(item.semaphore_level)">{{ item.semaphore_label }}</span>
      </header>

      <div class="classroom-card__metrics">
        <div>
          <span>Alumnos</span>
          <strong>{{ item.total_students }}</strong>
        </div>
        <div>
          <span>Evaluados</span>
          <strong>{{ item.predicted_students }}</strong>
        </div>
        <div>
          <span>Pendientes</span>
          <strong>{{ item.pending_students }}</strong>
        </div>
        <div>
          <span>Alto+Crítico</span>
          <strong>{{ item.high_or_critical }}</strong>
        </div>
      </div>

      <div class="classroom-card__bars">
        <div
          v-for="bar in bars(item)"
          :key="bar.key"
          class="classroom-card__bar"
          :class="bar.className"
          :style="{ width: bar.width }"
          :title="`${bar.label}: ${bar.value}`"
        ></div>
      </div>

      <footer class="classroom-card__footer">
        <span class="small text-body-secondary">
          Actualizado: {{ formatDateTime(item.last_updated) }}
        </span>
        <div class="d-flex gap-2">
          <CButton color="secondary" variant="outline" size="sm" @click="$emit('open-classroom', item)">
            Ver alumnos
          </CButton>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { formatDateTime, getSemaphoreClass } from '@/utils/academicRisk'

defineProps({
  classrooms: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['open-classroom'])

const bars = (item) => {
  const counts = item.risk_counts || {}
  const total = item.predicted_students || 0
  const entries = [
    { key: 'very_low', label: 'Muy bajo', value: counts.very_low || 0, className: 'is-very-low' },
    { key: 'low', label: 'Bajo', value: counts.low || 0, className: 'is-low' },
    { key: 'medium', label: 'Medio', value: counts.medium || 0, className: 'is-medium' },
    { key: 'high', label: 'Alto', value: counts.high || 0, className: 'is-high' },
    { key: 'critical', label: 'Crítico', value: counts.critical || 0, className: 'is-critical' },
  ]
  return entries
    .filter((entry) => entry.value > 0)
    .map((entry) => ({
      ...entry,
      width: total > 0 ? `${(entry.value / total) * 100}%` : '0%',
    }))
}
</script>
