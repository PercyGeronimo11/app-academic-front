<template>
  <div class="assistance-page">
    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando alumnos...
    </div>

    <EmptyState
      v-else-if="emptyTitle"
      icon="📋"
      :title="emptyTitle"
      :hint="emptyHint"
    />

    <template v-else-if="assistances.length > 0">
      <div class="modern-table-shell mb-4">
        <CTable class="mb-0" hover responsive>
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell class="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Alumno</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Origen</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow
              v-for="(assistance, index) in pagedAssistances"
              :key="assistance.student_id ?? assistance.id"
            >
              <CTableDataCell class="text-center">
                {{ rowNumber(index) }}
              </CTableDataCell>
              <CTableDataCell>
                <div class="student-name">
                  <span class="student-name__surnames">{{ studentSurnames(assistance) }}</span>
                  <span class="student-name__given">{{ studentGivenName(assistance) }}</span>
                </div>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <span class="status-pill" :class="sourcePillClass(rowSource(assistance))">
                  {{ sourceLabel(rowSource(assistance)) }}
                </span>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <button
                  type="button"
                  class="attendance-status"
                  :class="
                    assistance.status === 'A'
                      ? 'attendance-status--present'
                      : 'attendance-status--absent'
                  "
                  :disabled="!canEdit || saving"
                  :title="canEdit ? 'Clic para cambiar estado' : 'Solo lectura'"
                  @click="toggleStatus(assistance)"
                >
                  <strong class="attendance-status__code">{{ assistance.status }}</strong>
                  <span class="attendance-status__label">
                    {{ assistance.status === 'A' ? 'Asistió' : 'Faltó' }}
                  </span>
                </button>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>

        <TablePagination
          v-model="page"
          :total="assistances.length"
          :page-size="pageSize"
          aria-label="Paginación de asistencia del curso"
        />
      </div>

      <p v-if="dirtyCount" class="assistance-dirty mb-0">
        {{ dirtyCount }} cambio(s) pendiente(s)
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import EmptyState from '@/components/academic/EmptyState.vue'
import TablePagination from '@/components/academic/TablePagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { toastError, toastSuccess } from '@/utils/alerts'

const route = useRoute()

const assistanceDate = inject('assistanceDate', ref(getTodayDate()))
const assistanceScheduleLabel = inject('assistanceScheduleLabel', ref(''))
const assistanceCanUpdate = inject('assistanceCanUpdate', ref(false))
const assistanceSaving = inject('assistanceSaving', ref(false))
const assistanceSaveSignal = inject('assistanceSaveSignal', ref(0))
const setCourseStudentsCount = inject('setCourseStudentsCount', null)

const assistances = ref([])
const meta = ref({
  has_schedule: false,
  is_class_day: false,
  can_edit: false,
  schedule_slots: [],
  reason: null,
  message: null,
})
const loading = ref(false)
const loadError = ref('')

const { page, pageSize, pagedItems: pagedAssistances } = useClientPagination(assistances, 15)

const canEdit = computed(() => Boolean(meta.value.can_edit))
const saving = computed({
  get: () => Boolean(assistanceSaving.value),
  set: (value) => {
    assistanceSaving.value = Boolean(value)
  },
})

const dirtyCount = computed(
  () => assistances.value.filter((row) => row.status !== row._initialStatus).length
)

const emptyTitle = computed(() => {
  if (loading.value || assistances.value.length) return ''
  if (meta.value.reason === 'no_schedule') return 'Sin horario configurado'
  if (meta.value.reason === 'no_class_day') return 'No hay clase este día'
  if (meta.value.reason === 'no_students') return 'Sin alumnos'
  return 'Sin alumnos para esta fecha'
})

const emptyHint = computed(() => {
  if (meta.value.message) return meta.value.message
  return 'Seleccione otra fecha o verifique que el curso tenga horario y estudiantes.'
})

function getTodayDate() {
  const date = new Date()
  const offset = date.getTimezoneOffset() / 60
  const peruOffset = -5
  date.setHours(date.getHours() - offset + peruOffset)
  return date.toISOString().split('T')[0]
}

const syncToolbar = () => {
  const slots = meta.value.schedule_slots || []
  assistanceScheduleLabel.value = slots.length
    ? slots.map((s) => `${s.start_time}–${s.end_time}`).join(' · ')
    : ''
  assistanceCanUpdate.value = Boolean(canEdit.value && dirtyCount.value && !saving.value)
  if (typeof setCourseStudentsCount === 'function') {
    setCourseStudentsCount(assistances.value.length)
  }
}

const rowNumber = (index) => (page.value - 1) * pageSize.value + index + 1

const studentSurnames = (row) => {
  const surnames = (row.student_surnames || '').trim()
  if (surnames) return surnames.toUpperCase()
  return (row.student_name || '').trim().toUpperCase()
}

const studentGivenName = (row) => {
  const given = (row.student_given_name || '').trim()
  if (given) return given.toUpperCase()
  return ''
}

const rowSource = (row) => {
  if (row.status !== row.baseline_status) return 'teacher'
  return row.source === 'teacher' ? 'qr' : row.source
}

const sourceLabel = (source) => {
  if (source === 'teacher') return 'Docente'
  if (source === 'qr') return 'QR'
  return 'Predeterminado'
}

const sourcePillClass = (source) => {
  if (source === 'teacher') return 'status-green'
  if (source === 'qr') return 'status-blue'
  return 'status-gray'
}

const fetchAssistances = async () => {
  if (!assistanceDate.value) return

  loading.value = true
  loadError.value = ''
  try {
    const courseClassId = Number(route.params.courseClass)
    if (!courseClassId) {
      loadError.value = 'No se identificó el curso. Vuelva al detalle del curso e intente de nuevo.'
      assistances.value = []
      syncToolbar()
      return
    }

    const response = await AssistanceService.listAssistancesByDate({
      course_class_id: courseClassId,
      date_assistance: assistanceDate.value,
    })

    if (!response.data?.success) {
      loadError.value = response.data?.message || 'No se pudo cargar la asistencia.'
      assistances.value = []
      meta.value = { ...meta.value, reason: 'error' }
      syncToolbar()
      return
    }

    const payload = response.data.data
    const rows = Array.isArray(payload) ? payload : payload?.assistances || []
    meta.value = {
      has_schedule: false,
      is_class_day: false,
      can_edit: false,
      schedule_slots: [],
      reason: null,
      message: null,
      ...(payload?.meta || {}),
    }

    assistances.value = rows.map((row) => ({
      ...row,
      status: row.status === 'A' ? 'A' : 'F',
      baseline_status: row.baseline_status === 'A' ? 'A' : 'F',
      _initialStatus: row.status === 'A' ? 'A' : 'F',
    }))
    page.value = 1
  } catch (error) {
    console.error('Error al obtener las asistencias:', error)
    loadError.value =
      error.response?.data?.message ||
      'Error al cargar los alumnos. Verifique su sesión e intente de nuevo.'
    assistances.value = []
  } finally {
    loading.value = false
    syncToolbar()
  }
}

const toggleStatus = (row) => {
  if (!canEdit.value || saving.value) return
  row.status = row.status === 'A' ? 'F' : 'A'
  assistances.value = [...assistances.value]
  syncToolbar()
}

const saveChanges = async () => {
  if (!canEdit.value || !dirtyCount.value || saving.value) return

  const dirty = assistances.value.filter((row) => row.status !== row._initialStatus)
  saving.value = true
  loadError.value = ''
  syncToolbar()

  try {
    const payload = {
      course_class_id: Number(route.params.courseClass),
      date_assistance: assistanceDate.value,
      assistances: dirty.map((row) => ({
        student_id: row.student_id,
        status: row.status,
      })),
    }

    const response = await AssistanceService.updateAssistances(payload)
    if (!response.data?.success) {
      const message = response.data?.message || 'No se pudo guardar la asistencia.'
      loadError.value = message
      toastError(message)
      return
    }

    await fetchAssistances()
    toastSuccess(
      dirty.length === 1 ? '1 cambio guardado' : `${dirty.length} cambios guardados`
    )
  } catch (error) {
    console.error('Error al guardar la asistencia:', error)
    const message =
      error.response?.data?.message || 'Error al guardar. Intente de nuevo.'
    loadError.value = message
    toastError(message)
  } finally {
    saving.value = false
    syncToolbar()
  }
}

watch(assistanceDate, () => {
  fetchAssistances()
}, { immediate: true })

watch(assistanceSaveSignal, (value, previous) => {
  if (value && value !== previous) saveChanges()
})

watch(dirtyCount, () => syncToolbar())
</script>

<style scoped>
.student-name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
  line-height: 1.25;
}

.student-name__surnames {
  font-weight: var(--rp-weight-bold, 700);
  color: var(--rp-text-heading);
  text-transform: uppercase;
}

.student-name__given {
  font-weight: var(--rp-weight-normal, 400);
  color: var(--rp-text-body, var(--rp-text-heading));
  text-transform: uppercase;
}

.attendance-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 7.5rem;
  padding: 0.28rem 0.65rem;
  border: 1px solid transparent;
  border-radius: var(--rp-radius-sm);
  font-size: var(--rp-text-sm, 0.85rem);
  line-height: 1.2;
  cursor: pointer;
  transition:
    opacity var(--rp-transition-fast, 0.15s ease),
    transform var(--rp-transition-fast, 0.15s ease);
}

.attendance-status:disabled {
  cursor: default;
  opacity: 0.85;
}

.attendance-status:not(:disabled):hover {
  transform: translateY(-1px);
}

.attendance-status__code {
  font-weight: var(--rp-weight-bold, 700);
}

.attendance-status--present {
  background: var(--rp-success-50);
  color: var(--rp-success-800);
  border-color: var(--rp-success-200);
}

.attendance-status--absent {
  background: var(--rp-danger-50);
  color: var(--rp-danger-800);
  border-color: var(--rp-danger-200);
}

.assistance-dirty {
  font-size: var(--rp-text-sm, 0.875rem);
  color: var(--rp-text-muted);
}

@media (max-width: 575.98px) {
  .student-name {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .student-name__given {
    font-size: 0.8em;
    color: var(--rp-text-muted);
  }

  .attendance-status {
    min-width: 6.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
