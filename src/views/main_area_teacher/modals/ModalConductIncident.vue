<template>
  <CModal
    :visible="visible"
    alignment="center"
    scrollable
    size="lg"
    backdrop="static"
    @close="close"
  >
    <CModalHeader class="border-0 pb-0">
      <CModalTitle>
        <i class="fas fa-exclamation-triangle text-warning me-2"></i>
        Registrar incidente de conducta
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="preview-meta__chip mb-3 d-inline-block">
        <i class="fas fa-user me-1"></i>{{ studentName }}
      </div>
      <CForm>
        <div class="mb-3">
          <CFormLabel for="incident-date">Fecha del incidente</CFormLabel>
          <CFormInput id="incident-date" v-model="form.incident_date" type="date" />
        </div>
        <div class="mb-3">
          <CFormLabel for="incident-type">Tipo de incidente</CFormLabel>
          <select id="incident-type" v-model="form.incident_type" class="form-select">
            <option v-for="opt in incidentTypes" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <CFormLabel for="severity">Gravedad</CFormLabel>
          <select id="severity" v-model="form.severity" class="form-select">
            <option v-for="opt in severities" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <CFormLabel for="description">Descripción *</CFormLabel>
          <CFormTextarea
            id="description"
            v-model="form.description"
            rows="4"
            placeholder="Describa la situación observada..."
          />
        </div>
      </CForm>
      <p v-if="error" class="module-alert module-alert--error small mb-0">{{ error }}</p>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" :disabled="saving" @click="close">Cancelar</CButton>
      <CButton color="primary" :disabled="saving" @click="submit">
        {{ saving ? 'Guardando...' : 'Registrar y notificar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import ConductIncidentService from '@/services/ConductIncidentService';

const props = defineProps({
  visible: { type: Boolean, default: false },
  courseClassId: { type: Number, required: true },
  bimesterId: { type: Number, default: null },
  studentId: { type: Number, default: null },
  studentName: { type: String, default: '' },
});

const emit = defineEmits(['close', 'saved']);

const saving = ref(false);
const error = ref('');

const incidentTypes = [
  { value: 'comportamiento_inadecuado', label: 'Comportamiento inadecuado' },
  { value: 'agresion', label: 'Agresión' },
  { value: 'irrespeto', label: 'Irrespeto' },
  { value: 'uso_celular', label: 'Uso de celular' },
  { value: 'otro', label: 'Otro' },
];

const severities = [
  { value: 'leve', label: '1. Leve' },
  { value: 'moderado', label: '2. Moderado' },
  { value: 'grave', label: '3. Grave' },
  { value: 'muy_grave', label: '4. Muy grave' },
  { value: 'critico', label: '5. Crítico' },
];

const getToday = () => new Date().toISOString().slice(0, 10);

const form = ref({
  incident_date: getToday(),
  incident_type: 'comportamiento_inadecuado',
  severity: 'leve',
  description: '',
});

const resetForm = () => {
  form.value = {
    incident_date: getToday(),
    incident_type: 'comportamiento_inadecuado',
    severity: 'leve',
    description: '',
  };
  error.value = '';
};

watch(
  () => props.visible,
  (open) => {
    if (open) resetForm();
  }
);

const close = () => emit('close');

const submit = async () => {
  if (!props.studentId) return;
  if (!form.value.description || form.value.description.trim().length < 5) {
    error.value = 'La descripción debe tener al menos 5 caracteres.';
    return;
  }

  saving.value = true;
  error.value = '';
  try {
    const payload = {
      course_class_id: props.courseClassId,
      student_id: props.studentId,
      bimester_id: props.bimesterId,
      incident_type: form.value.incident_type,
      severity: form.value.severity,
      description: form.value.description.trim(),
      incident_date: form.value.incident_date,
    };

    const response = await ConductIncidentService.create(payload);
    if (response.data?.success) {
      emit('saved', response.data.data);
      close();
    } else {
      error.value = response.data?.message || 'No se pudo registrar el incidente.';
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al registrar el incidente.';
  } finally {
    saving.value = false;
  }
};
</script>
