<template>
  <CModal
    :visible="isOpenModal"
    scrollable
    size="xl"
    alignment="center"
    backdrop="static"
    @close="closeModal"
  >
    <CModalHeader class="pw-modal__header">
      <CModalTitle class="pw-modal__title">
        <span class="pw-modal__icon" aria-hidden="true">
          <i class="fas fa-file-signature"></i>
        </span>
        <span>
          <span class="pw-modal__kicker">Mesa de partes</span>
          {{ paperwork ? 'Editar trámite' : 'Nuevo trámite' }}
        </span>
      </CModalTitle>
    </CModalHeader>

    <CModalBody>
      <PaperworkForm
        ref="formRef"
        :paperwork="paperwork"
        @create-paperwork="onCreate"
        @update-paperwork="onUpdate"
        @cancel="closeModal"
      />
    </CModalBody>
  </CModal>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import PaperworkForm from '@/components/paperworks/PaperworkForm.vue';

const emit = defineEmits([
  'update:isOpenModal',
  'createPaperwork',
  'updatePaperwork',
]);

const props = defineProps({
  isOpenModal: {
    type: Boolean,
    required: true,
  },
  paperwork: {
    type: Object,
    default: null,
  },
});

const formRef = ref(null);

watch(
  () => props.isOpenModal,
  async (open) => {
    if (open) {
      await nextTick();
      await formRef.value?.prepareForm?.();
    }
  },
);

const closeModal = () => {
  emit('update:isOpenModal', false);
};

const onCreate = (formData) => {
  emit('createPaperwork', formData);
  closeModal();
};

const onUpdate = (formData) => {
  emit('updatePaperwork', formData);
  closeModal();
};
</script>

<style scoped>
.pw-modal__header {
  background: linear-gradient(180deg, var(--rp-surface-brand-soft, #e8f3fb) 0%, #fff 100%);
  border-bottom: 1px solid var(--rp-border, #e2e8f0);
}

.pw-modal__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.pw-modal__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--rp-brand-500, #1d6fad);
  color: #fff;
  flex-shrink: 0;
}

.pw-modal__kicker {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--rp-text-brand, #1d4f91);
}
</style>
