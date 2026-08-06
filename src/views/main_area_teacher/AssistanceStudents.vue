<template>
  <div class="module-page assistance-page">
    <Transition name="save-feedback">
      <div v-if="saveFeedback.visible" class="save-feedback" aria-live="polite">
        <i class="fas fa-check"></i>
        <span>Guardado</span>
      </div>
    </Transition>

    <ModulePageHeader
      icon="fas fa-clipboard-check"
      title="Tomar asistencia"
      subtitle="Los cambios se guardan automáticamente al modificar el estado de cada alumno."
    />

    <div class="module-filter-bar">
      <div style="max-width: 280px">
        <CFormLabel for="assistance-date">Fecha</CFormLabel>
        <CFormInput
          id="assistance-date"
          v-model="selectedDate"
          type="date"
          @change="fetchAssistances"
        />
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando alumnos...
    </div>

    <template v-else-if="assistances.length > 0">
      <div class="modern-table-shell">
        <CTable class="mb-0" hover responsive>
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell class="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Alumno</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Origen</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="min-width: 200px">Estado</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow
              v-for="(assistance, index) in assistances"
              :key="assistance.student_id ?? assistance.id"
            >
              <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
              <CTableDataCell class="fw-medium">{{ assistance.student_name }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CBadge :color="sourceBadgeColor(assistance.source)">
                  {{ sourceLabel(assistance.source) }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <select
                  class="form-select form-select-sm"
                  :value="assistance.status"
                  :disabled="isSavingStudent(assistance.student_id)"
                  @change="updateStatus(index, $event.target.value)"
                >
                  <option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>

      <div class="d-flex justify-content-end mt-4">
        <CButton type="button" color="secondary" variant="ghost" @click="goToBack">
          <i class="fas fa-arrow-left me-2"></i>Retroceder
        </CButton>
      </div>
    </template>

    <EmptyState
      v-else
      icon="📋"
      title="Sin alumnos para esta fecha"
      hint="Seleccione otra fecha o verifique que el curso tenga estudiantes matriculados."
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AssistanceService from '../../services/AssistanceService';
import { useRoute, useRouter } from 'vue-router';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';

const route = useRoute();
const router = useRouter();

const assistances = ref([]);
const loading = ref(false);
const loadError = ref('');
const selectedDate = ref(getTodayDate());
const savingStudentIds = ref(new Set());
const saveFeedback = ref({ visible: false });
let saveFeedbackTimer = null;

const statusOptions = [
  { value: 'A', label: 'A — Asistió' },
  { value: 'TL', label: 'TL — Tardanza leve' },
  { value: 'TM', label: 'TM — Tardanza moderada' },
  { value: 'TG', label: 'TG — Tardanza grave' },
  { value: 'TE', label: 'TE — Tardanza extrema' },
  { value: 'FI', label: 'FI — Falta injustificada' },
  { value: 'FJ', label: 'FJ — Falta justificada' },
];

function getTodayDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() / 60;
  const peruOffset = -5;
  date.setHours(date.getHours() - offset + peruOffset);
  return date.toISOString().split('T')[0];
}

const fetchAssistances = async () => {
  if (!selectedDate.value) return;

  loading.value = true;
  loadError.value = '';
  try {
    const courseClassId = Number(route.params.courseClass);
    if (!courseClassId) {
      loadError.value = 'No se identificó el curso. Vuelva al detalle del curso e intente de nuevo.';
      assistances.value = [];
      return;
    }

    const data = {
      course_class_id: courseClassId,
      date_assistance: selectedDate.value,
    };

    const response = await AssistanceService.listAssistancesByDate(data);
    if (!response.data?.success) {
      loadError.value = response.data?.message || 'No se pudo cargar la asistencia.';
      assistances.value = [];
      return;
    }

    const rows = response.data.data;
    assistances.value = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Error al obtener las asistencias:', error);
    loadError.value =
      error.response?.data?.message ||
      'Error al cargar los alumnos. Verifique su sesión e intente de nuevo.';
    assistances.value = [];
  } finally {
    loading.value = false;
  }
};

const isSavingStudent = (studentId) => savingStudentIds.value.has(studentId);

const showSaveFeedback = () => {
  saveFeedback.value.visible = true;
  if (saveFeedbackTimer) {
    clearTimeout(saveFeedbackTimer);
  }
  saveFeedbackTimer = setTimeout(() => {
    saveFeedback.value.visible = false;
  }, 1800);
};

const updateStatus = async (index, selectedStatus) => {
  const row = assistances.value[index];
  const previousStatus = row.status;
  const studentId = row.student_id;

  row.status = selectedStatus;
  row.source = 'teacher';

  savingStudentIds.value = new Set([...savingStudentIds.value, studentId]);

  try {
    const payload = {
      course_class_id: Number(route.params.courseClass),
      date_assistance: selectedDate.value,
      assistances: [
        {
          student_id: studentId,
          status: selectedStatus,
        },
      ],
    };

    const response = await AssistanceService.updateAssistances(payload);
    if (!response.data?.success) {
      row.status = previousStatus;
      loadError.value = response.data?.message || 'No se pudo guardar la asistencia.';
      return;
    }

    loadError.value = '';
    showSaveFeedback();
  } catch (error) {
    console.error('Error al guardar la asistencia:', error);
    row.status = previousStatus;
    loadError.value =
      error.response?.data?.message || 'Error al guardar. Intente de nuevo.';
  } finally {
    const next = new Set(savingStudentIds.value);
    next.delete(studentId);
    savingStudentIds.value = next;
  }
};

const goToBack = () => {
  router.push(`/teacher/${route.params.courseClass}/detalle`);
};

const sourceLabel = (source) => {
  if (source === 'teacher') return 'Docente';
  if (source === 'qr') return 'QR';
  return 'Predeterminado';
};

const sourceBadgeColor = (source) => {
  if (source === 'teacher') return 'success';
  if (source === 'qr') return 'info';
  return 'secondary';
};

onMounted(fetchAssistances);
</script>

<style scoped>
.save-feedback {
  position: fixed;
  top: calc(var(--rp-header-height) + var(--rp-space-1));
  right: var(--rp-space-5);
  z-index: var(--rp-z-sticky);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: var(--rp-radius-pill);
  background: var(--rp-success-500);
  color: var(--rp-text-on-brand);
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: var(--rp-shadow-sm);
  pointer-events: none;
}

.save-feedback i {
  font-size: 0.75rem;
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

.text-start {
  padding-left: 20px;
}

.form-select {
  min-width: 9rem;
  max-width: 100%;
  margin: 0 auto;
}

.form-select:disabled {
  opacity: 0.65;
  cursor: wait;
}
</style>
