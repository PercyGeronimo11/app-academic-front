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
                            <label class="form-label" for="paperwork-subject">Asunto</label>
                            <select
                                id="paperwork-subject"
                                class="form-select"
                                :value="form.subject"
                                required
                                @change="onSubjectChange"
                            >
                                <option disabled value="">Seleccione un asunto</option>
                                <option
                                    v-for="option in subjectOptions"
                                    :key="option"
                                    :value="option"
                                >
                                    {{ option }}
                                </option>
                            </select>
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
                    <CRow class="mb-3">
                        <CCol>
                            <CFormInput
                                label="Firma"
                                type="file"
                                accept="image/*"
                                @change="handleSignature"
                            />
                            <div v-if="existingSignatureUrl && !form.signature" class="mt-2 signature-preview">
                                <small class="text-body-secondary d-block mb-1">
                                    Firma actual (se conserva si no sube otra):
                                </small>
                                <img :src="existingSignatureUrl" alt="Firma actual" class="signature-preview__img" />
                            </div>
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
                            helperText="Solo archivos PDF (máximo 5). Al subsanar se recuperan los ya subidos; puede quitarlos, renombrarlos o agregar nuevos."
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

<style scoped>
.signature-preview__img {
  max-height: 90px;
  max-width: 100%;
  border: 1px solid var(--rp-border, #dee2e6);
  border-radius: 0.375rem;
  background: #fff;
  padding: 0.25rem;
  object-fit: contain;
}
</style>

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
  'Solicitud de inasistencia ',
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
const existingSignatureUrl = ref('');

const onSubjectChange = (event) => {
  form.value.subject = event.target.value || '';
};

const resetForm = () => {
  form.value = getEmptyForm();
  files.value = [];
  existingSignatureUrl.value = '';
};

const mapExistingAttachments = (attachments) =>
  (attachments || []).map((doc) => ({
    uid: `server-${doc.id}`,
    serverId: doc.id,
    existing: true,
    file: null,
    name: doc.document_name || 'Documento anexo',
    label: doc.document_name || 'Documento guardado',
    url: doc.url || null,
  }));

const initFormForModal = () => {
  if (props.paperwork) {
    form.value = {
      ...getEmptyForm(),
      id: props.paperwork.id ?? null,
      subject: props.paperwork.subject || '',
      recipient: props.paperwork.recipient || DEFAULT_RECIPIENT,
      reason: props.paperwork.reason || '',
    };
    existingSignatureUrl.value = props.paperwork.signature_url || '';
    files.value = mapExistingAttachments(props.paperwork.attachments);
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

  // Destinatario siempre tiene default; asunto/motivo deben venir del formulario controlado.
  const subject = String(form.value.subject || '').trim();
  const recipient = String(form.value.recipient || DEFAULT_RECIPIENT).trim() || DEFAULT_RECIPIENT;
  const reason = String(form.value.reason || '').trim();

  const missing = [];
  if (!subject) missing.push('asunto');
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

  const missingName = files.value.some((item) => !String(item?.name || '').trim());
  if (files.value.length && missingName) {
    isShowingAlert.value = true;
    await Swal.fire({
      icon: 'warning',
      title: 'Nombre de documento requerido',
      text: 'Indique un nombre para cada documento anexo.',
      confirmButtonText: 'Entendido',
    });
    isShowingAlert.value = false;
    return;
  }

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

    const keepDocuments = [];
    const newDocuments = [];
    files.value.forEach((item) => {
      const name = String(item?.name || '').trim();
      if (item?.existing && item?.serverId) {
        keepDocuments.push({ id: item.serverId, name });
        return;
      }
      const file = item?.file;
      if (file instanceof File) {
        newDocuments.push({ file, name });
      }
    });

    if (isEditMode.value) {
      formData.append('keep_documents_json', JSON.stringify(keepDocuments));
    }

    const documentNames = [];
    newDocuments.forEach((item, index) => {
      formData.append(`documents[${index}]`, item.file);
      formData.append(`document_names[${index}]`, item.name);
      documentNames.push(item.name);
    });
    if (documentNames.length) {
      formData.append('document_names_json', JSON.stringify(documentNames));
    }

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