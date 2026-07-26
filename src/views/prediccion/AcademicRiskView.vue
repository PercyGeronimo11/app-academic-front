<template>
  <div class="academic-risk-view">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0 risk-hero-card">
          <CCardBody class="py-4 px-4">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <p class="risk-hero-card__eyebrow mb-2">Alerta temprana</p>
                <h4 class="fw-bold mb-2">Vista operativa</h4>
                <p class="mb-0 text-body-secondary">
                  Predicciones por alumno del aula seleccionada: detalle, factores y acciones.
                </p>
                <p class="risk-hero-card__meta mb-0 mt-2">
                  <i class="fas fa-clock me-1"></i>
                  Última actualización:
                  <strong>{{ formatDateTime(store.summary.lastUpdated) }}</strong>
                </p>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <CButton color="secondary" variant="outline" @click="goToDashboard">
                  <i class="fas fa-chart-line me-2"></i>
                  Dashboard
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <AcademicRiskFilters
      @update-predictions="confirmUpdate"
    />

    <AcademicRiskSummary v-if="!store.scope.isStudentView" :summary="store.summary" />

    <AcademicRiskTable
      :rows="store.filteredRows"
      :loading="store.loading"
      :error="store.error"
      :connection-error="store.connectionError"
      :can-predict="store.canPredictIndividual"
      :predicting-student-id="store.predictingStudentId"
      :predict-disabled="store.updating"
      @view-detail="store.openDetail"
      @predict-student="confirmPredictStudent"
      @go-to-profile="goToStudentProfile"
    />

    <AcademicRiskDrawer
      :visible="store.drawerVisible"
      :row="store.selectedRow"
      @close="store.closeDetail"
    />

    <div v-if="store.updating || store.predictingStudentId" class="academic-risk-overlay">
      <div class="academic-risk-overlay__content">
        <CSpinner color="light" class="mb-3" />
        <h5 class="text-white mb-2">
          {{ store.predictingStudentId ? 'Generando predicción...' : 'Generando predicciones...' }}
        </h5>
        <p class="text-white-50 mb-3">
          {{
            store.predictingStudentId
              ? 'El modelo de Machine Learning está procesando al alumno seleccionado.'
              : 'El modelo de Machine Learning está procesando el aula seleccionada.'
          }}
        </p>
        <CProgress animated :value="100" color="light" class="academic-risk-overlay__progress" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import AcademicRiskDrawer from '@/components/academic-risk/AcademicRiskDrawer.vue'
import AcademicRiskFilters from '@/components/academic-risk/AcademicRiskFilters.vue'
import AcademicRiskSummary from '@/components/academic-risk/AcademicRiskSummary.vue'
import AcademicRiskTable from '@/components/academic-risk/AcademicRiskTable.vue'
import { useAcademicRiskStore } from '@/stores/academicRisk'
import { toastError, toastSuccess } from '@/utils/alerts'
import { formatDateTime } from '@/utils/academicRisk'
import { formatSkippedStudentLabel } from '@/utils/academicRiskFilters'

const store = useAcademicRiskStore()
const router = useRouter()
const route = useRoute()

const goToDashboard = () => {
  router.push({
    path: '/prediccion/dashboard',
    query: {
      school_year: store.filters.schoolYear || undefined,
      bimester: store.filters.bimester || undefined,
      grade_section_id: store.filters.gradeSectionId || undefined,
    },
  })
}

const goToStudentProfile = (rowOrId) => {
  const studentId = typeof rowOrId === 'object' ? rowOrId?.studentId : rowOrId
  if (!studentId) return
  router.push(`/edit-student/${studentId}`)
}

const buildMissingFieldsHtml = (missingFields = []) => {
  if (!missingFields.length) return ''
  const items = missingFields.map((field) => `<li>${field}</li>`).join('')
  return `<p class="mb-2">Información faltante:</p><ul class="text-start mb-0">${items}</ul>`
}

const buildSkippedStudentsHtml = (skippedStudents = []) => {
  if (!skippedStudents.length) return ''
  const items = skippedStudents
    .map((item) => `<li>${formatSkippedStudentLabel(item)}</li>`)
    .join('')
  return `<p class="mb-2 mt-3">No se pudo calcular la predicción de:</p><ul class="text-start mb-0">${items}</ul>`
}

const showPredictionError = async (err, studentId = null) => {
  const payload = err.validationPayload || err.response?.data || {}
  const missingFields = payload.missing_fields || []
  const skippedStudents = payload.skipped_students || []
  const message = payload.message || store.error || 'No se pudieron actualizar las predicciones.'
  const targetStudentId = studentId || payload.student_id || null

  if (missingFields.length) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      html: `<p>${message}</p>${buildMissingFieldsHtml(missingFields)}`,
      showCancelButton: Boolean(targetStudentId),
      confirmButtonText: 'Entendido',
      cancelButtonText: 'Ir a completar información',
      confirmButtonColor: '#321fdb',
      cancelButtonColor: '#39f',
      reverseButtons: true,
    })

    if (result.dismiss === Swal.DismissReason.cancel && targetStudentId) {
      goToStudentProfile(targetStudentId)
    }
    return
  }

  if (skippedStudents.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Predicción incompleta',
      html: `<p>${message}</p>${buildSkippedStudentsHtml(skippedStudents)}`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#321fdb',
    })
    return
  }

  toastError(message)
}

const showBatchResult = (payload = {}) => {
  const processed = Number(payload.students_processed ?? 0)
  const skippedStudents = payload.skipped_students || []

  if (!skippedStudents.length) {
    toastSuccess(payload.message || 'Predicciones actualizadas correctamente.')
    return
  }

  Swal.fire({
    icon: processed > 0 ? 'success' : 'warning',
    title: processed > 0 ? 'Predicciones actualizadas' : 'Sin predicciones generadas',
    html: `<p>${payload.message || `Se actualizaron ${processed} predicciones.`}</p>${buildSkippedStudentsHtml(skippedStudents)}`,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#321fdb',
  })
}

const confirmUpdate = async () => {
  const result = await Swal.fire({
    title: '¿Desea actualizar las predicciones?',
    html: 'Se ejecutará el modelo de Machine Learning para el aula y bimestre seleccionados.<br><br>Se calculará solo para alumnos con datos ML completos; el resto se listará al final.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#321fdb',
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    const payload = await store.updatePredictions()
    showBatchResult(payload)
  } catch (err) {
    showPredictionError(err)
  }
}

const confirmPredictStudent = async (row) => {
  const result = await Swal.fire({
    title: '¿Calcular predicción individual?',
    html: `Se ejecutará el modelo para <strong>${row.fullName}</strong>.<br><br>El alumno debe tener completos los datos ML.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Calcular',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#321fdb',
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    await store.predictStudent(row.studentId)
    toastSuccess(`Predicción actualizada para ${row.fullName}.`)
  } catch (err) {
    showPredictionError(err, row.studentId)
  }
}

onMounted(() => {
  if (route.query.school_year) {
    store.filters.schoolYear = Number(route.query.school_year)
  }
  if (route.query.bimester) {
    store.filters.bimester = Number(route.query.bimester)
  }
  if (route.query.grade_section_id) {
    store.filters.gradeSectionId = Number(route.query.grade_section_id)
  }
  store.initializeFilters()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
