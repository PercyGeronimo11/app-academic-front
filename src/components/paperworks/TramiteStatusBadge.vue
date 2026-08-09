<template>
  <CBadge
    :color="color"
    class="tramite-status-badge text-truncate d-inline-flex align-items-center gap-1"
    style="max-width: 100%"
    shape="rounded-pill"
    :title="status"
  >
    <span class="tramite-status-badge__label">{{ shortLabel }}</span>
    <button
      v-if="showObservationEye"
      type="button"
      class="tramite-status-badge__obs"
      title="Ver observación"
      aria-label="Ver observación del trámite"
      @click.stop="$emit('view-observation')"
    >
      <i class="fas fa-comment-dots" aria-hidden="true"></i>
    </button>
  </CBadge>
</template>

<script setup>
import { computed } from 'vue'
import { CBadge } from '@coreui/vue'

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  /** Longitud máxima antes de truncar con … */
  maxLen: {
    type: Number,
    default: 42,
  },
  /** Muestra el ojito para ver la observación (vista estudiante). */
  showObservationEye: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['view-observation'])

const color = computed(() => {
  const s = (props.status || '').toUpperCase()
  if (s.includes('EN REVISION') || s.includes('EN REVISIÓN')) return 'info'
  if (s.includes('PENDIENTE')) return 'warning'
  if (s.includes('COMPLETADO') || s.includes('APROBADO EXITOSAMENTE')) return 'success'
  if (s.includes('DERIVADO')) return 'info'
  if (s.includes('NO ADMITIDO') || s.includes('DENEGADO')) return 'dark'
  if (s.includes('OBSERVADO')) return 'danger'
  if (s.includes('REVISADO POR MESA')) return 'primary'
  if (s.includes('MESA')) return 'primary'
  return 'secondary'
})

const shortLabel = computed(() => {
  const t = props.status || '—'
  if (t.length <= props.maxLen) return t
  return `${t.slice(0, props.maxLen - 1)}…`
})
</script>

<style scoped>
.tramite-status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35em 0.85em;
  letter-spacing: 0.02em;
  max-width: 100%;
}

.tramite-status-badge__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tramite-status-badge__obs {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #b02a37;
  cursor: pointer;
  line-height: 1;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.tramite-status-badge__obs:hover {
  background: #fff;
  transform: scale(1.06);
}

.tramite-status-badge__obs:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 1px;
}

.tramite-status-badge__obs i {
  font-size: 0.72rem;
}
</style>
