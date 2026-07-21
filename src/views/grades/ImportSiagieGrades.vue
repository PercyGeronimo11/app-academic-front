<template>
  <div class="module-page import-siagie-grades">
    <ModulePageHeader
      icon="fas fa-file-excel"
      title="Importar notas SIAGIE"
      :subtitle="courseName ? `Curso: ${courseName}` : 'Cargue la plantilla RegNotas exportada desde SIAGIE'"
    >
      <template #actions>
        <CButton color="light" variant="outline" class="text-white border-white" @click="goToGrades">
          <i class="fas fa-table me-2"></i>Ver notas
        </CButton>
        <CButton color="light" variant="ghost" class="text-white" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i>Volver
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="successMessage" class="module-alert module-alert--success">{{ successMessage }}</div>

    <div class="module-card mb-4">
      <div class="module-card__header">
        <i class="fas fa-upload me-2"></i>Archivo Excel
      </div>
      <div class="module-card__body">
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <CFormLabel for="bimester">Bimestre</CFormLabel>
            <CFormSelect id="bimester" v-model="selectedBimesterId">
              <option v-for="item in bimesters" :key="item.id" :value="item.id">
                {{ item.name }} ({{ item.year }})
              </option>
            </CFormSelect>
            <p class="small text-body-secondary mt-1 mb-0">
              Requerido si el archivo solo trae la hoja del curso (ej. 063-MATE).
            </p>
          </div>
        </div>

        <div class="upload-zone">
          <CFormInput
            :key="fileInputKey"
            type="file"
            accept=".xlsx,.xls"
            label="Seleccionar archivo SIAGIE (.xlsx)"
            @change="onFileChange"
          />
          <p class="upload-zone__hint mb-0">
            Se toma solo la primera hoja del Excel como notas de este curso (sin importar el nombre de la hoja). Los alumnos se vinculan por código de estudiante (columna «Cód. Estudiante»).
          </p>
        </div>

        <div class="d-flex gap-2 flex-wrap mt-3">
          <CButton color="secondary" variant="outline" :disabled="!file || previewing" @click="previewFile">
            <i class="fas fa-search me-2"></i>{{ previewing ? 'Analizando...' : 'Vista previa' }}
          </CButton>
          <CButton color="primary" :disabled="!file || importing" @click="importFile">
            <i class="fas fa-file-import me-2"></i>{{ importing ? 'Importando...' : 'Importar notas' }}
          </CButton>
        </div>
      </div>
    </div>

    <div v-if="preview" class="module-card mb-4">
      <div class="module-card__header">Vista previa del archivo</div>
      <div class="module-card__body">
        <div class="preview-meta">
          <span v-if="preview.metadata?.bimester_code" class="preview-meta__chip">
            <i class="fas fa-calendar-alt me-1"></i>{{ preview.metadata.bimester_code }}
          </span>
          <span v-else-if="selectedBimesterLabel" class="preview-meta__chip">
            <i class="fas fa-calendar-alt me-1"></i>{{ selectedBimesterLabel }}
          </span>
          <span class="preview-meta__chip">
            <i class="fas fa-school me-1"></i>{{ preview.metadata?.grade_label }} {{ preview.metadata?.section_label }}
          </span>
          <span v-if="preview.metadata?.year" class="preview-meta__chip">
            <i class="fas fa-calendar me-1"></i>{{ preview.metadata.year }}
          </span>
          <span v-if="preview.requires_bimester_selection" class="preview-meta__chip">
            <i class="fas fa-file me-1"></i>Hoja única de curso
          </span>
        </div>

        <div class="modern-table-shell">
          <CTable hover responsive class="mb-0">
            <CTableHead class="modern-table-header">
              <CTableRow>
                <CTableHeaderCell>Hoja</CTableHeaderCell>
                <CTableHeaderCell>Curso</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Competencias</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Alumnos</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Calificativos</CTableHeaderCell>
                <CTableHeaderCell>Coincide</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="sheet in preview.sheets" :key="sheet.sheet_name">
                <CTableDataCell class="small">{{ sheet.sheet_name }}</CTableDataCell>
                <CTableDataCell>{{ sheet.course_name }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ sheet.competency_count }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ sheet.student_count }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ sheet.score_count ?? 0 }}</CTableDataCell>
                <CTableDataCell>
                  <span
                    class="status-badge"
                    :class="sheet.matches_course ? 'status-badge--publicado' : 'status-badge--borrador'"
                  >
                    {{ sheet.matches_course ? 'Sí' : 'No' }}
                  </span>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>

        <div v-if="activeCompetencyMappings.length" class="mt-4">
          <h4 class="module-section-title mb-2">Correspondencia de competencias (Excel → sistema)</h4>
          <div class="modern-table-shell">
            <CTable hover responsive class="mb-0">
              <CTableHead class="modern-table-header">
                <CTableRow>
                  <CTableHeaderCell class="text-center">N° Excel</CTableHeaderCell>
                  <CTableHeaderCell>Competencia en el sistema</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="item in activeCompetencyMappings" :key="item.excel_number">
                  <CTableDataCell class="text-center fw-semibold">{{ item.excel_number }}</CTableDataCell>
                  <CTableDataCell>
                    <span v-if="item.matched">{{ item.competency_name }}</span>
                    <span v-else class="text-body-secondary">Sin competencia registrada con número {{ item.excel_number }}</span>
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <span
                      class="status-badge"
                      :class="item.matched ? 'status-badge--publicado' : 'status-badge--borrador'"
                    >
                      {{ item.matched ? 'Vinculada' : 'Sin match' }}
                    </span>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>

        <div v-if="activeSampleScores.length" class="mt-4">
          <h4 class="module-section-title mb-2">Muestra de calificativos y conclusiones</h4>
          <div class="modern-table-shell">
            <CTable hover responsive class="mb-0">
              <CTableHead class="modern-table-header">
                <CTableRow>
                  <CTableHeaderCell>Alumno</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Comp.</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">NL</CTableHeaderCell>
                  <CTableHeaderCell>Conclusión descriptiva</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <template v-for="sample in activeSampleScores" :key="sample.student_code">
                  <CTableRow v-for="(score, idx) in sample.scores" :key="`${sample.student_code}-${score.competency_number}`">
                    <CTableDataCell v-if="idx === 0" :rowspan="sample.scores.length">
                      <div class="fw-semibold">{{ sample.full_name }}</div>
                      <div class="small text-body-secondary">{{ sample.student_code }}</div>
                    </CTableDataCell>
                    <CTableDataCell class="text-center fw-semibold">{{ score.competency_number }}</CTableDataCell>
                    <CTableDataCell class="text-center">
                      <span class="status-badge status-badge--publicado">{{ score.score }}</span>
                    </CTableDataCell>
                    <CTableDataCell class="small">{{ score.description || '—' }}</CTableDataCell>
                  </CTableRow>
                </template>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </div>
    </div>

    <div v-if="importResult" class="import-result-card mb-4">
      <h3 class="module-section-title mb-3">Resultado de importación</h3>
      <ul class="import-result-card__stats">
        <li class="import-result-card__stat">
          <strong>{{ importResult.students_processed }}</strong>
          <span>Alumnos actualizados</span>
        </li>
        <li class="import-result-card__stat">
          <strong>{{ importResult.imported_scores }}</strong>
          <span>Calificativos guardados</span>
        </li>
        <li class="import-result-card__stat">
          <strong>{{ importResult.bimester_name }}</strong>
          <span>Bimestre</span>
        </li>
      </ul>
      <p v-if="importResult.classroom" class="small text-body-secondary mt-2 mb-0">
        Aula del curso: <strong>{{ importResult.classroom }}</strong>
        <span v-if="importResult.students_in_file != null">
          · Alumnos en el Excel: {{ importResult.students_in_file }}
        </span>
      </p>
      <div v-if="importResult.unmapped_competencies?.length" class="mt-3">
        <p class="text-warning mb-2 fw-semibold small">Competencias del Excel sin vincular</p>
        <p class="small mb-0">
          Los números {{ importResult.unmapped_competencies.join(', ') }} no tienen competencia registrada en este curso.
        </p>
      </div>
      <div v-if="importResult.skipped_students?.length" class="mt-3">
        <p class="text-warning mb-2 fw-semibold small">
          Alumnos omitidos ({{ importResult.skipped_students.length }})
        </p>
        <ul class="small mb-0 ps-3" style="max-height: 180px; overflow: auto">
          <li v-for="item in importResult.skipped_students" :key="item.student_code || item.full_name">
            {{ item.full_name }} (cód. {{ item.student_code }}) — {{ item.reason }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CompetencyScoreService from '@/services/CompetencyScoreService';
import CourseClassService from '@/services/CourseClassService';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';

const route = useRoute();
const router = useRouter();

const courseClassId = Number(route.params.courseClass);
const courseName = ref('');
const bimesters = ref([]);
const selectedBimesterId = ref(null);
const file = ref(null);
const fileInputKey = ref(0);
const preview = ref(null);
const importResult = ref(null);
const previewing = ref(false);
const importing = ref(false);
const loadError = ref('');
const successMessage = ref('');

const selectedBimesterLabel = computed(() => {
  const item = bimesters.value.find((b) => Number(b.id) === Number(selectedBimesterId.value));
  return item ? `${item.name} (${item.year})` : '';
});

const activePreviewSheet = computed(() => {
  const sheets = preview.value?.sheets ?? [];
  return sheets.find((sheet) => sheet.matches_course) || sheets[0] || null;
});

const activeCompetencyMappings = computed(() => activePreviewSheet.value?.competency_mappings ?? []);

const activeSampleScores = computed(() => activePreviewSheet.value?.sample_scores ?? []);

const onFileChange = (event) => {
  file.value = event.target.files?.[0] || null;
  preview.value = null;
  importResult.value = null;
  loadError.value = '';
  successMessage.value = '';
};

const loadCourse = async () => {
  try {
    const response = await CourseClassService.getCourseClass(courseClassId);
    courseName.value = response.data?.data?.course_name || '';
  } catch {
    courseName.value = '';
  }
};

const loadBimesters = async () => {
  try {
    const response = await CompetencyScoreService.listBimesters();
    bimesters.value = response.data?.data ?? [];
    selectedBimesterId.value = bimesters.value[0] ? Number(bimesters.value[0].id) : null;
  } catch {
    bimesters.value = [];
  }
};

const previewFile = async () => {
  if (!file.value) return;
  if (!selectedBimesterId.value) {
    loadError.value = 'Seleccione el bimestre antes de continuar.';
    return;
  }
  previewing.value = true;
  loadError.value = '';
  try {
    const response = await CompetencyScoreService.previewSiagie(
      file.value,
      courseClassId,
      selectedBimesterId.value
    );
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
    loadError.value = 'Seleccione el bimestre antes de importar.';
    return;
  }
  importing.value = true;
  loadError.value = '';
  successMessage.value = '';
  importResult.value = null;
  try {
    const response = await CompetencyScoreService.importSiagieForCourseClass(
      file.value,
      courseClassId,
      selectedBimesterId.value
    );
    if (response.data.success) {
      successMessage.value = response.data.message;
      importResult.value = response.data.data;
      fileInputKey.value += 1;
      file.value = null;
    } else {
      loadError.value = response.data.message || 'No se pudo importar el archivo.';
      importResult.value = response.data.data || null;
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al importar notas.';
    importResult.value = error.response?.data?.data || null;
  } finally {
    importing.value = false;
  }
};

const goToGrades = () => router.push(`/teacher/${courseClassId}/grades`);
const goBack = () => router.back();

onMounted(async () => {
  await Promise.all([loadCourse(), loadBimesters()]);
});
</script>
