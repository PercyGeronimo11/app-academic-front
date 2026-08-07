<template>
  <CModal
    :visible="isOpenModal"
    scrollable
    size="lg"
    alignment="center"
    backdrop="static"
    @close="requestClose"
  >
    <CModalHeader>
      <CModalTitle>Horario del curso</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <div v-if="courseClass" class="mb-3">
        <p class="mb-1 text-body-secondary">
          Curso: <strong>{{ courseClass.course_name }}</strong>
        </p>
        <p class="mb-1 text-body-secondary">
          Aula:
          <strong>{{ courseClass.grade }}° {{ courseClass.section }}</strong>
        </p>
        <p v-if="periodName" class="mb-0 text-body-secondary">
          Periodo activo: <strong>{{ periodName }}</strong>
        </p>
      </div>

      <div v-if="loading" class="text-center text-body-secondary py-4">
        Cargando horarios...
      </div>

      <template v-else>
        <CRow class="g-2 align-items-end mb-3">
          <CCol xs="12" md="3">
            <CFormLabel>Día</CFormLabel>
            <select v-model="form.day_of_week" class="form-select">
              <option value="">Seleccione</option>
              <option v-for="day in days" :key="day.value" :value="String(day.value)">
                {{ day.label }}
              </option>
            </select>
          </CCol>
          <CCol xs="6" md="3">
            <CFormLabel>Hora inicio</CFormLabel>
            <CFormInput v-model="form.start_time" type="time" />
          </CCol>
          <CCol xs="6" md="3">
            <CFormLabel>Hora fin</CFormLabel>
            <CFormInput v-model="form.end_time" type="time" />
          </CCol>
          <CCol xs="12" md="3" class="d-grid">
            <CButton
              type="button"
              :color="editingIndex === null ? 'info' : 'warning'"
              class="text-white"
              @click="upsertDraftSlot"
            >
              {{ editingIndex === null ? 'Agregar' : 'Actualizar' }}
            </CButton>
          </CCol>
        </CRow>

        <div v-if="editingIndex !== null" class="mb-3">
          <CButton type="button" color="secondary" variant="outline" size="sm" @click="resetForm">
            Cancelar edición
          </CButton>
        </div>

        <div class="table-responsive border rounded">
          <CTable hover align="middle" class="mb-0">
            <CTableHead class="table-light">
              <CTableRow>
                <CTableHeaderCell class="text-center">Día</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Inicio</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Fin</CTableHeaderCell>
                <CTableHeaderCell class="text-center" style="width: 120px">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-if="!draft.length">
                <CTableDataCell colspan="4" class="text-center text-body-secondary py-4">
                  No hay horarios en el borrador. Agregue al menos uno o guarde vacío para limpiar.
                </CTableDataCell>
              </CTableRow>
              <CTableRow
                v-for="(slot, index) in sortedDraft"
                :key="`${slot.day_of_week}-${slot.start_time}-${index}`"
              >
                <CTableDataCell class="text-center">{{ dayLabel(slot.day_of_week) }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ slot.start_time }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ slot.end_time }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButton
                    type="button"
                    color="warning"
                    size="sm"
                    class="text-white me-1"
                    title="Editar"
                    @click="startEdit(slot)"
                  >
                    <CIcon :content="cilPencil" size="sm" />
                  </CButton>
                  <CButton
                    type="button"
                    color="danger"
                    size="sm"
                    class="text-white"
                    title="Eliminar"
                    @click="removeDraftSlot(slot)"
                  >
                    <CIcon :content="cilTrash" size="sm" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </template>
    </CModalBody>

    <CModalFooter>
      <CButton type="button" color="secondary" :disabled="saving" @click="requestClose">
        Cancelar
      </CButton>
      <CButton type="button" color="primary" :disabled="loading || saving" @click="saveDraft">
        {{ saving ? 'Guardando...' : 'Guardar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { cilPencil, cilTrash } from '@coreui/icons'
import ScheduleService from '@/services/ScheduleService'

const emit = defineEmits(['update:isOpenModal', 'saved'])

const props = defineProps({
  isOpenModal: { type: Boolean, required: true },
  courseClass: { type: Object, default: null },
})

const days = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
]

const loading = ref(false)
const saving = ref(false)
const draft = ref([])
const periodName = ref('')
const editingIndex = ref(null)
const form = ref({
  day_of_week: '',
  start_time: '',
  end_time: '',
})

const sortedDraft = computed(() =>
  [...draft.value].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
    return String(a.start_time).localeCompare(String(b.start_time))
  }),
)

const dayLabel = (day) => days.find((d) => d.value === Number(day))?.label || day

const normalizeTime = (value) => {
  const raw = String(value || '').trim()
  const match = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)/)
  if (!match) return null
  return `${String(match[1]).padStart(2, '0')}:${match[2]}`
}

const timesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA

const resetForm = () => {
  form.value = { day_of_week: '', start_time: '', end_time: '' }
  editingIndex.value = null
}

const validateFormSlot = () => {
  const day = Number(form.value.day_of_week)
  const start = normalizeTime(form.value.start_time)
  const end = normalizeTime(form.value.end_time)

  if (!day || day < 1 || day > 5) {
    return { ok: false, message: 'Seleccione un día de lunes a viernes.' }
  }
  if (!start || !end) {
    return { ok: false, message: 'Indique hora de inicio y fin en formato HH:mm.' }
  }
  if (start >= end) {
    return { ok: false, message: 'La hora de inicio debe ser menor que la hora de fin.' }
  }

  const conflict = draft.value.some((slot, index) => {
    if (editingIndex.value !== null && index === editingIndex.value) return false
    if (Number(slot.day_of_week) !== day) return false
    if (slot.start_time === start && slot.end_time === end) return true
    return timesOverlap(start, end, slot.start_time, slot.end_time)
  })

  if (conflict) {
    return {
      ok: false,
      message: 'Ese horario se duplica o se solapa con otro del mismo curso en el borrador.',
    }
  }

  return { ok: true, slot: { day_of_week: day, start_time: start, end_time: end } }
}

const upsertDraftSlot = () => {
  const result = validateFormSlot()
  if (!result.ok) {
    Swal.fire({ icon: 'warning', title: 'Validación', text: result.message })
    return
  }

  if (editingIndex.value === null) {
    draft.value.push(result.slot)
  } else {
    draft.value.splice(editingIndex.value, 1, result.slot)
  }
  resetForm()
}

const startEdit = (slot) => {
  const index = draft.value.findIndex(
    (item) =>
      Number(item.day_of_week) === Number(slot.day_of_week) &&
      item.start_time === slot.start_time &&
      item.end_time === slot.end_time,
  )
  editingIndex.value = index
  form.value = {
    day_of_week: String(slot.day_of_week),
    start_time: slot.start_time,
    end_time: slot.end_time,
  }
}

const removeDraftSlot = (slot) => {
  draft.value = draft.value.filter(
    (item) =>
      !(
        Number(item.day_of_week) === Number(slot.day_of_week) &&
        item.start_time === slot.start_time &&
        item.end_time === slot.end_time
      ),
  )
  if (editingIndex.value !== null) resetForm()
}

const loadSchedules = async () => {
  if (!props.courseClass?.course_class_id) {
    draft.value = []
    return
  }

  loading.value = true
  try {
    const response = await ScheduleService.listByCourseClass(props.courseClass.course_class_id)
    const data = response.data?.data || {}
    periodName.value = data.period?.name || ''
    draft.value = (data.schedules || []).map((item) => ({
      day_of_week: Number(item.day_of_week),
      start_time: item.start_time,
      end_time: item.end_time,
    }))
  } catch (error) {
    draft.value = []
    Swal.fire({
      icon: 'error',
      title: 'No se pudo cargar',
      text: error.response?.data?.message || 'Error al obtener los horarios.',
    })
  } finally {
    loading.value = false
  }
}

const saveDraft = async () => {
  if (!props.courseClass?.course_class_id) return

  saving.value = true
  try {
    const response = await ScheduleService.syncByCourseClass(
      props.courseClass.course_class_id,
      draft.value.map((item) => ({
        day_of_week: Number(item.day_of_week),
        start_time: item.start_time,
        end_time: item.end_time,
      })),
    )

    if (response.data?.success) {
      emit('saved')
      emit('update:isOpenModal', false)
      Swal.fire({
        icon: 'success',
        title: 'Horario guardado',
        text: 'Los horarios del curso se guardaron correctamente.',
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.data?.message || 'No se pudo guardar el horario.',
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Conflicto o error',
      text: error.response?.data?.message || 'No se pudo guardar el horario.',
    })
  } finally {
    saving.value = false
  }
}

const requestClose = () => {
  if (saving.value) return
  emit('update:isOpenModal', false)
}

watch(
  () => [props.isOpenModal, props.courseClass?.course_class_id],
  async ([open]) => {
    if (!open) {
      draft.value = []
      periodName.value = ''
      resetForm()
      return
    }
    resetForm()
    await loadSchedules()
  },
)
</script>
