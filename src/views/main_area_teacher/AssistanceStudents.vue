<template>
  <div class="module-page assistance-page">
    <Transition name="save-feedback">
      <div v-if="saveFeedback.visible" class="save-feedback" aria-live="polite">
        <i class="fas fa-check"></i>
        <span>{{ saveFeedback.message }}</span>
      </div>
    </Transition>

    <ModulePageHeader
      icon="fas fa-clipboard-check"
      title="Tomar asistencia"
      :subtitle="headerSubtitle"
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
      <div v-if="scheduleLabel" class="text-body-secondary small align-self-end pb-1">
        <i class="fas fa-clock me-1"></i>{{ scheduleLabel }}
      </div>
      <div v-if="meta.is_class_day" class="text-body-secondary small align-self-end pb-1">
        Edición: {{ meta.edit_window?.start || '12:45' }}–{{ meta.edit_window?.end || '18:15' }}
        <span v-if="!canEdit" class="text-danger ms-1">(solo lectura ahora)</span>
      </div>
    </div>

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
      <div class="modern-table-shell">
        <CTable class="mb-0" hover responsive>
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell class="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Alumno</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Origen</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="min-width: 160px">Estado</CTableHeaderCell>
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
                <CBadge :color="sourceBadgeColor(rowSource(assistance))">
                  {{ sourceLabel(rowSource(assistance)) }}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <select
                  class="form-select form-select-sm"
                  :value="assistance.status"
                  :disabled="!canEdit || saving"
                  @change="onStatusChange(index, $event.target.value)"
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

      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
        <span class="text-body-secondary small">
          <template v-if="dirtyCount">{{ dirtyCount }} cambio(s) pendiente(s)</template>
          <template v-else>Sin cambios pendientes</template>
        </span>
        <div class="d-flex gap-2">
          <CButton type="button" color="secondary" variant="ghost" @click="goToBack">
            <i class="fas fa-arrow-left me-2"></i>Retroceder
          </CButton>
          <CButton
            type="button"
            color="primary"
            :disabled="!canEdit || !dirtyCount || saving"
            @click="saveChanges"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else class="fas fa-save me-2"></i>
            Guardar cambios
          </CButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AssistanceService from '../../services/AssistanceService'
import { useRoute, useRouter } from 'vue-router'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const assistances = ref([])
const meta = ref({
  has_schedule: false,
  is_class_day: false,
  can_edit: false,
  edit_window: { start: '12:45', end: '18:15' },
  schedule_slots: [],
  reason: null,
  message: null,
})
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const selectedDate = ref(getTodayDate())
const saveFeedback = ref({ visible: false, message: 'Guardado' })
let saveFeedbackTimer = null

const statusOptions = [
  { value: 'A', label: 'A — Asistió' },
  { value: 'F', label: 'F — Faltó' },
]

const headerSubtitle = computed(() => {
  if (!canEdit.value && meta.value.is_class_day) {
    return 'Puede consultar la lista, pero solo se edita entre 12:45 y 18:15 (hora Perú).'
  }
  return 'Los estados A/F se agrupan desde portería. Guarde al final solo si cambió algo.'
})

const canEdit = computed(() => Boolean(meta.value.can_edit))

const scheduleLabel = computed(() => {
  const slots = meta.value.schedule_slots || []
  if (!slots.length) return ''
  return slots.map((s) => `${s.start_time}–${s.end_time}`).join(' · ')
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

const rowSource = (row) => {
  if (row.status !== row.baseline_status) return 'teacher'
  return row.source === 'teacher' ? 'qr' : row.source
}

const fetchAssistances = async () => {
  if (!selectedDate.value) return

  loading.value = true
  loadError.value = ''
  try {
    const courseClassId = Number(route.params.courseClass)
    if (!courseClassId) {
      loadError.value = 'No se identificó el curso. Vuelva al detalle del curso e intente de nuevo.'
      assistances.value = []
      return
    }

    const response = await AssistanceService.listAssistancesByDate({
      course_class_id: courseClassId,
      date_assistance: selectedDate.value,
    })

    if (!response.data?.success) {
      loadError.value = response.data?.message || 'No se pudo cargar la asistencia.'
      assistances.value = []
      meta.value = { ...meta.value, reason: 'error' }
      return
    }

    const payload = response.data.data
    const rows = Array.isArray(payload) ? payload : payload?.assistances || []
    meta.value = {
      has_schedule: false,
      is_class_day: false,
      can_edit: false,
      edit_window: { start: '12:45', end: '18:15' },
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
  } catch (error) {
    console.error('Error al obtener las asistencias:', error)
    loadError.value =
      error.response?.data?.message ||
      'Error al cargar los alumnos. Verifique su sesión e intente de nuevo.'
    assistances.value = []
  } finally {
    loading.value = false
  }
}

const onStatusChange = (index, selectedStatus) => {
  if (!canEdit.value) return
  const row = assistances.value[index]
  row.status = selectedStatus
  // fuerza reactividad del dirtyCount
  assistances.value = [...assistances.value]
}

const showSaveFeedback = (message) => {
  saveFeedback.value = { visible: true, message }
  if (saveFeedbackTimer) clearTimeout(saveFeedbackTimer)
  saveFeedbackTimer = setTimeout(() => {
    saveFeedback.value.visible = false
  }, 2000)
}

const saveChanges = async () => {
  if (!canEdit.value || !dirtyCount.value) return

  const dirty = assistances.value.filter((row) => row.status !== row._initialStatus)
  saving.value = true
  loadError.value = ''

  try {
    const payload = {
      course_class_id: Number(route.params.courseClass),
      date_assistance: selectedDate.value,
      assistances: dirty.map((row) => ({
        student_id: row.student_id,
        status: row.status,
      })),
    }

    const response = await AssistanceService.updateAssistances(payload)
    if (!response.data?.success) {
      loadError.value = response.data?.message || 'No se pudo guardar la asistencia.'
      return
    }

    await fetchAssistances()
    showSaveFeedback(
      dirty.length === 1 ? '1 cambio guardado' : `${dirty.length} cambios guardados`
    )
  } catch (error) {
    console.error('Error al guardar la asistencia:', error)
    loadError.value =
      error.response?.data?.message || 'Error al guardar. Intente de nuevo.'
  } finally {
    saving.value = false
  }
}

const goToBack = () => {
  router.push('/courses/teacher/list')
}

const sourceLabel = (source) => {
  if (source === 'teacher') return 'Docente'
  if (source === 'qr') return 'QR'
  return 'Predeterminado'
}

const sourceBadgeColor = (source) => {
  if (source === 'teacher') return 'success'
  if (source === 'qr') return 'info'
  return 'secondary'
}

onMounted(fetchAssistances)
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

.save-feedback-enter-active,
.save-feedback-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.save-feedback-enter-from,
.save-feedback-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.form-select {
  min-width: 8.5rem;
  max-width: 100%;
  margin: 0 auto;
}

.form-select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
