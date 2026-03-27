<template>
    <CModal
        :visible="isOpenModal"
        scrollable
        size="xl"
        alignment="center"
        @close="closeModal"
    >
        <CModalHeader>
            <CModalTitle>
                {{ isEditMode ? 'Editar Trámite' : 'Nuevo Trámite' }}
            </CModalTitle>
        </CModalHeader>

        <CModalBody>
            <CForm @submit.prevent="savePaperwork">
                <CContainer>

                    <!-- DATOS PRINCIPALES -->
                    <CRow class="mb-3">
                        <CCol md="4">
                            <CFormInput v-model="form.subject" label="Asunto" required />
                        </CCol>

                        <CCol md="4">
                            <CFormInput v-model="form.recipient" label="Destinatario" required />
                        </CCol>
                    </CRow>

                    <!-- MOTIVO Y OBSERVACIONES -->
                    <CRow class="mb-3">
                        <CCol>
                            <CFormTextarea
                                v-model="form.reason"
                                label="Motivo"
                                rows="3"
                                required
                            />
                        </CCol>
                    </CRow>

                    <!-- FIRMA -->
                    <CRow>
                        
                    </CRow>
                    <CRow class="mb-3">
                        <CCol>
                            <CFormInput
                                label="Firma"
                                type="file"
                                @change="handleSignature"
                            />
                        </CCol>
                    </CRow>

                    <!-- ARCHIVOS -->
                    <CRow class="mb-3">
                        <CCol>
                            <FileDropzone
                            v-model="files"
                            :maxFiles="5"
                            accept=".pdf,application/pdf"
                            label="Documentos anexos (solo PDF)"
                            helperText="Solo archivos PDF (máximo 5). Se incorporarán al final del PDF del trámite."
                            />
                        </CCol>
                    </CRow>

                    <!-- LISTA DE ARCHIVOS -->
                    <CRow v-if="files.length > 0">
                        <CCol>
                            <ul class="list-group">
                                <li 
                                    v-for="(file, index) in files"
                                    :key="index"
                                    class="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    {{ file.name }}
                                    <button 
                                        type="button"
                                        class="btn btn-sm btn-danger"
                                        @click="removeFile(index)"
                                    >
                                        X
                                    </button>
                                </li>
                            </ul>
                        </CCol>
                    </CRow>

                </CContainer>
            </CForm>
        </CModalBody>

        <CModalFooter>
            <CButton color="secondary" @click="closeModal">
                Cancelar
            </CButton>

            <CButton color="primary" @click="savePaperwork">
                {{ isEditMode ? 'Actualizar Trámite' : 'Guardar Trámite' }}
            </CButton>
        </CModalFooter>
    </CModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Swal from 'sweetalert2';
import FileDropzone from '@/components/forms/FileDropzone.vue';

const emit = defineEmits([
  'update:isOpenModal',
  'createPaperwork',
  'updatePaperwork'
]);

const props = defineProps({
  isOpenModal: {
    type: Boolean,
    required: true
  },
  paperwork: {
    type: Object,
    default: null
  }
});

/* -------------------------
   MODO EDICIÓN
--------------------------*/
const isEditMode = computed(() => !!props.paperwork);

/* -------------------------
   FORMULARIO
--------------------------*/
const getEmptyForm = () => ({
  id: null,
  subject: '',
  recipient: '',
  reason: '',
  signature: '',
});

const form = ref(getEmptyForm());
const files = ref([]);

/* -------------------------
   RESET
--------------------------*/
const resetForm = () => {
  form.value = getEmptyForm();
  files.value = [];
};

/* -------------------------
   PRECARGAR DATOS AL EDITAR
--------------------------*/
watch(
  () => props.paperwork,
  (newVal) => {
    if (newVal) {
      form.value = { ...newVal };
      files.value = newVal.files ? [...newVal.files] : [];
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

/* -------------------------
   GUARDAR
--------------------------*/
const savePaperwork = () => {

  if (!form.value.subject || !form.value.recipient) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: 'Complete los campos requeridos.'
    });
    return;
  }

  const formData = new FormData();

  Object.keys(form.value).forEach(key => {
    if (form.value[key] !== null) {
      formData.append(key, form.value[key]);
    }
  });

  files.value.forEach((file) => {
    formData.append('documents[]', file);
  });

  if (isEditMode.value) {
    emit('updatePaperwork', formData);
  } else {
    emit('createPaperwork', formData);
  }

  resetForm();
  closeModal();
};

/* Subir Firma */
const handleSignature = (event) => {
  form.value.signature = event.target.files[0];
};

/* -------------------------
   CERRAR
--------------------------*/
const closeModal = () => {
  emit('update:isOpenModal', false);
};
</script>