<template>
  <div class="my-risk-page module-page">
    <header class="my-risk-hero mb-4">
      <div>
        <p class="my-risk-hero__eyebrow mb-1">Alerta temprana personal</p>
        <h1 class="my-risk-hero__title mb-1">Mi riesgo académico</h1>
        <p class="my-risk-hero__subtitle mb-0">
          Consulta tu nivel de riesgo del bimestre, los factores que más influyen y las recomendaciones para mejorar.
        </p>
      </div>
    </header>

    <CCard class="shadow-sm border-0 mb-3">
      <CCardBody class="p-3 p-md-4">
        <div class="my-risk-filters">
          <div class="my-risk-filters__field">
            <CFormLabel class="my-risk-filters__label">Año escolar</CFormLabel>
            <CFormSelect
              :model-value="store.filters.schoolYear"
              :disabled="store.loading"
              @change="onSchoolYearChange"
            >
              <option v-for="year in store.schoolYears" :key="year" :value="year">
                {{ year }}
              </option>
            </CFormSelect>
          </div>
          <div class="my-risk-filters__field">
            <CFormLabel class="my-risk-filters__label">Bimestre</CFormLabel>
            <CFormSelect
              :model-value="store.filters.bimester"
              :disabled="store.loading || !store.bimesters.length"
              @change="onBimesterChange"
            >
              <option v-for="item in store.bimesters" :key="item.id" :value="item.number">
                {{ item.name }}
              </option>
            </CFormSelect>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <div v-if="store.loading" class="my-risk-state">
      <CSpinner color="primary" class="me-2" />
      Cargando tu predicción...
    </div>

    <div v-else-if="store.error" class="alert alert-warning mb-0">
      {{ store.error }}
    </div>

    <template v-else-if="!row || !row.riskLevel">
      <section class="my-risk-empty">
        <div class="my-risk-empty__icon" aria-hidden="true">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <h2>Aún no hay predicción</h2>
        <p>
          Para este bimestre todavía no se ha generado tu nivel de riesgo.
          Cuando dirección o tu docente actualicen las predicciones, aparecerá aquí el detalle.
        </p>
      </section>
    </template>

    <template v-else>
      <section class="my-risk-summary mb-4" :class="summaryToneClass">
        <div class="my-risk-summary__icon" aria-hidden="true">
          <i class="fas" :class="summaryIcon"></i>
        </div>
        <div class="my-risk-summary__body">
          <p class="my-risk-summary__label mb-1">Tu nivel de riesgo</p>
          <h2 class="my-risk-summary__value mb-2">
            {{ row.riskLabel || getRiskLabel(row.riskLevel) }}
          </h2>
          <p class="my-risk-summary__meta mb-0">
            Confianza {{ formatConfidence(row.confidence) }}
            <span v-if="row.lastUpdated"> · Actualizado {{ formatDateTime(row.lastUpdated) }}</span>
          </p>
          <p class="my-risk-summary__guide mb-0 mt-2">{{ guideMessage }}</p>
        </div>
      </section>

      <nav class="my-risk-tabs mb-3" aria-label="Secciones del detalle">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="my-risk-tabs__item"
          :class="{ 'is-active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon" aria-hidden="true"></i>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count != null" class="my-risk-tabs__count">{{ tab.count }}</span>
        </button>
      </nav>

      <section v-show="activeTab === 'factors'" class="my-risk-panel">
        <div class="my-risk-panel__head">
          <h3>
            <i class="fas fa-flask me-2" aria-hidden="true"></i>
            Factores
          </h3>
          <p>Aspectos que más influyeron en tu predicción.</p>
        </div>
        <AcademicRiskFactors
          :factors="row.prediction?.factors || []"
          :risk-level="row.riskLevel"
        />
      </section>

      <section v-show="activeTab === 'recommendations'" class="my-risk-panel">
        <div class="my-risk-panel__head">
          <h3>
            <i class="fas fa-lightbulb me-2" aria-hidden="true"></i>
            Recomendaciones
          </h3>
          <p>Acciones sugeridas según tu nivel de riesgo.</p>
        </div>
        <AcademicRiskRecommendations
          :recommendations="row.prediction?.recommendations || []"
          :risk-level="row.riskLevel"
        />
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import AcademicRiskFactors from '@/components/academic-risk/AcademicRiskFactors.vue'
import AcademicRiskRecommendations from '@/components/academic-risk/AcademicRiskRecommendations.vue'
import { useAcademicRiskStore } from '@/stores/academicRisk'
import { RISK_LEVELS } from '@/types/academicRisk'
import {
  formatConfidence,
  formatDateTime,
  getRiskLabel,
} from '@/utils/academicRisk'
import {
  buildRiskGuideMessage,
  presentFactorsForDisplay,
  presentRecommendationsForDisplay,
} from '@/utils/academicRiskPresentation'

const store = useAcademicRiskStore()
const activeTab = ref('factors')

const row = computed(() => store.filteredRows[0] || store.rows[0] || null)

const presentedFactors = computed(() => (
  presentFactorsForDisplay(row.value?.prediction?.factors || [], row.value?.riskLevel)
))

const presentedRecommendations = computed(() => (
  presentRecommendationsForDisplay(
    row.value?.prediction?.recommendations || [],
    row.value?.riskLevel,
  )
))

const guideMessage = computed(() => (
  buildRiskGuideMessage(
    row.value?.riskLevel,
    presentedFactors.value.length,
    presentedRecommendations.value.length,
  )
))

const summaryToneClass = computed(() => {
  const level = Number(row.value?.riskLevel)
  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) return 'my-risk-summary--ok'
  if (level === RISK_LEVELS.MEDIUM) return 'my-risk-summary--watch'
  return 'my-risk-summary--alert'
})

const summaryIcon = computed(() => {
  const level = Number(row.value?.riskLevel)
  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) return 'fa-shield-alt'
  if (level === RISK_LEVELS.MEDIUM) return 'fa-exclamation-circle'
  return 'fa-exclamation-triangle'
})

const tabs = computed(() => [
  {
    id: 'factors',
    label: 'Factores',
    icon: 'fas fa-flask',
    count: presentedFactors.value.length,
  },
  {
    id: 'recommendations',
    label: 'Recomendaciones',
    icon: 'fas fa-lightbulb',
    count: presentedRecommendations.value.length,
  },
])

const onSchoolYearChange = (event) => {
  store.onSchoolYearChange(Number(event.target.value))
}

const onBimesterChange = (event) => {
  store.onBimesterChange(Number(event.target.value))
}

onMounted(() => {
  store.initializeFilters()
})
</script>

<style scoped>
.my-risk-page {
  max-width: 920px;
  margin-inline: auto;
}

.my-risk-hero__eyebrow {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  font-weight: 700;
}

.my-risk-hero__title {
  font-size: clamp(1.45rem, 2vw, 1.85rem);
  font-weight: 800;
  color: #0f172a;
}

.my-risk-hero__subtitle {
  color: #64748b;
  max-width: 40rem;
}

.my-risk-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
}

.my-risk-filters__label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.my-risk-state {
  display: flex;
  align-items: center;
  color: #64748b;
  padding: 1.5rem 0;
}

.my-risk-empty {
  text-align: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2.25rem 1.5rem;
}

.my-risk-empty__icon {
  width: 3.25rem;
  height: 3.25rem;
  margin: 0 auto 1rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #475569;
  font-size: 1.25rem;
}

.my-risk-empty h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.my-risk-empty p {
  margin: 0 auto;
  max-width: 32rem;
  color: #64748b;
}

.my-risk-summary {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 1.15rem 1.25rem;
}

.my-risk-summary--ok {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #ecfdf5 0%, #fff 70%);
}

.my-risk-summary--watch {
  border-color: #fde68a;
  background: linear-gradient(180deg, #fffbeb 0%, #fff 70%);
}

.my-risk-summary--alert {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff5f5 0%, #fff 70%);
}

.my-risk-summary__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #e2e8f0;
  color: #475569;
}

.my-risk-summary--ok .my-risk-summary__icon {
  background: #d1fae5;
  color: #047857;
}

.my-risk-summary--watch .my-risk-summary__icon {
  background: #fef3c7;
  color: #b45309;
}

.my-risk-summary--alert .my-risk-summary__icon {
  background: #fee2e2;
  color: #b91c1c;
}

.my-risk-summary__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
}

.my-risk-summary__value {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.my-risk-summary__meta,
.my-risk-summary__guide {
  font-size: 0.86rem;
  color: #64748b;
}

.my-risk-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.my-risk-tabs__item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.86rem;
  font-weight: 700;
}

.my-risk-tabs__item.is-active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.my-risk-tabs__count {
  min-width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.72rem;
}

.my-risk-tabs__item.is-active .my-risk-tabs__count {
  background: #dbeafe;
  color: #1e40af;
}

.my-risk-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem 1.15rem 1.25rem;
}

.my-risk-panel__head {
  margin-bottom: 1rem;
}

.my-risk-panel__head h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.my-risk-panel__head p {
  margin: 0;
  font-size: 0.86rem;
  color: #64748b;
}
</style>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
