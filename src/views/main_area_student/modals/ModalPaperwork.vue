<template>
  <CModal
    :visible="isOpenModal"
    scrollable
    size="xl"
    alignment="center"
    backdrop="static"
    @close="closeModal"
  >
    <CModalHeader>
      <CModalTitle>
        {{ paperwork ? 'Editar Trámite' : 'Nuevo Trámite' }}
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
