<template>
  <CModal
    :visible="visible"
    size="lg"
    alignment="center"
    scrollable
    backdrop="static"
    @close="close"
  >
    <CModalHeader>
      <CModalTitle>Importar SIAGIE</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <p class="text-body-secondary small mb-2">
        Seleccione el bimestre y el Excel RegNotas (.xlsx). Valide los códigos de estudiante
        del aula antes de importar.
      </p>

      <div v-if="activePeriodLabel" class="module-alert module-alert--info mb-3 py-2">
        Periodo activo: <strong>{{ activePeriodLabel }}</strong>
      </div>

      <div class="mb-3">
        <CFormLabel for="siagie-bimester">Bimestre</CFormLabel>
        <CFormSelect
          id="siagie-bimester"
          v-model="selectedBimesterId"
          :disabled="busy || !bimesters.length"
        >
          <option v-if="!bimesters.length" value="">Sin bimestres del periodo activo</option>
          <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
            {{ item.name }}
          </option>
        </CFormSelect>
      </div>

      <div class="upload-zone mb-3">
        <CFormInput
          :key="fileInputKey"
          type="file"
          accept=".xlsx,.xls"
          label="Archivo SIAGIE (.xlsx)"
          :disabled="busy"
          @change="onFileChange"
        />
      </div>

      <div v-if="errorMessage" class="module-alert module-alert--error mb-0">
        {{ errorMessage }}
      </div>

      <div v-if="validation" class="siagie-validation mt-3">
        <div
          class="module-alert mb-2"
          :class="validation.valid ? 'module-alert--success' : 'module-alert--error'"
        >
          <template v-if="validation.valid">
            Archivo validado correctamente
          </template>
          <template v-else>
            Hay estudiantes que no pertenecen a este aula o filas sin código.
          </template>
        </div>

        <ul class="siagie-validation__summary mb-0">
          <li>
            En el archivo: <strong>{{ validation.students_in_file ?? 0 }}</strong>
          </li>
          <li>
            Válidos: <strong>{{ validation.valid_count ?? 0 }}</strong>
          </li>
          <li>
            No válidos: <strong>{{ validation.invalid_count ?? 0 }}</strong>
          </li>
          <li v-if="validation.classroom">
            Aula: <strong>{{ validation.classroom }}</strong>
          </li>
        </ul>

        <div v-if="validation.invalid_students?.length" class="siagie-validation__invalid mt-3">
          <p class="fw-semibold small mb-1">Códigos no válidos</p>
          <ul class="small mb-0 ps-3">
            <li
              v-for="(item, index) in validation.invalid_students"
              :key="`${item.student_code || 'sin-codigo'}-${index}`"
            >
              <template v-if="item.student_code">
                {{ item.student_code }}
                <span v-if="item.full_name" class="text-body-secondary"> — {{ item.full_name }}</span>
              </template>
              <template v-else>
                Sin código
                <span v-if="item.full_name" class="text-body-secondary"> — {{ item.full_name }}</span>
              </template>
              <span v-if="item.reason" class="text-body-secondary"> ({{ item.reason }})</span>
            </li>
          </ul>
        </div>
      </div>
    </CModalBody>

    <CModalFooter class="gap-2">
      <CButton color="secondary" variant="outline" :disabled="busy" @click="close">
        Cancelar
      </CButton>
      <CButton
        color="info"
        variant="outline"
        :disabled="!canValidate || busy"
        @click="validateFile"
      >
        <i v-if="validating" class="fas fa-spinner fa-spin me-1"></i>
        <i v-else class="fas fa-check-double me-1"></i>
        {{ validating ? 'Validando...' : 'Validar' }}
      </CButton>
      <CButton
        color="primary"
        :disabled="!canImport || busy"
        @click="importFile"
      >
        <i v-if="importing" class="fas fa-spinner fa-spin me-1"></i>
        <i v-else class="fas fa-file-import me-1"></i>
        {{ importing ? 'Importando...' : 'Importar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import { filterActivePeriodBimesters, pickCurrentBimesterId } from '@/utils/bimester'

const props = defineProps({
  visible: { type: Boolean, default: false },
  courseClassId: { type: Number, required: true },
})

const emit = defineEmits(['close', 'imported'])

const bimesters = ref([])
const activePeriodLabel = ref('')
const selectedBimesterId = ref(null)
const file = ref(null)
const fileInputKey = ref(0)
const validating = ref(false)
const importing = ref(false)
const errorMessage = ref('')
const validation = ref(null)

const busy = computed(() => validating.value || importing.value)
const canValidate = computed(() => Boolean(file.value && selectedBimesterId.value))
const canImport = computed(() => Boolean(
  file.value
  && selectedBimesterId.value
  && validation.value?.valid
))

const resetState = () => {
  file.value = null
  fileInputKey.value += 1
  validation.value = null
  errorMessage.value = ''
  validating.value = false
  importing.value = false
}

const invalidateValidation = () => {
  validation.value = null
  errorMessage.value = ''
}

const loadBimesters = async () => {
  try {
    const response = await CompetencyScoreService.listBimesters()
    const filtered = filterActivePeriodBimesters(response.data?.data || [])
    bimesters.value = filtered
    const year = filtered[0]?.year
    activePeriodLabel.value = year ? String(year) : ''
    selectedBimesterId.value = pickCurrentBimesterId(filtered)
  } catch {
    bimesters.value = []
    activePeriodLabel.value = ''
    selectedBimesterId.value = null
  }
}

watch(
  () => props.visible,
  async (open) => {
    if (open) {
      resetState()
      await loadBimesters()
    }
  }
)

watch(selectedBimesterId, () => {
  if (validation.value) invalidateValidation()
})

const onFileChange = (event) => {
  file.value = event.target.files?.[0] || null
  invalidateValidation()
}

const close = () => {
  if (busy.value) return
  emit('close')
}

const extractPayload = (responseOrError) => {
  const data = responseOrError?.data ?? responseOrError?.response?.data
  return {
    success: Boolean(data?.success),
    message: data?.message || '',
    payload: data?.data || null,
  }
}

const validateFile = async () => {
  if (!canValidate.value) return

  validating.value = true
  errorMessage.value = ''
  validation.value = null

  try {
    const response = await CompetencyScoreService.validateSiagieForCourseClass(
      file.value,
      props.courseClassId,
      selectedBimesterId.value
    )
    const { success, message, payload } = extractPayload(response)
    validation.value = {
      ...(payload || {}),
      valid: Boolean(payload?.valid ?? success),
    }
    if (!success) {
      errorMessage.value = message || 'Validación fallida.'
    }
  } catch (error) {
    const { message, payload } = extractPayload(error)
    if (payload) {
      validation.value = {
        ...payload,
        valid: Boolean(payload.valid),
      }
    }
    errorMessage.value = message || 'Error al validar el archivo.'
  } finally {
    validating.value = false
  }
}

const importFile = async () => {
  if (!canImport.value) return

  importing.value = true
  errorMessage.value = ''

  try {
    const response = await CompetencyScoreService.importSiagieForCourseClass(
      file.value,
      props.courseClassId,
      selectedBimesterId.value
    )
    const { success, message, payload } = extractPayload(response)
    if (!success) {
      if (payload?.invalid_students) {
        validation.value = {
          ...payload,
          valid: false,
        }
      }
      errorMessage.value = message || 'No se pudo importar el archivo.'
      return
    }

    emit('imported', { message, data: payload })
    emit('close')
  } catch (error) {
    const { message, payload } = extractPayload(error)
    if (payload?.invalid_students) {
      validation.value = {
        ...payload,
        valid: false,
      }
    }
    errorMessage.value = message || 'Error al importar notas.'
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.siagie-validation__summary {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.25rem;
  font-size: var(--rp-text-sm, 0.875rem);
  color: var(--rp-text-muted);
}

.siagie-validation__invalid {
  max-height: 10rem;
  overflow: auto;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-muted);
  padding: var(--rp-space-3);
}
</style>
