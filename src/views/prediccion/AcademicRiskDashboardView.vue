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
                  Visión general del riesgo académico por bimestre, con alertas prioritarias y ranking de aulas.
                </p>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <CButton color="secondary" variant="outline" @click="goToClassrooms">
                  <i class="fas fa-chalkboard me-2"></i>
                  Ver aulas
                </CButton>
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

    <AcademicRiskDashFilters @apply="store.loadOverview" />

    <div v-if="store.loading" class="text-center py-5">
      <CSpinner color="primary" />
      <p class="mt-3 mb-0 text-body-secondary">Cargando indicadores...</p>
    </div>

    <CAlert v-else-if="store.connectionError" color="danger">
      No hay conexión con el servicio. Verifique Laravel y Django.
    </CAlert>

    <CAlert v-else-if="store.error" color="warning">
      {{ store.error }}
    </CAlert>

    <template v-else>
      <AcademicRiskDashKpis :summary="store.summary" />
      <AcademicRiskDashAlerts
        :alerts="store.alerts"
        @open-student="goToStudent"
      />
      <AcademicRiskDashRanking
        :classrooms="store.topClassrooms"
        @open-classroom="goToOperational"
        @go-classrooms="goToClassrooms"
      />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AcademicRiskDashAlerts from '@/components/academic-risk/AcademicRiskDashAlerts.vue'
import AcademicRiskDashFilters from '@/components/academic-risk/AcademicRiskDashFilters.vue'
import AcademicRiskDashKpis from '@/components/academic-risk/AcademicRiskDashKpis.vue'
import AcademicRiskDashRanking from '@/components/academic-risk/AcademicRiskDashRanking.vue'
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'

const store = useAcademicRiskDashboardStore()
const router = useRouter()
const route = useRoute()

const goToClassrooms = () => {
  router.push({
    path: '/prediccion/aulas',
    query: {
      school_year: store.filters.schoolYear || undefined,
      bimester: store.filters.bimester || undefined,
    },
  })
}

const goToOperational = (classroomOrId = null) => {
  const gradeSectionId = typeof classroomOrId === 'object'
    ? classroomOrId?.grade_section_id
    : classroomOrId
  router.push({
    path: '/prediccion/academic-risk',
    query: {
      school_year: store.filters.schoolYear || undefined,
      bimester: store.filters.bimester || undefined,
      grade_section_id: gradeSectionId || undefined,
    },
  })
}

const goToStudent = (item) => {
  if (!item?.student_id) return
  router.push(`/edit-student/${item.student_id}`)
}

onMounted(async () => {
  if (route.query.school_year) {
    store.filters.schoolYear = Number(route.query.school_year)
  }
  if (route.query.bimester) {
    store.filters.bimester = Number(route.query.bimester)
  }
  await store.bootstrapOverview()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
