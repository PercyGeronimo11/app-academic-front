<template>
  <div class="p-4 assistance-page">
    <Transition name="save-feedback">
      <div v-if="saveFeedback.visible" class="save-feedback" aria-live="polite">
        <i class="fas fa-check"></i>
        <span>Guardado</span>
      </div>
    </Transition>

    <h2 class="text-2xl font-semibold mb-4">Tomar asistencia</h2>

    <CRow class="g-3 align-items-end mb-4">
      <CCol xs="12" md="4">
        <CFormLabel for="assistance-date">Fecha</CFormLabel>
        <CFormInput
          id="assistance-date"
          v-model="selectedDate"
          type="date"
          @change="fetchAssistances"
        />
      </CCol>
    </CRow>

    <div v-if="loadError" class="alert alert-danger mb-3" role="alert">
      {{ loadError }}
    </div>

    <div v-if="loading" class="text-center text-body-secondary py-4">
      Cargando alumnos...
    </div>

    <div v-else-if="assistances.length > 0">
      <CTable class="border border-gray-200 rounded-lg shadow-lg" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell class="text-center font-semibold">#</CTableHeaderCell>
            <CTableHeaderCell class="text-center font-semibold">Alumno</CTableHeaderCell>
            <CTableHeaderCell class="text-center font-semibold">Origen</CTableHeaderCell>
            <CTableHeaderCell class="text-center font-semibold">Estado</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow
            v-for="(assistance, index) in assistances"
            :key="assistance.student_id ?? assistance.id"
          >
            <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
            <CTableDataCell class="text-start">
              {{ assistance.student_name }}
            </CTableDataCell>
            <CTableDataCell class="text-center">
              <CBadge :color="sourceBadgeColor(assistance.source)">
                {{ sourceLabel(assistance.source) }}
              </CBadge>
            </CTableDataCell>
            <CTableDataCell class="text-center">
              <select
                class="form-select"
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

      <div class="mt-4 flex justify-end">
        <CButton type="button" color="secondary" @click="goToBack">
          Retroceder
        </CButton>
      </div>

      <p class="text-body-secondary small mt-3 mb-0">
        Los cambios se guardan al modificar el estado de cada alumno.
      </p>
    </div>

    <div v-else class="text-center text-body-secondary py-4">
      No hay alumnos en este curso para la fecha seleccionada.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AssistanceService from '../../services/AssistanceService';
import { useRoute, useRouter } from 'vue-router';

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
  { value: 'asistio', label: 'Asistió' },
  { value: 'falto', label: 'Faltó' },
  { value: 'tardanza', label: 'Tardanza' },
  { value: 'falta justificada', label: 'Falta justificada' },
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
  top: calc(4rem + 0.25rem);
  right: 1.25rem;
  z-index: 1020;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: #198754;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(25, 135, 84, 0.35);
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
  min-width: 160px;
  margin: 0 auto;
}

.form-select:disabled {
  opacity: 0.65;
  cursor: wait;
}
</style>
