<template>
  <div class="module-page student-merit">
    <div class="module-filter-bar student-merit__filters">
      <div class="student-merit__period-field">
        <CFormLabel for="student-merit-period">Periodo</CFormLabel>
        <CFormSelect
          id="student-merit-period"
          :model-value="selectedPeriod"
          :disabled="loading || !periodOptions.length"
          @update:model-value="onPeriodChange"
        >
          <option
            v-for="opt in periodOptions"
            :key="opt.key"
            :value="opt.key"
            :disabled="opt.available === false"
          >
            {{ opt.label }}
          </option>
        </CFormSelect>
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando orden de mérito...
    </div>

    <template v-else-if="me">
      <div class="module-card student-merit__summary mb-4">
        <div class="module-card__body">
          <p class="student-merit__eyebrow mb-2">{{ selectedLabel || 'Periodo seleccionado' }}</p>
          <div class="student-merit__grid">
            <div class="student-merit__stat">
              <span class="student-merit__stat-label">Tu posición</span>
              <strong class="student-merit__stat-value">
                <template v-if="me.rank != null">
                  #{{ me.rank }}
                  <small>de {{ me.ranked_count || rankedCount }}</small>
                </template>
                <template v-else>—</template>
              </strong>
              <span v-if="me.rank == null" class="student-merit__stat-hint">
                Aún sin notas en este periodo
              </span>
            </div>

            <div class="student-merit__stat">
              <span class="student-merit__stat-label">Tu promedio</span>
              <strong class="student-merit__stat-value student-merit__stat-value--avg">
                <template v-if="me.has_average">
                  <ScoreLevelBadge :score="me.average_label" />
                  <span>({{ formatScore(me.average_score) }})</span>
                </template>
                <template v-else>—</template>
              </strong>
            </div>

            <div class="student-merit__stat">
              <span class="student-merit__stat-label">Top</span>
              <strong class="student-merit__stat-value">
                <span
                  v-if="me.top_label"
                  class="student-merit__top-badge"
                  :class="`student-merit__top-badge--${me.top_band || 'none'}`"
                >
                  {{ me.top_label }}
                </span>
                <span v-else class="text-body-secondary">
                  {{ me.has_average ? 'Sin top' : '—' }}
                </span>
              </strong>
            </div>
          </div>
        </div>
      </div>

      <section class="module-card">
        <div class="module-card__header">
          <i class="fas fa-list-ul me-2" aria-hidden="true"></i>
          Competencias evaluadas
        </div>
        <div class="module-card__body">
          <EmptyState
            v-if="!competencies.length"
            icon="📋"
            title="Sin competencias configuradas"
            hint="Las competencias de esta área aparecerán cuando estén registradas."
            compact
          />
          <div v-else class="competency-list">
            <article
              v-for="item in competencies"
              :key="item.id"
              class="competency-card"
            >
              <header class="competency-card__header">
                <span class="competency-card__code">{{ item.number || item.code || '—' }}</span>
                <h3 class="competency-card__title">{{ item.name }}</h3>
              </header>
              <p class="competency-card__description">
                {{ item.description || 'Sin descripción registrada para esta competencia.' }}
              </p>
            </article>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import EmptyState from '@/components/academic/EmptyState.vue'
import ScoreLevelBadge from '@/components/academic/ScoreLevelBadge.vue'

const route = useRoute()
const courseClassId = computed(() => Number(route.params.courseClass))

const loading = ref(true)
const loadError = ref('')
const me = ref(null)
const competencies = ref([])
const periodOptions = ref([])
const selectedPeriod = ref('')
const selectedLabel = ref('')
const rankedCount = ref(0)

const formatScore = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(3)
}

const applyPayload = (data) => {
  periodOptions.value = data.period_options || []
  selectedPeriod.value = data.selected?.key || data.default_key || ''
  selectedLabel.value = data.selected?.label || ''
  competencies.value = data.competencies || []
  rankedCount.value = Number(data.ranked_count || 0)
  me.value = data.me || null
}

const loadMyMerit = async (periodKey = null) => {
  if (!courseClassId.value) return
  loading.value = true
  loadError.value = ''
  try {
    const response = await CompetencyScoreService.myMerit(
      courseClassId.value,
      periodKey,
    )
    if (response.data?.success) {
      applyPayload(response.data.data || {})
    } else {
      loadError.value = response.data?.message || 'No se pudo cargar tu orden de mérito.'
      me.value = null
    }
  } catch (error) {
    loadError.value =
      error.response?.data?.message || 'Error al cargar tu orden de mérito.'
    me.value = null
  } finally {
    loading.value = false
  }
}

const onPeriodChange = async (value) => {
  selectedPeriod.value = String(value)
  await loadMyMerit(selectedPeriod.value)
}

watch(courseClassId, (id) => {
  if (id) loadMyMerit(null)
})

onMounted(() => loadMyMerit(null))
</script>

<style scoped>
.student-merit__filters {
  align-items: flex-end;
}

.student-merit__period-field {
  flex: 0 1 16rem;
  max-width: 100%;
}

.student-merit__eyebrow {
  margin: 0;
  font-size: var(--rp-text-xs);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: var(--rp-tracking-wide);
  text-transform: uppercase;
  color: var(--rp-text-brand);
}

.student-merit__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-4);
}

.student-merit__stat-label {
  display: block;
  font-size: var(--rp-text-xs);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--rp-tracking-wide);
  margin-bottom: var(--rp-space-1);
}

.student-merit__stat-value {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  font-size: var(--rp-text-xl);
  color: var(--rp-text-heading);
  line-height: 1.2;
}

.student-merit__stat-value small {
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-medium);
  color: var(--rp-text-muted);
}

.student-merit__stat-value--avg {
  font-size: var(--rp-text-lg);
}

.student-merit__stat-hint {
  display: block;
  margin-top: var(--rp-space-1);
  font-size: var(--rp-text-xs);
  color: var(--rp-text-subtle);
}

.student-merit__top-badge {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--rp-radius-pill);
  background: var(--rp-surface-brand-soft);
  border: 1px solid var(--rp-border-brand);
  color: var(--rp-text-brand);
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold);
}

.student-merit__top-badge--decimo_superior {
  background: var(--rp-success-100);
  border-color: var(--rp-success-500);
  color: var(--rp-success-800);
}

.student-merit__top-badge--quinto_superior {
  background: var(--rp-brand-100);
  border-color: var(--rp-brand-400);
  color: var(--rp-brand-700);
}

.student-merit__top-badge--tercio_superior {
  background: var(--rp-warning-100);
  border-color: var(--rp-warning-500);
  color: var(--rp-warning-700);
}

.competency-list {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
}

.competency-card {
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-muted);
  padding: 0.85rem 1rem;
}

.competency-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--rp-space-2);
  margin-bottom: 0.35rem;
}

.competency-card__code {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  border-radius: var(--rp-radius-sm);
  background: var(--rp-brand-500);
  color: #fff;
  font-size: 0.72rem;
  font-weight: var(--rp-weight-bold);
}

.competency-card__title {
  margin: 0;
  font-size: var(--rp-text-md);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: 1.3;
}

.competency-card__description {
  margin: 0;
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: 1.4;
}

@media (min-width: 768px) {
  .student-merit__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
