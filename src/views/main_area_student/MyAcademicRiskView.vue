<template>
  <div class="my-risk-page module-page">
    <CCard class="shadow-sm border-0 mb-3">
      <CCardBody class="py-3 px-3 px-md-4">
        <div class="my-risk-header">
          <div class="my-risk-header__intro">
            <h1 class="my-risk-header__title mb-1">Mi riesgo académico</h1>
            <p class="my-risk-header__subtitle mb-0">
              Consulta tu nivel de riesgo, los factores que más influyen y las recomendaciones del bimestre que elijas.
            </p>
          </div>

          <div class="my-risk-filters">
            <div class="my-risk-filters__field">
              <span class="my-risk-filters__label">Periodo activo</span>
              <div class="my-risk-period">{{ schoolYearLabel }}</div>
            </div>
            <div class="my-risk-filters__field">
              <label class="my-risk-filters__label" for="my-risk-bimester">Bimestre</label>
              <CFormSelect
                id="my-risk-bimester"
                v-model="selectedBimester"
                :disabled="loading || !bimesterOptions.length"
              >
                <option v-if="!bimesterOptions.length" value="">Sin bimestres</option>
                <option
                  v-for="item in bimesterOptions"
                  :key="item.id"
                  :value="String(item.number)"
                >
                  {{ item.name || `Bimestre ${item.number}` }}
                </option>
              </CFormSelect>
            </div>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <CCard class="shadow-sm border-0">
      <CCardBody class="py-3 px-3 px-md-4">
        <div v-if="loading" class="my-risk-state">
          <CSpinner color="primary" class="me-2" />
          Cargando tu predicción...
        </div>

        <div v-else-if="error" class="alert alert-warning mb-0">
          {{ error }}
        </div>

        <section v-else-if="!prediction" class="my-risk-empty">
          <div class="my-risk-empty__icon" aria-hidden="true">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <h2>Aún no hay predicción</h2>
          <p>
            Para este bimestre todavía no se ha generado tu nivel de riesgo.
            Cuando dirección o tu docente actualicen las predicciones, aparecerá aquí el detalle.
          </p>
        </section>

        <template v-else>
          <section class="my-risk-summary mb-4" :class="summaryToneClass">
            <div class="my-risk-summary__icon" aria-hidden="true">
              <i class="fas" :class="summaryIcon"></i>
            </div>
            <div class="my-risk-summary__body">
              <p class="my-risk-summary__label mb-1">Tu nivel de riesgo</p>
              <h2 class="my-risk-summary__value mb-2">
                {{ prediction.risk_label || getRiskLabel(prediction.risk_level) }}
              </h2>
              <p class="my-risk-summary__meta mb-0">
                Confianza {{ formatConfidence(prediction.confidence) }}
                <span v-if="prediction.prediction_date">
                  · Actualizado {{ formatDateTime(prediction.prediction_date) }}
                </span>
              </p>
              <p class="my-risk-summary__guide mb-0 mt-2">{{ guideMessage }}</p>
            </div>
          </section>

          <div class="my-risk-columns">
            <section class="my-risk-panel">
              <div class="my-risk-panel__head">
                <h3>
                  <i class="fas fa-flask me-2" aria-hidden="true"></i>
                  Factores
                </h3>
                <p>Aspectos que más influyeron en tu predicción.</p>
              </div>
              <AcademicRiskFactors
                :factors="prediction.factors || []"
                :risk-level="prediction.risk_level"
              />
            </section>

            <section class="my-risk-panel">
              <div class="my-risk-panel__head">
                <h3>
                  <i class="fas fa-lightbulb me-2" aria-hidden="true"></i>
                  Recomendaciones
                </h3>
                <p>Acciones sugeridas según tu nivel de riesgo.</p>
              </div>
              <AcademicRiskRecommendations
                :recommendations="prediction.recommendations || []"
                :risk-level="prediction.risk_level"
              />
            </section>
          </div>
        </template>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import AcademicRiskFactors from '@/components/academic-risk/AcademicRiskFactors.vue'
import AcademicRiskRecommendations from '@/components/academic-risk/AcademicRiskRecommendations.vue'
import BimesterService from '@/services/BimesterService'
import MLService from '@/services/MLService'
import StudentService from '@/services/StudentService'
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
import { resolveActivePeriod } from '@/utils/schoolPeriodDefaults'

const PREDICTABLE_NUMBERS = [1, 2, 3]

const loading = ref(true)
const error = ref('')
const schoolYear = ref(null)
const periodName = ref('')
const bimesterOptions = ref([])
const selectedBimester = ref('')
const predictionsByNumber = ref({})

const schoolYearLabel = computed(() => {
  if (periodName.value) return periodName.value
  return schoolYear.value ? String(schoolYear.value) : '—'
})

const prediction = computed(() => {
  const number = Number(selectedBimester.value)
  return predictionsByNumber.value[number] || null
})

const presentedFactors = computed(() => (
  presentFactorsForDisplay(prediction.value?.factors || [], prediction.value?.risk_level)
))

const presentedRecommendations = computed(() => (
  presentRecommendationsForDisplay(
    prediction.value?.recommendations || [],
    prediction.value?.risk_level,
  )
))

const guideMessage = computed(() => (
  buildRiskGuideMessage(
    prediction.value?.risk_level,
    presentedFactors.value.length,
    presentedRecommendations.value.length,
  )
))

const summaryToneClass = computed(() => {
  const level = Number(prediction.value?.risk_level)
  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) return 'my-risk-summary--ok'
  if (level === RISK_LEVELS.MEDIUM) return 'my-risk-summary--watch'
  return 'my-risk-summary--alert'
})

const summaryIcon = computed(() => {
  const level = Number(prediction.value?.risk_level)
  if (level === RISK_LEVELS.VERY_LOW || level === RISK_LEVELS.LOW) return 'fa-shield-alt'
  if (level === RISK_LEVELS.MEDIUM) return 'fa-exclamation-circle'
  return 'fa-exclamation-triangle'
})

const extractList = (response) => {
  const payload = response?.data?.data ?? response?.data
  return Array.isArray(payload) ? payload : []
}

const loadPage = async () => {
  loading.value = true
  error.value = ''
  try {
    const period = await resolveActivePeriod()
    const year = Number(period?.year) || new Date().getFullYear()
    schoolYear.value = year
    periodName.value = period?.name ? String(period.name) : String(year)

    const [profileResponse, bimesterResponse] = await Promise.all([
      StudentService.getProfile(),
      BimesterService.list(year),
    ])

    const studentId = profileResponse?.data?.data?.id
    if (!studentId) {
      error.value = 'No se encontró tu ficha de estudiante.'
      return
    }

    bimesterOptions.value = extractList(bimesterResponse)
      .filter((item) => PREDICTABLE_NUMBERS.includes(Number(item.number)))
      .sort((a, b) => Number(a.number) - Number(b.number))

    const predictionResponse = await MLService.getPredictionsByStudent(studentId, {
      school_year: year,
    })
    const grouped = {}
    extractList(predictionResponse).forEach((item) => {
      const number = Number(item.bimester_number)
      if (!PREDICTABLE_NUMBERS.includes(number) || grouped[number]) return
      grouped[number] = item
    })
    predictionsByNumber.value = grouped

    const withResult = Object.keys(grouped).map(Number)
    const fallback = bimesterOptions.value.at(-1)?.number
    const chosen = withResult.length ? Math.max(...withResult) : fallback
    selectedBimester.value = chosen != null ? String(chosen) : ''
  } catch (err) {
    error.value = err?.response?.data?.error
      || 'No se pudo cargar tu predicción. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)
</script>

<style scoped>
.my-risk-header__intro {
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--cui-border-color, #d8dbe0);
}

.my-risk-header__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--cui-primary, #321fdb);
}

.my-risk-header__subtitle {
  color: var(--cui-secondary-color, #64748b);
  max-width: 42rem;
}

.my-risk-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
}

.my-risk-filters__field {
  min-width: 0;
}

.my-risk-filters__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cui-secondary-color, #64748b);
}

.my-risk-period {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--cui-border-color, #d8dbe0);
  border-radius: 0.375rem;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 700;
}

.my-risk-filters :deep(.form-select) {
  min-height: 44px;
}

.my-risk-state {
  display: flex;
  align-items: center;
  color: var(--cui-secondary-color, #64748b);
  padding: 1.5rem 0;
}

.my-risk-empty {
  text-align: center;
  padding: 1.5rem 0.5rem;
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

.my-risk-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.my-risk-panel {
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem 1rem 1.15rem;
  background: #fff;
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

@media (min-width: 768px) {
  .my-risk-header__title {
    font-size: 1.5rem;
  }

  .my-risk-filters {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    max-width: 40rem;
  }

  .my-risk-columns {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>
