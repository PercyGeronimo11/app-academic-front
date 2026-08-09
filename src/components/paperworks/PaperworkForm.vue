<template>
  <CForm :key="formKey" @submit.prevent="savePaperwork">
    <CContainer class="px-0">
      <CRow class="mb-3">
        <CCol md="4">
          <label class="form-label" for="paperwork-subject">Asunto</label>
          <select
            id="paperwork-subject"
            v-model="form.subject"
            class="form-select"
            required
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

      <CRow class="mb-3">
        <CCol>
          <FileDropzone
            v-model="files"
            :maxFiles="5"
            accept=".pdf,application/pdf"
            label="Documentos anexos (Maximo 5 archivos PDF)"
            helperText="Solo archivos PDF (máximo 5). Debe indicar un nombre para cada documento. Al subsanar se recuperan los ya subidos; puede quitarlos, renombrarlos o agregar nuevos."
          />
        </CCol>
      </CRow>

      <div class="d-flex flex-wrap gap-2 justify-content-end">
        <CButton type="button" color="secondary" @click="onCancel">
          Cancelar
        </CButton>
        <CButton type="button" color="primary" :disabled="isSaving" @click="savePaperwork">
          {{ isEditMode ? 'Actualizar Trámite' : 'Guardar Trámite' }}
        </CButton>
      </div>
    </CContainer>
  </CForm>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import FileDropzone from '@/components/forms/FileDropzone.vue';
import StudentService from '@/services/StudentService';

const emit = defineEmits(['createPaperwork', 'updatePaperwork', 'cancel']);

const props = defineProps({
  paperwork: {
    type: Object,
    default: null,
  },
  /** Si true, valida perfil al montar (página de registro). En modal se controla al abrir. */
  validateOnMount: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const isEditMode = computed(() => !!props.paperwork);

const SUBJECT_OPTIONS = [
  'Justificación de inasistencia',
  'Solicitud de permiso / retiro anticipado',
  'Solicitud de constancia de estudios',
  'Solicitud de certificado de estudios'
];

/** Incluye el asunto guardado si no está en el catálogo (p. ej. datos antiguos). */
const subjectOptions = computed(() => {
  const current = String(form.value.subject || '').trim();
  if (current && !SUBJECT_OPTIONS.includes(current)) {
    return [current, ...SUBJECT_OPTIONS];
  }
  return SUBJECT_OPTIONS;
});

const resolveSubject = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  const match = SUBJECT_OPTIONS.find(
    (option) => option === value || option.toLowerCase() === value.toLowerCase(),
  );
  return match || value;
};

const isShowingAlert = ref(false);
const isSaving = ref(false);
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
    emit('cancel');
    router.push('/user/ver-perfil-student');
  }
};

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

const initForm = () => {
  if (props.paperwork) {
    form.value = {
      ...getEmptyForm(),
      id: props.paperwork.id ?? null,
      subject: resolveSubject(props.paperwork.subject),
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

const prepareForm = async () => {
  initForm();
  await loadGuardianData();
  if (!hasGuardianContactInfo()) {
    await showGuardianInfoAlert();
  }
};

watch(
  () => props.paperwork,
  () => {
    initForm();
  },
);

onMounted(async () => {
  if (props.validateOnMount) {
    await prepareForm();
  } else {
    initForm();
  }
});

defineExpose({
  prepareForm,
  resetForm,
});

const savePaperwork = async () => {
  if (isSaving.value) return;

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
  } finally {
    isSaving.value = false;
  }
};

const handleSignature = (event) => {
  form.value.signature = event.target.files?.[0] || null;
};

const onCancel = () => {
  if (isShowingAlert.value) return;
  emit('cancel');
};
</script>

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
