<template>
  <div class="academic-risk-dashboard">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0 risk-hero-card">
          <CCardBody class="py-4 px-4">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <p class="risk-hero-card__eyebrow mb-2">Alerta temprana</p>
                <h4 class="fw-bold mb-2">Dashboard de predicción</h4>
                <p class="mb-0 text-body-secondary">
                  Visión general del riesgo académico por bimestre y aula, con alertas prioritarias y ranking.
                </p>
                <p class="risk-hero-card__meta mb-0 mt-2">
                  <i class="fas fa-clock me-1"></i>
                  Última actualización:
                  <strong>{{ formatDateTime(store.summary.last_updated) }}</strong>
                  <span v-if="store.summary.classrooms_count" class="ms-1">
                    · {{ store.summary.classrooms_count }} aulas en alcance
                  </span>
                </p>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <CButton color="primary" @click="goToOperational()">
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
      @apply="() => store.loadOverview({ force: true })"
      @update-predictions="confirmUpdate"
    />

    <div v-if="store.loading && !store.updating" class="text-center py-5">
      <CSpinner color="primary" />
      <p class="mt-3 mb-0 text-body-secondary">Cargando indicadores...</p>
    </div>

    <CAlert v-else-if="store.connectionError" color="danger">
      No hay conexión con el servicio. Verifique Laravel y Django.
    </CAlert>

    <CAlert v-else-if="store.error" color="warning">
      {{ store.error }}
    </CAlert>

    <template v-else-if="!store.updating">
      <AcademicRiskDashKpis :summary="store.summary" />

      <AcademicRiskDashAlerts
        :alerts="store.alerts"
        :classrooms="store.classrooms"
        @open-student="goToStudent"
        @open-classroom="goToOperational"
      />

      <AcademicRiskDashInsights
        :factors="store.insights.top_factors"
        :recommendations="store.insights.top_recommendations"
        :merit="store.insights.top_merit"
        :punctuality="store.insights.top_punctuality"
        @open-all="openInsightsModal"
        @open-student="goToStudent"
      />
    </template>

    <AcademicRiskDashInsightsModal
      :visible="insightsModal.visible"
      :title="insightsModal.title"
      :subtitle="insightsModal.subtitle"
      :items="insightsModal.items"
      :type="insightsModal.type"
      @close="closeInsightsModal"
    />

    <div v-if="store.updating" class="academic-risk-overlay">
      <div class="academic-risk-overlay__content">
        <CSpinner color="light" class="mb-3" />
        <h5 class="text-white mb-2">Generando predicciones...</h5>
        <p class="text-white-50 mb-3">
          {{ updateOverlayMessage }}
        </p>
        <CProgress animated :value="100" color="light" class="academic-risk-overlay__progress" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

import AcademicRiskDashAlerts from '@/components/academic-risk/AcademicRiskDashAlerts.vue'
import AcademicRiskDashFilters from '@/components/academic-risk/AcademicRiskDashFilters.vue'
import AcademicRiskDashInsights from '@/components/academic-risk/AcademicRiskDashInsights.vue'
import AcademicRiskDashInsightsModal from '@/components/academic-risk/AcademicRiskDashInsightsModal.vue'
import AcademicRiskDashKpis from '@/components/academic-risk/AcademicRiskDashKpis.vue'
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'
import { BRAND_COLOR } from '@/utils/brand'
import { toastError, toastSuccess } from '@/utils/alerts'
import { formatSkippedStudentLabel } from '@/utils/academicRiskFilters'
import {
  formatDateTime,
  formatFactorName,
  getCategoryLabel,
} from '@/utils/academicRisk'

const store = useAcademicRiskDashboardStore()
const router = useRouter()
const route = useRoute()

const insightsModal = reactive({
  visible: false,
  type: 'factors',
  title: '',
  subtitle: '',
  items: [],
})

const openInsightsModal = (type) => {
  const map = {
    factors: {
      title: 'Todos los factores frecuentes',
      items: (store.insights.top_factors || []).map((item) => ({
        ...item,
        label: formatFactorName(item.factor_name),
      })),
    },
    recommendations: {
      title: 'Todas las recomendaciones comunes',
      items: (store.insights.top_recommendations || []).map((item) => ({
        ...item,
        category_label: getCategoryLabel(item.category),
      })),
    },
    merit: {
      title: 'Ranking completo de mérito',
      items: store.insights.top_merit || [],
    },
    punctuality: {
      title: 'Ranking completo de asistencia',
      items: store.insights.top_punctuality || [],
    },
  }
  const selected = map[type]
  if (!selected) return
  insightsModal.type = type
  insightsModal.title = selected.title
  insightsModal.subtitle = 'Respeta el año, bimestre y aula seleccionados en el dashboard.'
  insightsModal.items = selected.items
  insightsModal.visible = true
}

const closeInsightsModal = () => {
  insightsModal.visible = false
}

const updateOverlayMessage = computed(() => (
  store.isAllClassrooms
    ? 'El modelo de Machine Learning está procesando todas las aulas de su alcance. Esto puede tardar varios minutos.'
    : 'El modelo de Machine Learning está procesando el aula seleccionada.'
))

const goToOperational = (classroomOrId = null) => {
  const gradeSectionId = typeof classroomOrId === 'object'
    ? classroomOrId?.grade_section_id
    : classroomOrId
  router.push({
    path: '/prediccion/academic-risk',
    query: {
      school_year: store.filters.schoolYear || undefined,
      bimester: store.filters.bimester || undefined,
      grade_section_id: gradeSectionId || store.filters.gradeSectionId || undefined,
    },
  })
}

const goToStudent = (item) => {
  if (!item?.student_id) return
  router.push(`/edit-student/${item.student_id}`)
}

const buildSkippedStudentsHtml = (skippedStudents = []) => {
  if (!skippedStudents.length) return ''
  const items = skippedStudents
    .slice(0, 40)
    .map((item) => `<li>${formatSkippedStudentLabel(item)}</li>`)
    .join('')
  const more = skippedStudents.length > 40
    ? `<p class="mt-2 mb-0"><small>… y ${skippedStudents.length - 40} más</small></p>`
    : ''
  return `<p class="mb-2 mt-3">No se pudo calcular la predicción de:</p><ul class="text-start mb-0">${items}</ul>${more}`
}

const showUpdateResult = (payload = {}) => {
  const processed = Number(payload.students_processed ?? 0)
  const classroomsOk = Number(
    payload.classrooms_processed ?? (processed > 0 ? 1 : 0),
  )
  const skippedStudents = payload.skipped_students || []

  if (!skippedStudents.length && (classroomsOk > 0 || processed > 0)) {
    toastSuccess(payload.message || 'Predicciones actualizadas correctamente.')
    return
  }

  Swal.fire({
    icon: processed > 0 || classroomsOk > 0 ? 'success' : 'warning',
    title: (classroomsOk > 0 || processed > 0) ? 'Predicciones actualizadas' : 'Sin predicciones generadas',
    html: `<p>${payload.message || 'Proceso finalizado.'}</p>${buildSkippedStudentsHtml(skippedStudents)}`,
    confirmButtonText: 'Entendido',
    confirmButtonColor: BRAND_COLOR,
  })
}

const confirmUpdate = async () => {
  const aulaLabel = store.isAllClassrooms
    ? 'todas las aulas de su alcance'
    : `el aula <strong>${store.selectedGradeSection?.label || ''}</strong>`

  const result = await Swal.fire({
    title: '¿Actualizar predicciones?',
    html: `Se ejecutará el modelo para ${aulaLabel} del año <strong>${store.filters.schoolYear}</strong> y bimestre vigente.<br><br>Solo aplica al periodo activo. Puede tardar varios minutos.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: store.isAllClassrooms ? 'Actualizar todas' : 'Actualizar aula',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: BRAND_COLOR,
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    const payload = await store.updatePredictions()
    showUpdateResult(payload)
  } catch (err) {
    const data = err.validationPayload || err.response?.data || {}
    if (data.skipped_students?.length || data.classrooms_processed != null || data.students_processed != null) {
      showUpdateResult(data)
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
  if (route.query.grade_section_id) {
    store.filters.gradeSectionId = Number(route.query.grade_section_id)
  }
  await store.bootstrapOverview()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
