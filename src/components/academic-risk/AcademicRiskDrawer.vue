<template>
  <COffcanvas
    class="risk-detail-drawer"
    placement="end"
    :visible="visible"
    @hide="$emit('close')"
  >
    <COffcanvasHeader class="risk-detail-drawer__header border-0">
      <div class="risk-detail-drawer__title-wrap">
        <p class="risk-detail-drawer__eyebrow mb-1">Detalle de predicción</p>
        <COffcanvasTitle class="risk-detail-drawer__title mb-0">
          {{ row?.fullName || 'Alumno' }}
        </COffcanvasTitle>
        <p v-if="row?.classroomLabel" class="risk-detail-drawer__subtitle mb-0">
          {{ row.classroomLabel }}
        </p>
      </div>
      <CCloseButton class="text-reset" @click="$emit('close')" />
    </COffcanvasHeader>

    <COffcanvasBody v-if="row" class="risk-detail-drawer__body pt-0">
      <div class="risk-detail-layout">
        <nav class="risk-detail-nav" aria-label="Secciones del detalle">
          <button
            v-for="item in sections"
            :key="item.id"
            type="button"
            class="risk-detail-nav__item"
            :class="[
              `risk-detail-nav__item--${item.id}`,
              { 'is-active': activeSection === item.id },
            ]"
            @click="activeSection = item.id"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
            <CBadge
              v-if="item.count != null"
              class="risk-detail-nav__count"
              :color="item.badgeColor"
            >
              {{ item.count }}
            </CBadge>
          </button>
        </nav>

        <div class="risk-detail-content">
          <section v-if="activeSection === 'summary'" class="risk-detail-panel risk-detail-panel--summary">
            <h6 class="risk-detail-panel__heading">Resumen</h6>

            <div class="risk-guide-banner mb-3" :class="guideBannerClass">
              <i class="fas fa-info-circle"></i>
              <p class="mb-0">{{ guideMessage }}</p>
            </div>

            <div class="risk-summary-cards">
              <div class="risk-summary-card">
                <span class="risk-summary-card__label">Alumno</span>
                <strong class="risk-summary-card__value">{{ row.fullName }}</strong>
              </div>
              <div class="risk-summary-card">
                <span class="risk-summary-card__label">Nivel de riesgo</span>
                <span
                  v-if="row.riskLevel"
                  :class="getRiskChipClass(row.riskLevel)"
                  class="risk-summary-card__chip"
                >
                  {{ getRiskLabel(row.riskLevel) }}
                </span>
                <strong v-else class="risk-summary-card__value">—</strong>
              </div>
              <div class="risk-summary-card">
                <span class="risk-summary-card__label">Confianza</span>
                <strong class="risk-summary-card__value risk-summary-card__value--accent">
                  {{ formatConfidence(row.confidence) }}
                </strong>
              </div>
            </div>
          </section>

          <section
            v-else-if="activeSection === 'factors'"
            class="risk-detail-panel risk-detail-panel--factors"
          >
            <div class="risk-detail-panel__banner">
              <i class="fas fa-flask"></i>
              <div>
                <h6 class="mb-1">Factores</h6>
                <p class="mb-0">Aspectos que más influyeron en la predicción (agrupados, sin B1/B2).</p>
              </div>
            </div>
            <AcademicRiskFactors
              :factors="row.prediction?.factors || []"
              :risk-level="row.riskLevel"
            />
          </section>

          <section
            v-else
            class="risk-detail-panel risk-detail-panel--recommendations"
          >
            <div class="risk-detail-panel__banner">
              <i class="fas fa-lightbulb"></i>
              <div>
                <h6 class="mb-1">Recomendaciones</h6>
                <p class="mb-0">Acciones priorizadas según el nivel de riesgo del alumno.</p>
              </div>
            </div>
            <AcademicRiskRecommendations
              :recommendations="row.prediction?.recommendations || []"
              :risk-level="row.riskLevel"
            />
          </section>
        </div>
      </div>
    </COffcanvasBody>
  </COffcanvas>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import AcademicRiskFactors from '@/components/academic-risk/AcademicRiskFactors.vue'
import AcademicRiskRecommendations from '@/components/academic-risk/AcademicRiskRecommendations.vue'
import { RISK_LEVELS } from '@/types/academicRisk'
import {
  formatConfidence,
  getRiskChipClass,
  getRiskLabel,
} from '@/utils/academicRisk'
import {
  buildRiskGuideMessage,
  presentFactorsForDisplay,
  presentRecommendationsForDisplay,
} from '@/utils/academicRiskPresentation'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  row: {
    type: Object,
    default: null,
  },
  initialSection: {
    type: String,
    default: 'summary',
  },
})

defineEmits(['close'])

const activeSection = ref('summary')

watch(
  () => [props.visible, props.row?.studentId, props.initialSection],
  ([visible]) => {
    if (visible) {
      activeSection.value = props.initialSection || 'summary'
    }
  },
)

const presentedFactors = computed(() => (
  presentFactorsForDisplay(props.row?.prediction?.factors || [], props.row?.riskLevel)
))

const presentedRecommendations = computed(() => (
  presentRecommendationsForDisplay(
    props.row?.prediction?.recommendations || [],
    props.row?.riskLevel,
  )
))

const guideMessage = computed(() => (
  buildRiskGuideMessage(
    props.row?.riskLevel,
    presentedFactors.value.length,
    presentedRecommendations.value.length,
  )
))

const guideBannerClass = computed(() => {
  const level = Number(props.row?.riskLevel)
  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) return 'risk-guide-banner--ok'
  if (level === RISK_LEVELS.MEDIUM) return 'risk-guide-banner--watch'
  return 'risk-guide-banner--alert'
})

const sections = computed(() => [
  {
    id: 'summary',
    label: 'Resumen',
    icon: 'fas fa-user-graduate',
    count: null,
    badgeColor: 'secondary',
  },
  {
    id: 'factors',
    label: 'Factores',
    icon: 'fas fa-flask',
    count: presentedFactors.value.length,
    badgeColor: 'primary',
  },
  {
    id: 'recommendations',
    label: 'Recomendaciones',
    icon: 'fas fa-lightbulb',
    count: presentedRecommendations.value.length,
    badgeColor: 'warning',
  },
])
</script>
