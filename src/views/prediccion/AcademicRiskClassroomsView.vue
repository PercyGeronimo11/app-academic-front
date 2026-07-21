<template>
  <div class="academic-risk-classrooms">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0 risk-hero-card risk-hero-card--classrooms">
          <CCardBody class="py-4 px-4">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <p class="risk-hero-card__eyebrow mb-2">Comparativo</p>
                <h4 class="fw-bold mb-2">Riesgo por aula</h4>
                <p class="mb-0 text-body-secondary">
                  Ranking y semáforo de 5 niveles para priorizar tutoría y dirección.
                </p>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <CButton color="secondary" variant="outline" @click="goDashboard">
                  <i class="fas fa-chart-line me-2"></i>
                  Dashboard
                </CButton>
                <CButton color="primary" @click="goOperational()">
                  <i class="fas fa-table me-2"></i>
                  Vista operativa
                </CButton>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <AcademicRiskDashFilters
      show-bulk-update
      @apply="store.loadClassrooms"
      @update-predictions="confirmUpdateAll"
    />

    <div class="semaphore-legend mb-3">
      <span class="semaphore semaphore--very-low">Muy bajo</span>
      <span class="semaphore semaphore--low">Bajo</span>
      <span class="semaphore semaphore--medium">Medio</span>
      <span class="semaphore semaphore--high">Alto</span>
      <span class="semaphore semaphore--critical">Crítico</span>
      <span class="semaphore semaphore--unknown">Sin predicción</span>
    </div>

    <div v-if="store.loading && !store.updating" class="text-center py-5">
      <CSpinner color="primary" />
      <p class="mt-3 mb-0 text-body-secondary">Cargando aulas...</p>
    </div>

    <CAlert v-else-if="store.connectionError" color="danger">
      No hay conexión con el servicio. Verifique Laravel y Django.
    </CAlert>

    <CAlert v-else-if="store.error" color="warning">
      {{ store.error }}
    </CAlert>

    <template v-else-if="!store.updating">
      <AcademicRiskDashKpis :summary="store.summary" />
      <div v-if="!store.classrooms.length" class="risk-empty risk-empty--panel">
        No hay aulas disponibles en su alcance para este bimestre.
      </div>
      <AcademicRiskClassroomCards
        v-else
        :classrooms="store.classrooms"
        @open-classroom="goOperational"
      />
    </template>

    <div v-if="store.updating" class="academic-risk-overlay">
      <div class="academic-risk-overlay__content">
        <CSpinner color="light" class="mb-3" />
        <h5 class="text-white mb-2">Generando predicciones...</h5>
        <p class="text-white-50 mb-3">
          El modelo de Machine Learning está procesando todas las aulas de su alcance.
          Esto puede tardar varios minutos.
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

import AcademicRiskClassroomCards from '@/components/academic-risk/AcademicRiskClassroomCards.vue'
import AcademicRiskDashFilters from '@/components/academic-risk/AcademicRiskDashFilters.vue'
import AcademicRiskDashKpis from '@/components/academic-risk/AcademicRiskDashKpis.vue'
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'
import { toastError, toastSuccess } from '@/utils/alerts'

const store = useAcademicRiskDashboardStore()
const router = useRouter()
const route = useRoute()

const goDashboard = () => {
  router.push({
    path: '/prediccion/dashboard',
    query: {
      school_year: store.filters.schoolYear || undefined,
      bimester: store.filters.bimester || undefined,
    },
  })
}

const goOperational = (classroom = null) => {
  router.push({
    path: '/prediccion/academic-risk',
    query: {
      school_year: store.filters.schoolYear || undefined,
      bimester: store.filters.bimester || undefined,
      grade_section_id: classroom?.grade_section_id || undefined,
    },
  })
}

const buildSkippedStudentsHtml = (skippedStudents = []) => {
  if (!skippedStudents.length) return ''
  const items = skippedStudents.map((name) => `<li>${name}</li>`).join('')
  return `<p class="mb-2 mt-3">No se pudo calcular la predicción de:</p><ul class="text-start mb-0">${items}</ul>`
}

const showBulkResult = (payload = {}) => {
  const processed = Number(payload.students_processed ?? 0)
  const classroomsOk = Number(payload.classrooms_processed ?? 0)
  const skippedStudents = payload.skipped_students || []

  if (!skippedStudents.length && classroomsOk > 0) {
    toastSuccess(payload.message || 'Predicciones actualizadas correctamente.')
    return
  }

  Swal.fire({
    icon: processed > 0 || classroomsOk > 0 ? 'success' : 'warning',
    title: classroomsOk > 0 ? 'Predicciones actualizadas' : 'Sin predicciones generadas',
    html: `<p>${payload.message || 'Proceso finalizado.'}</p>${buildSkippedStudentsHtml(skippedStudents)}`,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#321fdb',
  })
}

const confirmUpdateAll = async () => {
  const result = await Swal.fire({
    title: '¿Actualizar predicciones de todas las aulas?',
    html: 'Se ejecutará el modelo para <strong>todas las aulas de su alcance</strong> en el bimestre seleccionado.<br><br>Se calculará solo para alumnos con datos ML completos. El proceso puede tardar varios minutos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Actualizar todas',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#321fdb',
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    const payload = await store.updatePredictionsAll()
    showBulkResult(payload)
  } catch (err) {
    const data = err.validationPayload || err.response?.data || {}
    if (data.skipped_students?.length || data.classrooms_processed != null) {
      showBulkResult(data)
      return
    }
    toastError(data.message || 'No se pudieron actualizar las predicciones.')
  }
}

onMounted(async () => {
  if (route.query.school_year) {
    store.filters.schoolYear = Number(route.query.school_year)
  }
  if (route.query.bimester) {
    store.filters.bimester = Number(route.query.bimester)
  }
  await store.bootstrapClassrooms()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
