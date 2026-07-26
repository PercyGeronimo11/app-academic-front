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
            <CForm :key="formKey" @submit.prevent="savePaperwork">
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
                            <CFormInput v-model="form.recipient" label="Destinatario" required readonly />
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
                            label="Documentos anexos (Maximo 5 archivos PDF)"
                            helperText="Solo archivos PDF (máximo 5). Se incorporarán al final del PDF del trámite."
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
import { useRouter } from 'vue-router';
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

const router = useRouter();

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
const isSaving = ref(false);
/** Fuerza remount del formulario: CFormSelect deja valor visual stale si modelValue es ''. */
const formKey = ref(0);

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

const showGuardianInfoAlert = async () => {
  const missingFields = [];
  if (!guardianData.value.address?.trim()) {
    missingFields.push('dirección del apoderado');
  }
  if (!guardianData.value.phone?.trim()) {
    missingFields.push('teléfono del apoderado');
  }

  isShowingAlert.value = true;
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Actualice su información',
    html: `No puede registrar la solicitud hasta completar su perfil.<br><br>Actualice: <strong>${missingFields.join('</strong> y <strong>')}</strong>.`,
    showCancelButton: true,
    confirmButtonText: 'Entendido',
    cancelButtonText: 'Ir al perfil',
    reverseButtons: true,
  });
  isShowingAlert.value = false;

  if (result.dismiss === Swal.DismissReason.cancel) {
    closeModal();
    router.push('/user/ver-perfil-student');
  }
};

/* -------------------------
   FORMULARIO
--------------------------*/
const DEFAULT_RECIPIENT = 'Director(a) de la I.E.';

const getEmptyForm = () => ({
  id: null,
  subject: '',
  recipient: DEFAULT_RECIPIENT,
  reason: '',
  signature: null,
});

const form = ref(getEmptyForm());
const files = ref([]);

const resetForm = () => {
  form.value = getEmptyForm();
  files.value = [];
};

const initFormForModal = () => {
  if (props.paperwork) {
    form.value = {
      ...getEmptyForm(),
      id: props.paperwork.id ?? null,
      subject: props.paperwork.subject || '',
      recipient: props.paperwork.recipient || DEFAULT_RECIPIENT,
      reason: props.paperwork.reason || '',
    };
    files.value = [];
  } else {
    resetForm();
  }
  formKey.value += 1;
};

watch(
  () => props.isOpenModal,
  async (open) => {
    if (open) {
      initFormForModal();
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
  if (isSaving.value) return;

  const subject = String(form.value.subject || '').trim();
  const recipient = String(form.value.recipient || DEFAULT_RECIPIENT).trim();
  const reason = String(form.value.reason || '').trim();

  const missing = [];
  if (!subject) missing.push('asunto');
  if (!recipient) missing.push('destinatario');
  if (!reason) missing.push('motivo');

  if (missing.length) {
    isShowingAlert.value = true;
    await Swal.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: `Complete: ${missing.join(', ')}.`,
      confirmButtonText: 'Entendido',
    });
    isShowingAlert.value = false;
    return;
  }

  form.value.subject = subject;
  form.value.recipient = recipient;
  form.value.reason = reason;

  isSaving.value = true;
  try {
    await loadGuardianData();

    if (!hasGuardianContactInfo()) {
      await showGuardianInfoAlert();
      return;
    }

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('recipient', recipient);
    formData.append('reason', reason);

    if (form.value.id != null) {
      formData.append('id', String(form.value.id));
    }
    if (form.value.signature instanceof File) {
      formData.append('signature', form.value.signature);
    }

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
  } finally {
    isSaving.value = false;
  }
};

/* Subir Firma */
const handleSignature = (event) => {
  form.value.signature = event.target.files?.[0] || null;
};

/* -------------------------
   CERRAR
--------------------------*/
const closeModal = () => {
  if (isShowingAlert.value) return;
  emit('update:isOpenModal', false);
};
</script>