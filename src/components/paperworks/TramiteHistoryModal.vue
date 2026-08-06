<template>
  <CModal
    :visible="visible"
    size="lg"
    scrollable
    alignment="center"
    @close="$emit('close')"
  >
    <CModalHeader>
      <CModalTitle>Historial de estados</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <p v-if="contextLabel" class="small text-body-secondary mb-3">
        {{ contextLabel }}
      </p>
      <TramiteHistory :steps="steps" :show-title="false" />
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')">Cerrar</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import TramiteHistory from './TramiteHistory.vue';

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  steps: {
    type: Array,
    default: () => [],
  },
  contextLabel: {
    type: String,
    default: '',
  },
});

defineEmits(['close']);
</script>
