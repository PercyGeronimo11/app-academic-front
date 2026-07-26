<template>
  <div class="module-page conduct-page">
    <Transition name="save-feedback">
      <div v-if="saveFeedback.visible" class="save-feedback" aria-live="polite">
        <i class="fas fa-check"></i>
        <span>Incidente registrado</span>
      </div>
    </Transition>

    <ModulePageHeader
      icon="fas fa-exclamation-triangle"
      title="Incidentes de conducta"
      :subtitle="courseName || 'Registro y seguimiento por alumno'"
    >
      <template #actions>
        <CButton color="light" variant="ghost" class="text-white" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i>Volver
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <template v-else>
      <h3 class="module-section-title">Alumnos del curso</h3>
      <div class="modern-table-shell mb-4">
        <CTable hover responsive class="mb-0">
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell class="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Alumno</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Incidentes</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Acción</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(student, index) in students" :key="student.student_id">
              <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
              <CTableDataCell class="fw-semibold">{{ student.student_name }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <span
                  class="priority-badge"
                  :class="student.incident_count > 0 ? 'priority-badge--importante' : 'priority-badge--normal'"
                >
                  {{ student.incident_count }}
                </span>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton size="sm" color="primary" @click="openModal(student)">
                  <i class="fas fa-plus me-1"></i>Registrar
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>

      <h3 class="module-section-title">Registros recientes</h3>
      <EmptyState
        v-if="!incidents.length"
        icon="✅"
        title="Sin incidentes registrados"
        hint="Los incidentes que registre en este curso aparecerán aquí."
        compact
      />
      <div v-else class="modern-table-shell mb-4">
        <CTable hover responsive class="mb-0">
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Alumno</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Gravedad</CTableHeaderCell>
              <CTableHeaderCell>Descripción</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="item in incidents" :key="item.id">
              <CTableDataCell>{{ item.incident_date }}</CTableDataCell>
              <CTableDataCell>{{ item.student_name }}</CTableDataCell>
              <CTableDataCell>{{ typeLabel(item.incident_type) }}</CTableDataCell>
              <CTableDataCell>
                <span class="priority-badge" :class="severityBadgeClass(item.severity)">
                  {{ severityLabel(item.severity) }}
                </span>
              </CTableDataCell>
              <CTableDataCell class="small">{{ item.description }}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </template>

    <ModalConductIncident
      :visible="isModalOpen"
      :course-class-id="courseClassId"
      :bimester-id="bimesterId"
      :student-id="selectedStudent?.student_id"
      :student-name="selectedStudent?.student_name"
      @close="closeModal"
      @saved="onIncidentSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConductIncidentService from '@/services/ConductIncidentService';
import ModalConductIncident from './modals/ModalConductIncident.vue';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';

const route = useRoute();
const router = useRouter();

const courseClassId = Number(route.params.courseClass);
const students = ref([]);
const incidents = ref([]);
const courseName = ref('');
const bimesterId = ref(null);
const loading = ref(false);
const loadError = ref('');
const isModalOpen = ref(false);
const selectedStudent = ref(null);
const saveFeedback = ref({ visible: false });
let saveFeedbackTimer = null;

const typeLabels = {
  comportamiento_inadecuado: 'Comportamiento inadecuado',
  agresion: 'Agresión',
  irrespeto: 'Irrespeto',
  uso_celular: 'Uso de celular',
  otro: 'Otro',
};

const severityLabels = {
  leve: 'Leve',
  moderado: 'Moderado',
  grave: 'Grave',
  muy_grave: 'Muy grave',
  critico: 'Crítico',
};

const typeLabel = (v) => typeLabels[v] || v;
const severityLabel = (v) => severityLabels[v] || v;
const severityBadgeClass = (v) => {
  if (v === 'critico' || v === 'muy_grave') return 'priority-badge--urgente';
  if (v === 'grave' || v === 'moderado') return 'priority-badge--importante';
  return 'priority-badge--normal';
};

const fetchData = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const [studentsRes, incidentsRes] = await Promise.all([
      ConductIncidentService.listStudentsByCourse(courseClassId),
      ConductIncidentService.listByCourse(courseClassId),
    ]);

    if (studentsRes.data?.success) {
      students.value = studentsRes.data.data?.students ?? [];
      bimesterId.value = studentsRes.data.data?.bimester_id ?? null;
      courseName.value = studentsRes.data.data?.course_name ?? '';
    }

    if (incidentsRes.data?.success) {
      incidents.value = incidentsRes.data.data ?? [];
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar los datos.';
  } finally {
    loading.value = false;
  }
};

const openModal = (student) => {
  selectedStudent.value = student;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedStudent.value = null;
};

const showSaveFeedback = () => {
  saveFeedback.value.visible = true;
  if (saveFeedbackTimer) clearTimeout(saveFeedbackTimer);
  saveFeedbackTimer = setTimeout(() => {
    saveFeedback.value.visible = false;
  }, 1800);
};

const onIncidentSaved = async () => {
  showSaveFeedback();
  await fetchData();
};

const goBack = () => router.push(`/teacher/${courseClassId}/detalle`);

onMounted(fetchData);
</script>

<style scoped>
.save-feedback {
  position: fixed;
  top: calc(4rem + 0.25rem);
  right: 1.25rem;
  z-index: 1020;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: var(--rp-success-500);
  color: var(--rp-text-on-brand);
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: var(--rp-shadow-sm);
  pointer-events: none;
}

.save-feedback-enter-active,
.save-feedback-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.save-feedback-enter-from,
.save-feedback-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
