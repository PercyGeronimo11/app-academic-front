<template>
  <CModal
    :visible="visible"
    size="xl"
    scrollable
    alignment="center"
    @close="$emit('close')"
  >
    <CModalHeader>
      <CModalTitle>Formulario único de trámites (FUT)</CModalTitle>
    </CModalHeader>
    <CModalBody class="p-0 d-flex flex-column" style="min-height: 75vh">
      <div v-if="observations" class="p-3 border-bottom">
        <CAlert color="warning" class="mb-0">
          <strong class="d-block small text-uppercase mb-1">Observación</strong>
          <span class="small trm-obs">{{ observations }}</span>
        </CAlert>
      </div>
      <div class="position-relative flex-grow-1 d-flex flex-column" style="min-height: 60vh">
        <div
          v-if="loading"
          class="d-flex align-items-center justify-content-center py-5 flex-grow-1"
        >
          <CSpinner color="primary" />
        </div>
        <iframe
          v-else-if="pdfObjectUrl"
          :src="pdfObjectUrl"
          class="w-100 flex-grow-1 border-0"
          style="min-height: 65vh"
          title="Vista previa del FUT en PDF"
        />
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="$emit('close')">Cerrar</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pdfObjectUrl: {
    type: String,
    default: '',
  },
  observations: {
    type: String,
    default: '',
  },
});

defineEmits(['close']);
</script>

<style scoped>
.trm-obs {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
