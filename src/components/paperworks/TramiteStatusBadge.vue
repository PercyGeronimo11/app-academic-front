<template>
  <CBadge
    :color="color"
    class="tramite-status-badge text-truncate d-inline-block"
    style="max-width: 100%"
    shape="rounded-pill"
    :title="status"
  >
    {{ shortLabel }}
  </CBadge>
</template>

<script setup>
import { computed } from 'vue';
import { CBadge } from '@coreui/vue';

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
});

const color = computed(() => {
  const s = (props.status || '').toUpperCase();
  if (s.includes('EN REVISION')) return 'info';
  if (s.includes('PENDIENTE')) return 'warning';
  if (s.includes('COMPLETADO')) return 'success';
  if (s.includes('DERIVADO')) return 'info';
  if (s.includes('OBSERVADO')) return 'danger';
  if (s.includes('REVISADO POR MESA')) return 'primary';
  if (s.includes('MESA')) return 'primary';
  return 'secondary';
});

const shortLabel = computed(() => {
  const t = props.status || '—';
  if (t.length <= props.maxLen) return t;
  return `${t.slice(0, props.maxLen - 1)}…`;
});
</script>

<style scoped>
.tramite-status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35em 0.85em;
  letter-spacing: 0.02em;
}
</style>
