<template>
  <div class="module-page course-merit">
    <div class="module-filter-bar course-merit__filters">
      <div class="course-merit__period-field">
        <CFormLabel for="merit-period">Periodo</CFormLabel>
        <CFormSelect
          id="merit-period"
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
      <p v-if="metaHint" class="course-merit__meta mb-0">{{ metaHint }}</p>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando orden de mérito...
    </div>

    <EmptyState
      v-else-if="!students.length"
      icon="🏅"
      title="Sin alumnos en este curso"
      hint="Cuando haya alumnos matriculados, verá aquí el orden de mérito del área."
    />

    <div v-else class="modern-table-shell">
      <CTable class="mb-0" hover responsive>
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell class="text-center" style="width: 4rem">#</CTableHeaderCell>
            <CTableHeaderCell>Alumno</CTableHeaderCell>
            <CTableHeaderCell class="text-center" style="width: 9rem">Promedio</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="row in students" :key="row.student_id">
            <CTableDataCell class="text-center fw-semibold">
              {{ row.rank != null ? row.rank : '—' }}
            </CTableDataCell>
            <CTableDataCell>
              <div class="fw-semibold">{{ row.full_name }}</div>
              <div v-if="row.dni" class="small text-body-secondary">DNI {{ row.dni }}</div>
            </CTableDataCell>
            <CTableDataCell class="text-center">
              <template v-if="row.has_average">
                <ScoreLevelBadge :score="row.average_label" />
                <span class="course-merit__score-num">({{ formatScore(row.average_score) }})</span>
              </template>
              <span v-else class="text-body-secondary">—</span>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
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
const students = ref([])
const periodOptions = ref([])
const selectedPeriod = ref('')
const rankedCount = ref(0)
const totalStudents = ref(0)
const selectedLabel = ref('')

const metaHint = computed(() => {
  if (!selectedLabel.value) return ''
  return `${selectedLabel.value} · ${rankedCount.value} con nota · ${totalStudents.value} alumnos`
})

const formatScore = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(3)
}

const applyPayload = (data) => {
  periodOptions.value = data.period_options || []
  selectedPeriod.value = data.selected?.key || data.default_key || ''
  selectedLabel.value = data.selected?.label || ''
  students.value = data.students || []
  rankedCount.value = Number(data.ranked_count || 0)
  totalStudents.value = Number(data.total_students || 0)
}

const loadRanking = async (periodKey = null) => {
  if (!courseClassId.value) return
  loading.value = true
  loadError.value = ''
  try {
    const response = await CompetencyScoreService.meritRanking(
      courseClassId.value,
      periodKey,
    )
    if (response.data?.success) {
      applyPayload(response.data.data || {})
    } else {
      loadError.value = response.data?.message || 'No se pudo cargar el orden de mérito.'
      students.value = []
    }
  } catch (error) {
    loadError.value =
      error.response?.data?.message || 'Error al cargar el orden de mérito.'
    students.value = []
  } finally {
    loading.value = false
  }
}

const onPeriodChange = async (value) => {
  selectedPeriod.value = String(value)
  await loadRanking(selectedPeriod.value)
}

watch(courseClassId, (id) => {
  if (id) loadRanking(null)
})

onMounted(() => loadRanking(null))
</script>

<style scoped>
.course-merit__filters {
  align-items: flex-end;
}

.course-merit__period-field {
  flex: 0 1 16rem;
  max-width: 100%;
}

.course-merit__meta {
  flex: 1 1 12rem;
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  padding-bottom: 0.35rem;
}

.course-merit__score-num {
  margin-left: 0.35rem;
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  white-space: nowrap;
}
</style>
