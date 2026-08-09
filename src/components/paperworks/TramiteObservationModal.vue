<template>
  <CModal
    :visible="visible"
    size="md"
    alignment="center"
    @close="$emit('close')"
  >
    <CModalHeader>
      <CModalTitle>{{ modalTitle }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="tom-block">
        <p class="tom-label mb-1">{{ actorLabel }}</p>
        <p class="tom-observer mb-0">{{ observerLabel }}</p>
      </div>
      <div class="tom-block tom-block--message mt-3">
        <p class="tom-label mb-2">{{ messageLabel }}</p>
        <p class="tom-message mb-0">{{ messageText }}</p>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')">Cerrar</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: '',
  },
  observations: {
    type: String,
    default: '',
  },
});

defineEmits(['close']);

const statusUpper = computed(() => (props.status || '').toUpperCase());

const isClosedRejected = computed(() =>
  statusUpper.value.includes('NO ADMITIDO') || statusUpper.value.includes('DENEGADO'),
);

const modalTitle = computed(() => {
  if (statusUpper.value.includes('NO ADMITIDO')) return 'Trámite no admitido';
  if (statusUpper.value.includes('DENEGADO')) return 'Trámite denegado';
  return 'Observación del trámite';
});

const actorLabel = computed(() => (isClosedRejected.value ? 'Resuelto por' : 'Observado por'));

const messageLabel = computed(() =>
  (isClosedRejected.value ? 'Motivo' : 'Mensaje de observación'),
);

const observerLabel = computed(() => {
  const s = statusUpper.value;
  if (s.includes('NO ADMITIDO') || (s.includes('MESA') && !s.includes('DIRECTOR'))) {
    return 'Mesa de partes';
  }
  if (s.includes('DENEGADO') || s.includes('DIRECTOR') || s.includes('ADMINISTRACION') || s.includes('ADMINISTRACIÓN')) {
    return 'Administración (Director)';
  }
  return '—';
});

const messageText = computed(
  () => String(props.observations || '').trim() || 'Sin observación registrada.',
);
</script>

<style scoped>
.tom-label {
  font-size: var(--rp-text-2xs, 0.7rem);
  font-weight: var(--rp-weight-semibold, 600);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--rp-text-muted, #6c757d);
}

.tom-observer {
  font-size: var(--rp-text-base, 1rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-heading, #212529);
}

.tom-block--message {
  padding: var(--rp-space-3, 0.75rem);
  border-radius: var(--rp-radius-md, 0.5rem);
  border: 1px solid var(--rp-border, #dee2e6);
  background: var(--rp-surface-muted, #f8f9fa);
}

.tom-message {
  font-size: var(--rp-text-sm, 0.875rem);
  color: var(--rp-text, #343a40);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}
</style>
