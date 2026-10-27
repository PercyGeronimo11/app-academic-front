<template>
  <div class="academic-risk-dashboard">
    <AcademicRiskDashFilters
      :show-ops-link="false"
      @apply="() => store.loadOverview({ force: true })"
    />

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
      <AcademicRiskDashAlerts :alerts="store.alerts" />

      <AcademicRiskDashInsights
        :factors="store.insights.top_factors"
        :recommendations="store.insights.top_recommendations"
        @open-all="openInsightsModal"
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
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'

import AcademicRiskDashAlerts from '@/components/academic-risk/AcademicRiskDashAlerts.vue'
import AcademicRiskDashFilters from '@/components/academic-risk/AcademicRiskDashFilters.vue'
import AcademicRiskDashInsights from '@/components/academic-risk/AcademicRiskDashInsights.vue'
import AcademicRiskDashInsightsModal from '@/components/academic-risk/AcademicRiskDashInsightsModal.vue'
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'
import {
  formatFactorName,
  getCategoryLabel,
} from '@/utils/academicRisk'

const store = useAcademicRiskDashboardStore()
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
  }
  const selected = map[type]
  if (!selected) return
  insightsModal.type = type
  insightsModal.title = selected.title
  insightsModal.subtitle = 'Respeta el bimestre, grado y sección de la consulta.'
  insightsModal.items = selected.items
  insightsModal.visible = true
}

const closeInsightsModal = () => {
  insightsModal.visible = false
}

onMounted(async () => {
  if (route.query.bimester) {
    store.filters.bimester = Number(route.query.bimester)
  }
  if (route.query.grade) {
    store.filters.grade = String(route.query.grade)
  }
  if (route.query.section) {
    store.filters.section = String(route.query.section)
  }
  await store.bootstrapOverview()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
