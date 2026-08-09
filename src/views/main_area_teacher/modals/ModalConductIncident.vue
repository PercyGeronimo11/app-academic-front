<template>
  <CModal
    :visible="visible"
    alignment="center"
    scrollable
    size="lg"
    backdrop="static"
    @close="close"
  >
    <CModalHeader>
      <CModalTitle>
        <i class="fas fa-exclamation-triangle text-warning me-2"></i>
        Registrar incidente de conducta
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm>
        <div class="mb-3">
          <CFormLabel>Alumnos del aula * (máx. 10)</CFormLabel>
          <div v-if="loadingStudents" class="text-body-secondary small">Cargando alumnos...</div>
          <div v-else class="student-picker">
            <CFormCheck
              v-for="student in students"
              :key="student.student_id"
              :id="`conduct-student-${student.student_id}`"
              :checked="selectedIds.includes(student.student_id)"
              :disabled="!selectedIds.includes(student.student_id) && selectedIds.length >= 10"
              :label="student.student_name"
              @change="toggleStudent(student.student_id, $event.target.checked)"
            />
          </div>
          <p class="small text-body-secondary mb-0 mt-1">
            Seleccionados: {{ selectedIds.length }} / 10
          </p>
        </div>

        <div class="row g-2 mb-3 conduct-form-meta">
          <div class="col-6 col-md-4 order-1">
            <CFormLabel for="incident-date">Fecha del incidente</CFormLabel>
            <CFormInput id="incident-date" v-model="form.incident_date" type="date" />
          </div>
          <div class="col-12 col-md-4 order-3 order-md-2">
            <CFormLabel for="incident-type">Tipo de incidente</CFormLabel>
            <select id="incident-type" v-model="form.incident_type" class="form-select">
              <option v-for="opt in incidentTypes" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="col-6 col-md-4 order-2 order-md-3">
            <CFormLabel for="severity">Gravedad</CFormLabel>
            <select id="severity" v-model="form.severity" class="form-select">
              <option v-for="opt in severities" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
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
      <CButton color="secondary" variant="outline" :disabled="saving" @click="close">
        Cancelar
      </CButton>
      <CButton color="primary" :disabled="saving" @click="submit">
        {{ saving ? 'Guardando...' : 'Registrar y notificar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import ConductIncidentService from '@/services/ConductIncidentService'
import { toastError, toastSuccess } from '@/utils/alerts'

const props = defineProps({
  visible: { type: Boolean, default: false },
  courseClassId: { type: Number, required: true },
  bimesterId: { type: Number, default: null },
})

const emit = defineEmits(['close', 'saved'])

const saving = ref(false)
const loadingStudents = ref(false)
const error = ref('')
const students = ref([])
const selectedIds = ref([])

const incidentTypes = [
  { value: 'comportamiento_inadecuado', label: 'Comportamiento inadecuado' },
  { value: 'agresion', label: 'Agresión' },
  { value: 'irrespeto', label: 'Irrespeto' },
  { value: 'uso_celular', label: 'Uso de celular' },
  { value: 'otro', label: 'Otro' },
]

const severities = [
  { value: 'leve', label: '1. Leve' },
  { value: 'moderado', label: '2. Moderado' },
  { value: 'grave', label: '3. Grave' },
  { value: 'muy_grave', label: '4. Muy grave' },
  { value: 'critico', label: '5. Crítico' },
]

const getToday = () => new Date().toISOString().slice(0, 10)

const form = ref({
  incident_date: getToday(),
  incident_type: 'comportamiento_inadecuado',
  severity: 'leve',
  description: '',
})

const resetForm = () => {
  form.value = {
    incident_date: getToday(),
    incident_type: 'comportamiento_inadecuado',
    severity: 'leve',
    description: '',
  }
  selectedIds.value = []
  error.value = ''
}

const loadStudents = async () => {
  loadingStudents.value = true
  try {
    const response = await ConductIncidentService.listStudentsByCourse(
      props.courseClassId,
      props.bimesterId
    )
    students.value = response.data?.data?.students ?? []
  } catch {
    students.value = []
    error.value = 'No se pudieron cargar los alumnos del aula.'
  } finally {
    loadingStudents.value = false
  }
}

const toggleStudent = (studentId, checked) => {
  const id = Number(studentId)
  if (checked) {
    if (selectedIds.value.length >= 10) return
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
    return
  }
  selectedIds.value = selectedIds.value.filter((item) => item !== id)
}

watch(
  () => props.visible,
  async (open) => {
    if (open) {
      resetForm()
      await loadStudents()
    }
  }
)

const close = () => {
  if (saving.value) return
  emit('close')
}

const submit = async () => {
  if (!selectedIds.value.length) {
    error.value = 'Seleccione al menos un alumno.'
    return
  }
  if (selectedIds.value.length > 10) {
    error.value = 'Puede seleccionar como máximo 10 alumnos.'
    return
  }
  if (!form.value.description || form.value.description.trim().length < 5) {
    error.value = 'La descripción debe tener al menos 5 caracteres.'
    return
  }

  const count = selectedIds.value.length
  const confirm = await Swal.fire({
    title: 'Registrar incidente',
    html: `
      <div style="text-align:left">
        <p>Se registrará el incidente para <b>${count}</b> alumno${count === 1 ? '' : 's'} y se enviará la notificación.</p>
        <p style="margin-top:8px">¿Desea continuar?</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, registrar y notificar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#176fb6',
    cancelButtonColor: '#6c757d',
  })

  if (!confirm.isConfirmed) return

  saving.value = true
  error.value = ''
  try {
    const payload = {
      course_class_id: props.courseClassId,
      student_ids: selectedIds.value,
      bimester_id: props.bimesterId,
      incident_type: form.value.incident_type,
      severity: form.value.severity,
      description: form.value.description.trim(),
      incident_date: form.value.incident_date,
    }

    const response = await ConductIncidentService.create(payload)
    if (response.data?.success) {
      const message = response.data.message
        || (count > 1
          ? `Se registraron ${count} incidentes y se enviaron las notificaciones`
          : 'Incidente registrado y notificación enviada')
      toastSuccess(message)
      emit('saved', response.data.data)
      emit('close')
    } else {
      const message = response.data?.message || 'No se pudo registrar el incidente.'
      error.value = message
      toastError(message)
    }
  } catch (err) {
    const message = err.response?.data?.message || 'Error al registrar el incidente.'
    error.value = message
    toastError(message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.student-picker {
  max-height: 12rem;
  overflow: auto;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-muted);
  padding: 0.65rem 0.75rem;
  display: grid;
  gap: 0.35rem;
}
</style>
