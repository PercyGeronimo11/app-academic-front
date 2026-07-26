<template>
  <CModal :visible="visible" size="lg" scrollable @close="$emit('close')">
    <CModalHeader class="border-0 pb-0">
      <CModalTitle>
        <i class="fas fa-file-excel text-success me-2"></i>
        Importar notas SIAGIE del aula
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="module-alert module-alert--info mb-3">
        <i class="fas fa-info-circle me-2"></i>
        Acepta el Excel de SIAGIE (con o sin hoja Parametros). Los alumnos se vinculan solo por
        código de estudiante con el aula seleccionada; el grado/sección del archivo no se valida.
      </div>

      <div class="mb-3">
        <CFormLabel for="bimester-grade">Bimestre</CFormLabel>
        <CFormSelect id="bimester-grade" v-model="selectedBimesterId">
          <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
            {{ item.name }} ({{ item.year }})
          </option>
        </CFormSelect>
      </div>

      <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
      <div v-if="successMessage" class="module-alert module-alert--success">{{ successMessage }}</div>

      <div class="upload-zone">
        <CFormInput
          :key="fileInputKey"
          type="file"
          accept=".xlsx,.xls"
          label="Archivo SIAGIE (.xlsx)"
          @change="onFileChange"
        />
      </div>

      <div v-if="preview" class="mt-3">
        <div class="preview-meta">
          <span v-if="preview.metadata?.bimester_code" class="preview-meta__chip">{{ preview.metadata.bimester_code }}</span>
          <span v-else-if="selectedBimesterLabel" class="preview-meta__chip">{{ selectedBimesterLabel }}</span>
          <span class="preview-meta__chip">{{ preview.metadata?.grade_label }} {{ preview.metadata?.section_label }}</span>
          <span v-if="preview.metadata?.year" class="preview-meta__chip">{{ preview.metadata.year }}</span>
        </div>
        <ul class="list-unstyled mb-0 small">
          <li
            v-for="sheet in preview.sheets"
            :key="sheet.sheet_name"
            class="py-2 border-bottom d-flex justify-content-between gap-2"
          >
            <span><strong>{{ sheet.course_name }}</strong></span>
            <span class="text-body-secondary">{{ sheet.student_count }} alumnos · {{ sheet.competency_count }} comp.</span>
          </li>
        </ul>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="ghost" :disabled="importing" @click="$emit('close')">
        Cerrar
      </CButton>
      <CButton color="secondary" variant="outline" :disabled="!file || previewing" @click="previewFile">
        <i class="fas fa-search me-1"></i>{{ previewing ? 'Analizando...' : 'Vista previa' }}
      </CButton>
      <CButton color="primary" :disabled="!file || importing" @click="importFile">
        <i class="fas fa-file-import me-1"></i>{{ importing ? 'Importando...' : 'Importar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import CompetencyScoreService from '@/services/CompetencyScoreService';
import { pickCurrentBimesterId } from '@/utils/bimester';

const props = defineProps({
  visible: { type: Boolean, default: false },
  gradeSectionId: { type: Number, required: true },
});

const emit = defineEmits(['close', 'imported']);

const bimesters = ref([]);
const selectedBimesterId = ref(null);
const file = ref(null);
const fileInputKey = ref(0);
const preview = ref(null);
const previewing = ref(false);
const importing = ref(false);
const loadError = ref('');
const successMessage = ref('');

const selectedBimesterLabel = computed(() => {
  const item = bimesters.value.find((b) => b.id === selectedBimesterId.value);
  return item ? `${item.name} (${item.year})` : '';
});

const loadBimesters = async () => {
  try {
    const response = await CompetencyScoreService.listBimesters();
    bimesters.value = response.data?.data ?? [];
    selectedBimesterId.value = pickCurrentBimesterId(bimesters.value);
  } catch {
    bimesters.value = [];
  }
};

watch(
  () => props.visible,
  (open) => {
    if (open) {
      file.value = null;
      preview.value = null;
      loadError.value = '';
      successMessage.value = '';
      fileInputKey.value += 1;
      loadBimesters();
    }
  }
);

const onFileChange = (event) => {
  file.value = event.target.files?.[0] || null;
  preview.value = null;
  loadError.value = '';
  successMessage.value = '';
};

const previewFile = async () => {
  if (!file.value) return;
  if (!selectedBimesterId.value) {
    loadError.value = 'Seleccione el bimestre.';
    return;
  }
  previewing.value = true;
  loadError.value = '';
  try {
    const response = await CompetencyScoreService.previewSiagie(file.value, null, selectedBimesterId.value);
    if (response.data.success) {
      preview.value = response.data.data;
    } else {
      loadError.value = response.data.message || 'No se pudo analizar el archivo.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al analizar el archivo.';
  } finally {
    previewing.value = false;
  }
};

const importFile = async () => {
  if (!file.value) return;
  if (!selectedBimesterId.value) {
    loadError.value = 'Seleccione el bimestre.';
    return;
  }
  importing.value = true;
  loadError.value = '';
  successMessage.value = '';
  try {
    const response = await CompetencyScoreService.importSiagieForGradeSection(
      file.value,
      props.gradeSectionId,
      selectedBimesterId.value
    );
    if (response.data.success) {
      successMessage.value = response.data.message;
      emit('imported', response.data.data);
    } else {
      loadError.value = response.data.message || 'No se pudo importar el archivo.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al importar notas.';
  } finally {
    importing.value = false;
  }
};
</script>
