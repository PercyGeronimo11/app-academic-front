<template>
  <div class="module-page course-grades-view">
    <ModulePageHeader
      icon="fas fa-chart-bar"
      title="Notas por competencia"
      :subtitle="courseName || 'Consulta de niveles de logro por bimestre'"
    >
      <template #actions>
        <CButton v-if="isTeacher" color="light" variant="outline" class="text-white border-white" @click="goImport">
          <i class="fas fa-file-import me-2"></i>Importar SIAGIE
        </CButton>
        <CButton color="light" variant="ghost" class="text-white" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i>Volver
        </CButton>
      </template>
    </ModulePageHeader>

    <div class="module-filter-bar">
      <div class="flex-grow-1" style="max-width: 280px">
        <CFormLabel for="bimester">Bimestre</CFormLabel>
        <CFormSelect
          id="bimester"
          :model-value="selectedBimesterId"
          @update:model-value="onBimesterChange"
        >
          <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
            {{ item.name }} ({{ item.year }})
          </option>
        </CFormSelect>
      </div>
      <div v-if="students.length" class="text-body-secondary small align-self-end pb-1">
        <i class="fas fa-users me-1"></i>{{ students.length }} alumno(s)
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando notas...
    </div>

    <EmptyState
      v-else-if="!students.length"
      icon="📊"
      title="Sin notas registradas"
      hint="Importe un archivo SIAGIE o seleccione otro bimestre."
    />

    <div v-else class="grades-table-wrap">
      <CTable hover class="mb-0">
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell class="grades-sticky-col">Alumno</CTableHeaderCell>
            <CTableHeaderCell
              v-for="competency in competencies"
              :key="competency.id"
              class="text-center"
            >
              <div class="competency-header">
                <span class="competency-code">{{ competency.number || competency.code }}</span>
                <span class="competency-name">{{ competency.name }}</span>
              </div>
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="student in students" :key="student.student_id">
            <CTableDataCell class="grades-sticky-col">
              <div class="fw-semibold">{{ student.student_name }}</div>
              <div class="small text-body-secondary">DNI {{ student.dni }}</div>
            </CTableDataCell>
            <CTableDataCell
              v-for="competency in student.competencies"
              :key="competency.competency_id"
              class="text-center"
            >
              <ScoreLevelBadge :score="competency.score" />
              <div
                v-if="competency.description || competency.observations"
                class="small text-body-secondary mt-1 obs-text"
              >
                {{ competency.description || competency.observations }}
              </div>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CompetencyScoreService from '@/services/CompetencyScoreService';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';
import ScoreLevelBadge from '@/components/academic/ScoreLevelBadge.vue';

const route = useRoute();
const router = useRouter();

const courseClassId = Number(route.params.courseClass);
const isTeacher = computed(() => route.path.includes('/teacher/'));

const bimesters = ref([]);
const selectedBimesterId = ref(null);
const courseName = ref('');
const competencies = ref([]);
const students = ref([]);
const loading = ref(true);
const loadError = ref('');

const loadBimesters = async () => {
  const response = await CompetencyScoreService.listBimesters();
  bimesters.value = response.data?.data || [];
  if (bimesters.value.length && !selectedBimesterId.value) {
    selectedBimesterId.value = Number(bimesters.value[0].id);
  }
};

const onBimesterChange = async (value) => {
  selectedBimesterId.value = value != null && value !== '' ? Number(value) : null;
  await loadGrades();
};

const loadGrades = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await CompetencyScoreService.listByCourseClass(
      courseClassId,
      selectedBimesterId.value
    );
    if (response.data.success) {
      const data = response.data.data;
      courseName.value = data.course_name;
      competencies.value = data.competencies || [];
      students.value = data.students || [];
    } else {
      loadError.value = response.data.message || 'No se pudieron cargar las notas.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar notas.';
  } finally {
    loading.value = false;
  }
};

const goImport = () => router.push(`/teacher/${courseClassId}/grades/import`);
const goBack = () => router.back();

onMounted(async () => {
  await loadBimesters();
  await loadGrades();
});
</script>

<style scoped>
.competency-header {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 110px;
}

.competency-code {
  font-weight: 700;
  font-size: 0.8rem;
}

.competency-name {
  font-size: 0.68rem;
  font-weight: 400;
  line-height: 1.2;
  opacity: 0.9;
}

.obs-text {
  max-width: 160px;
  margin-inline: auto;
  white-space: normal;
  font-size: 0.72rem;
}
</style>
