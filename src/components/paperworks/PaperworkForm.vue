<template>
  <CForm :key="formKey" class="pw-form" @submit.prevent="savePaperwork">
    <section class="pw-section">
      <header class="pw-section__head">
        <span class="pw-section__icon" aria-hidden="true"><i class="fas fa-file-alt"></i></span>
        <div>
          <h2 class="pw-section__title">Solicitud</h2>
          <p class="pw-section__hint">Indique el asunto y describa el motivo de su trámite.</p>
        </div>
      </header>

      <div class="pw-grid">
        <div class="pw-field">
          <label class="pw-label" for="paperwork-subject">
            <i class="fas fa-tag" aria-hidden="true"></i>
            Asunto
          </label>
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
        </div>

        <div class="pw-lock">
          <span class="pw-label">
            <i class="fas fa-user-tie" aria-hidden="true"></i>
            Destinatario
          </span>
          <strong class="pw-lock__value">
            <i class="fas fa-lock" aria-hidden="true"></i>
            {{ form.recipient || 'Director(a) de la I.E.' }}
          </strong>
        </div>
      </div>

      <div class="pw-field">
        <label class="pw-label" for="paperwork-reason">
          <i class="fas fa-align-left" aria-hidden="true"></i>
          Motivo
        </label>
        <textarea
          id="paperwork-reason"
          v-model="form.reason"
          class="form-control"
          rows="3"
          required
          placeholder="Describa el motivo de la solicitud"
        ></textarea>
      </div>
    </section>

    <section class="pw-section pw-section--soft">
      <header class="pw-section__head">
        <span class="pw-section__icon pw-section__icon--muted" aria-hidden="true">
          <i class="fas fa-id-card"></i>
        </span>
        <div>
          <h2 class="pw-section__title">Apoderado</h2>
          <p class="pw-section__hint">Se toman de su perfil. Para cambiarlos, actualice sus datos personales.</p>
        </div>
      </header>

      <div class="pw-grid">
        <div class="pw-lock">
          <span class="pw-label">
            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
            Dirección del apoderado
          </span>
          <strong class="pw-lock__value">{{ displayGuardianValue(guardianData.address) }}</strong>
        </div>
        <div class="pw-lock">
          <span class="pw-label">
            <i class="fas fa-phone" aria-hidden="true"></i>
            Teléfono del apoderado
          </span>
          <strong class="pw-lock__value">{{ displayGuardianValue(guardianData.phone) }}</strong>
        </div>
      </div>
    </section>

    <section class="pw-section">
      <header class="pw-section__head">
        <span class="pw-section__icon" aria-hidden="true"><i class="fas fa-signature"></i></span>
        <div>
          <h2 class="pw-section__title">Firma</h2>
          <p class="pw-section__hint">
            {{ isEditMode ? 'Si no elige otra imagen, se conserva la firma actual.' : 'Adjunte una imagen de su firma.' }}
          </p>
        </div>
      </header>

      <div class="pw-sign">
        <label class="pw-sign__pick" for="paperwork-signature">
          <i class="fas fa-image" aria-hidden="true"></i>
          <span>{{ signatureLabel }}</span>
        </label>
        <input
          id="paperwork-signature"
          class="pw-sign__input"
          type="file"
          accept="image/*"
          @change="handleSignature"
        />

        <div v-if="existingSignatureUrl && !form.signature" class="pw-sign__preview">
          <span class="pw-sign__caption">Firma actual</span>
          <img :src="existingSignatureUrl" alt="Firma actual" class="pw-sign__img" />
        </div>
      </div>
    </section>

    <section class="pw-section">
      <header class="pw-section__head">
        <span class="pw-section__icon" aria-hidden="true"><i class="fas fa-paperclip"></i></span>
        <div>
          <h2 class="pw-section__title">Documentos anexos</h2>
          <p class="pw-section__hint">Hasta 5 PDF. Cada archivo debe tener un nombre.</p>
        </div>
      </header>

      <FileDropzone
        v-model="files"
        :maxFiles="5"
        accept=".pdf,application/pdf"
        helperText="Solo archivos PDF. Puede quitar, renombrar o agregar documentos."
      />
    </section>

    <div class="pw-actions">
      <CButton type="button" color="secondary" variant="outline" class="pw-actions__btn" @click="onCancel">
        <i class="fas fa-times me-2" aria-hidden="true"></i>
        Cancelar
      </CButton>
      <CButton type="button" color="primary" class="pw-actions__btn" :disabled="isSaving" @click="savePaperwork">
        <i class="fas fa-save me-2" aria-hidden="true"></i>
        {{ isEditMode ? 'Actualizar trámite' : 'Guardar trámite' }}
      </CButton>
    </div>
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

const signatureLabel = computed(() => {
  if (form.value.signature instanceof File) return form.value.signature.name;
  return 'Elegir imagen de la firma';
});

const onCancel = () => {
  if (isShowingAlert.value) return;
  emit('cancel');
};
</script>

<style scoped>
.pw-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.pw-section {
  padding: 0.9rem;
  border: 1px solid var(--rp-border, #e2e8f0);
  border-radius: 0.9rem;
  background: #fff;
}

.pw-section--soft {
  background: var(--rp-surface-muted, #f8fafc);
}

.pw-section__head {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 0.85rem;
}

.pw-section__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.7rem;
  background: var(--rp-brand-500, #1d6fad);
  color: #fff;
  flex-shrink: 0;
}

.pw-section__icon--muted {
  background: var(--rp-surface-brand-soft, #e8f3fb);
  color: var(--rp-text-brand, #1d4f91);
}

.pw-section__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--rp-text-heading, #1e293b);
}

.pw-section__hint {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--rp-text-muted, #64748b);
}

.pw-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.pw-section > .pw-field {
  margin-top: 0.15rem;
}

.pw-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--rp-text-muted, #64748b);
}

.pw-label i {
  color: var(--rp-text-brand, #1d4f91);
}

.pw-lock {
  min-width: 0;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--rp-border, #e2e8f0);
  border-radius: 0.75rem;
  background: #fff;
}

.pw-lock__value {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--rp-text-heading, #1e293b);
  overflow-wrap: anywhere;
}

.pw-lock__value i {
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: var(--rp-text-subtle, #94a3b8);
}

.pw-sign {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pw-sign__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.pw-sign__pick {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  width: 100%;
  padding: 0.55rem 0.85rem;
  border: 1px dashed var(--rp-border-brand, #93c5fd);
  border-radius: 0.75rem;
  background: var(--rp-surface-brand-soft, #f4f8ff);
  color: var(--rp-text-brand, #1d4f91);
  font-weight: 600;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.pw-sign__preview {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.65rem;
  border-radius: 0.75rem;
  background: var(--rp-surface-muted, #f8fafc);
  border: 1px solid var(--rp-border, #e2e8f0);
}

.pw-sign__caption {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--rp-text-muted, #64748b);
}

.pw-sign__img {
  max-height: 96px;
  max-width: 100%;
  object-fit: contain;
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.35rem;
}

.pw-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pw-actions__btn {
  min-height: 44px;
  width: 100%;
}

@media (min-width: 768px) {
  .pw-section {
    padding: 1rem 1.1rem;
  }

  .pw-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  }

  .pw-sign__pick {
    width: auto;
    max-width: 100%;
  }

  .pw-actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .pw-actions__btn {
    width: auto;
    min-width: 10rem;
  }
}
</style>
