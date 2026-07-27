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
                {{ isEditMode ? 'Editar Trámite' : 'Nuevo Trámite' }}
            </CModalTitle>
        </CModalHeader>

        <CModalBody>
            <CForm @submit.prevent="savePaperwork">
                <CContainer>

                    <!-- DATOS PRINCIPALES -->
                    <CRow class="mb-3">
                        <CCol md="4">
                            <CFormSelect
                                v-model="form.subject"
                                label="Asunto"
                                required
                            >
                                <option disabled value="">Seleccione un asunto</option>
                                <option
                                    v-if="form.subject && !subjectOptions.includes(form.subject)"
                                    :value="form.subject"
                                >
                                    {{ form.subject }}
                                </option>
                                <option
                                    v-for="option in subjectOptions"
                                    :key="option"
                                    :value="option"
                                >
                                    {{ option }}
                                </option>
                            </CFormSelect>
                        </CCol>

                        <CCol md="4">
                            <CFormInput v-model="form.recipient" label="Destinatario" required disabled />
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

                    <!-- DATOS DEL APODERADO -->
                    <CRow class="mb-3">
                        <CCol md="8">
                            <CFormInput
                                :model-value="displayGuardianValue(guardianData.address)"
                                label="Dirección del apoderado"
                                readonly
                            />
                        </CCol>
                        <CCol md="4">
                            <CFormInput
                                :model-value="displayGuardianValue(guardianData.phone)"
                                label="Teléfono del apoderado"
                                readonly
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
                            helperText="Solo archivos PDF (máximo 5). Asigne un nombre a cada documento; aparecerá en la sección VI del PDF."
                            />
                        </CCol>
                    </CRow>

                </CContainer>
            </CForm>
        </CModalBody>

        <CModalFooter>
            <CButton type="button" color="secondary" @click="closeModal">
                Cancelar
            </CButton>

            <CButton type="button" color="primary" @click="savePaperwork">
                {{ isEditMode ? 'Actualizar Trámite' : 'Guardar Trámite' }}
            </CButton>
        </CModalFooter>
    </CModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Swal from 'sweetalert2';
import FileDropzone from '@/components/forms/FileDropzone.vue';
import StudentService from '@/services/StudentService';

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

const subjectOptions = [
  'Solicitud de permiso de inasistencia',
  'Solicitud de retiro anticipado',
  'Solicitud de constancia de estudios',
  'Solicitud de certificado de estudios',
  'Solicitud de copia de libreta de notas',
];

const isShowingAlert = ref(false);

const guardianData = ref({
  address: '',
  phone: '',
});

const displayGuardianValue = (value) => value?.trim() || 'No registrado';

const hasGuardianContactInfo = () =>
  !!guardianData.value.address?.trim() && !!guardianData.value.phone?.trim();

const loadGuardianData = async () => {
  try {
    const response = await StudentService.getProfile();
    const student = response.data?.data;

    guardianData.value = {
      address: student?.address?.trim() || '',
      phone: student?.representative_phone?.trim() || '',
    };
  } catch {
    guardianData.value = { address: '', phone: '' };
  }
};

const showGuardianInfoAlert = () => {
  const missingFields = [];
  if (!guardianData.value.address?.trim()) {
    missingFields.push('dirección del apoderado');
  }
  if (!guardianData.value.phone?.trim()) {
    missingFields.push('teléfono del apoderado');
  }

  isShowingAlert.value = true;
  Swal.fire({
    icon: 'warning',
    title: 'Actualice su información',
    html: `No puede registrar la solicitud hasta completar su perfil.<br><br>Actualice: <strong>${missingFields.join('</strong> y <strong>')}</strong>.`,
    confirmButtonText: 'Entendido',
  }).finally(() => {
    isShowingAlert.value = false;
  });
};

/* -------------------------
   FORMULARIO
--------------------------*/
const getEmptyForm = () => ({
  id: null,
  subject: '',
  recipient: 'Director(a) de la I.E.',
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

watch(
  () => props.isOpenModal,
  async (open) => {
    if (open) {
      await loadGuardianData();
      if (!hasGuardianContactInfo()) {
        showGuardianInfoAlert();
      }
    }
  }
);

/* -------------------------
   GUARDAR
--------------------------*/
const savePaperwork = async () => {
  if (!form.value.subject || !form.value.recipient || !form.value.reason?.trim()) {
    isShowingAlert.value = true;
    Swal.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: 'Complete los campos requeridos.',
    }).finally(() => {
      isShowingAlert.value = false;
    });
    return;
  }

  await loadGuardianData();

  if (!hasGuardianContactInfo()) {
    showGuardianInfoAlert();
    return;
  }

  const formData = new FormData();

  Object.keys(form.value).forEach(key => {
    if (form.value[key] !== null) {
      formData.append(key, form.value[key]);
    }
  });

  const missingName = files.value.some((item) => !String(item?.name || '').trim());
  if (files.value.length && missingName) {
    isShowingAlert.value = true;
    Swal.fire({
      icon: 'warning',
      title: 'Nombre de documento requerido',
      text: 'Indique un nombre para cada documento anexo.',
    }).finally(() => {
      isShowingAlert.value = false;
    });
    return;
  }

  files.value.forEach((item) => {
    const file = item?.file || item;
    const name = String(item?.name || '').trim();
    formData.append('documents[]', file);
    formData.append('document_names[]', name);
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
  if (isShowingAlert.value) return;
  emit('update:isOpenModal', false);
};
</script>