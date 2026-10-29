<template>
  <div class="academic-risk-view">
    <AcademicRiskFilters
      @update-predictions="confirmUpdate"
      @go-dashboard="goToDashboard"
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
              ? 'Procesando B1–B3 del alumno seleccionado (omite bimestres sin datos).'
              : 'Procesando B1–B3 del aula (omite alumnos incompletos; puede tardar varios minutos).'
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
import { BRAND_COLOR } from '@/utils/brand'
import { toastError, toastSuccess } from '@/utils/alerts'
import { formatSkippedStudentLabel } from '@/utils/academicRiskFilters'

const store = useAcademicRiskStore()
const router = useRouter()
const route = useRoute()

const goToDashboard = () => {
  router.push({
    path: '/prediccion/dashboard',
    query: {
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
    .map((item) => {
      const base = formatSkippedStudentLabel(item)
      return item.bimester ? `<li>${base} <em>(B${item.bimester})</em></li>` : `<li>${base}</li>`
    })
    .join('')
  return `<p class="mb-2 mt-3">No se pudo calcular la predicción de:</p><ul class="text-start mb-0">${items}</ul>`
}

const buildMissingByBimesterHtml = (missingByBimester = {}) => {
  const entries = Object.entries(missingByBimester)
  if (!entries.length) return ''
  const blocks = entries.map(([b, fields]) => {
    const list = (fields || []).map((f) => `<li>${f}</li>`).join('')
    return `<p class="mb-1 mt-2 fw-semibold">B${b}</p><ul class="text-start mb-0">${list || '<li>Datos incompletos</li>'}</ul>`
  })
  return blocks.join('')
}

const showPredictionError = async (err, studentId = null) => {
  const payload = err.validationPayload || err.response?.data || {}
  const missingFields = payload.missing_fields || []
  const missingByBimester = payload.missing_by_bimester || {}
  const skippedStudents = payload.skipped_students || []
  const message = payload.message || store.error || 'No se pudieron actualizar las predicciones.'
  const targetStudentId = studentId || payload.student_id || null

  // Individual: faltantes por bimestre
  if (Object.keys(missingByBimester).length) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos por bimestre',
      html: `<p>${message}</p>${buildMissingByBimesterHtml(missingByBimester)}`,
      showCancelButton: Boolean(targetStudentId),
      confirmButtonText: 'Entendido',
      cancelButtonText: 'Ir a completar información',
      confirmButtonColor: BRAND_COLOR,
      cancelButtonColor: '#39f',
      reverseButtons: true,
    })

    if (result.dismiss === Swal.DismissReason.cancel && targetStudentId) {
      goToStudentProfile(targetStudentId)
    }
    return
  }

  if (missingFields.length) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      html: `<p>${message}</p>${buildMissingFieldsHtml(missingFields)}`,
      showCancelButton: Boolean(targetStudentId),
      confirmButtonText: 'Entendido',
      cancelButtonText: 'Ir a completar información',
      confirmButtonColor: BRAND_COLOR,
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
      confirmButtonColor: BRAND_COLOR,
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
    confirmButtonColor: BRAND_COLOR,
  })
}

const confirmUpdate = async () => {
  const pred = store.predictableBimesters.map((n) => `B${n}`).join(', ') || 'B1–B3'
  const vigente = store.currentBimester ? `B${store.currentBimester}` : '—'
  const result = await Swal.fire({
    title: '¿Desea actualizar las predicciones?',
    html: `Se ejecutará el modelo para el aula seleccionada en <strong>${pred}</strong> (vigente ${vigente}).<br><br>Los alumnos sin notas u otros datos incompletos se omiten y se continúa con el resto.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: BRAND_COLOR,
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
  const pred = store.predictableBimesters.map((n) => `B${n}`).join(', ') || 'B1–B3'
  const result = await Swal.fire({
    title: '¿Actualizar predicción individual?',
    html: `Se ejecutará el modelo para <strong>${row.fullName}</strong> en ${pred}.<br><br>Si falta información en algún bimestre, ese bimestre se omite y se detalla en Observación.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: BRAND_COLOR,
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    const payload = await store.predictStudent(row.studentId)
    if (payload?.missing_by_bimester && Object.keys(payload.missing_by_bimester).length) {
      await showPredictionError({ validationPayload: payload }, row.studentId)
      if (payload.success) {
        toastSuccess(payload.message || `Predicción parcial para ${row.fullName}.`)
      }
      return
    }
    toastSuccess(payload?.message || `Predicción actualizada para ${row.fullName}.`)
  } catch (err) {
    showPredictionError(err, row.studentId)
  }
}

onMounted(() => {
  if (route.query.grade_section_id) {
    store.filters.gradeSectionId = Number(route.query.grade_section_id)
  }
  store.initializeFilters()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
