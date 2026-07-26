<template>
  <CModal :visible="visible" size="lg" alignment="center" @close="$emit('close')">
    <CModalHeader>
      <CModalTitle>{{ title }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <p v-if="subtitle" class="text-body-secondary small mb-3">{{ subtitle }}</p>
      <div v-if="!items.length" class="risk-empty">No hay datos para este filtro.</div>
      <div v-else class="risk-rank-list risk-rank-list--modal">
        <div
          v-for="(item, index) in items"
          :key="itemKey(item, index)"
          class="risk-rank-item risk-rank-item--static"
        >
          <div class="risk-rank-item__main">
            <span class="risk-rank-item__rank">#{{ item.rank || index + 1 }}</span>
            <div>
              <strong>{{ primaryText(item) }}</strong>
              <span v-if="secondaryText(item)" class="d-block text-body-secondary small">
                {{ secondaryText(item) }}
              </span>
            </div>
          </div>
          <div class="risk-rank-item__meta">
            <span>{{ metaText(item) }}</span>
          </div>
        </div>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="$emit('close')">Cerrar</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  type: {
    type: String,
    required: true,
    validator: (value) => ['factors', 'recommendations', 'merit', 'punctuality'].includes(value),
  },
})

defineEmits(['close'])

const itemKey = (item, index) => {
  if (props.type === 'factors') return item.factor_name || index
  if (props.type === 'recommendations') return `${item.category}-${item.title}` || index
  return item.student_id || index
}

const primaryText = (item) => {
  if (props.type === 'factors') return item.label || item.factor_name
  if (props.type === 'recommendations') return item.title
  return item.full_name
}

const secondaryText = (item) => {
  if (props.type === 'factors') {
    return `${item.students_affected || 0} alumno(s) · importancia media ${Math.round((item.avg_importance || 0) * 100)}%`
  }
  if (props.type === 'recommendations') {
    return `${item.category_label || item.category || ''} · ${item.students_affected || 0} alumno(s)`
  }
  if (props.type === 'merit') {
    return `${item.classroom_label || ''} · ${item.courses_count || 0} curso(s)`
  }
  return `${item.classroom_label || ''} · ${item.scored_records || 0} registro(s)`
}

const metaText = (item) => {
  if (props.type === 'factors') return `${item.count} veces`
  if (props.type === 'recommendations') return `${item.count} veces`
  if (props.type === 'merit') return `${item.average_label || ''} (${item.average_score})`
  return `${item.average_label || ''} (${item.average_score})`
}
</script>
