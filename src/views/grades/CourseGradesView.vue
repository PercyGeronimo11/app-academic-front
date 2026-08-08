<template>
  <div class="course-grades-view">
    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando notas...
    </div>

    <EmptyState
      v-else-if="!students.length"
      icon="📊"
      title="Sin alumnos en este curso"
      hint="Cuando haya alumnos matriculados e importaciones SIAGIE, verá aquí los 4 bimestres."
    />

    <template v-else>
      <!-- Desktop: alumnos × B1-B4 (subcolumnas competencias) -->
      <div class="grades-desktop">
        <div class="grades-table-wrap">
          <table class="grades-matrix">
            <thead>
              <tr>
                <th class="grades-index-col" rowspan="2">#</th>
                <th class="grades-sticky-col" rowspan="2">Alumno</th>
                <th
                  v-for="b in displayBimesters"
                  :key="`bh-${b.number}`"
                  class="bimester-group"
                  :colspan="Math.max(competencies.length, 1)"
                >
                  {{ shortBimesterLabel(b) }}
                </th>
              </tr>
              <tr>
                <template v-for="b in displayBimesters" :key="`bc-${b.number}`">
                  <th
                    v-for="comp in competencies"
                    :key="`${b.number}-${comp.id}`"
                    class="comp-subcol"
                    :title="comp.name"
                  >
                    {{ comp.number || comp.code || '—' }}
                  </th>
                  <th v-if="!competencies.length" class="comp-subcol">—</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in students" :key="student.student_id">
                <td class="grades-index-col">{{ index + 1 }}</td>
                <td class="grades-sticky-col">
                  <div class="fw-semibold student-name">{{ student.student_name }}</div>
                  <div class="small text-body-secondary">DNI {{ student.dni }}</div>
                </td>
                <template v-for="b in displayBimesters" :key="`br-${student.student_id}-${b.number}`">
                  <td
                    v-for="comp in competencies"
                    :key="`${student.student_id}-${b.number}-${comp.id}`"
                    class="score-cell"
                    :title="scoreTitle(student, b.number, comp)"
                  >
                    <ScoreLevelBadge :score="scoreFor(student, b.number, comp.id)" />
                  </td>
                  <td v-if="!competencies.length" class="score-cell">—</td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile: acordeón por alumno -->
      <div class="grades-mobile">
        <details
          v-for="(student, index) in students"
          :key="`m-${student.student_id}`"
          class="student-accordion"
        >
          <summary>
            <span class="student-accordion__index">{{ index + 1 }}.</span>
            <span class="student-accordion__name">{{ student.student_name }}</span>
            <span class="student-accordion__dni">DNI {{ student.dni }}</span>
          </summary>
          <div class="student-accordion__body">
            <table class="mobile-matrix">
              <thead>
                <tr>
                  <th>Competencia</th>
                  <th v-for="b in displayBimesters" :key="`mh-${b.number}`" class="text-center">
                    {{ shortBimesterLabel(b) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="comp in competencies" :key="`mr-${student.student_id}-${comp.id}`">
                  <td>
                    <div class="comp-code">{{ comp.number || comp.code }}</div>
                    <div class="comp-name">{{ comp.name }}</div>
                  </td>
                  <td
                    v-for="b in displayBimesters"
                    :key="`mc-${student.student_id}-${comp.id}-${b.number}`"
                    class="text-center"
                    :title="scoreTitle(student, b.number, comp)"
                  >
                    <ScoreLevelBadge :score="scoreFor(student, b.number, comp.id)" />
                  </td>
                </tr>
                <tr v-if="!competencies.length">
                  <td colspan="5" class="text-body-secondary text-center py-3">
                    Sin competencias configuradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import EmptyState from '@/components/academic/EmptyState.vue'
import ScoreLevelBadge from '@/components/academic/ScoreLevelBadge.vue'

const route = useRoute()

const courseClassId = Number(route.params.courseClass)
const gradesReloadToken = inject('courseGradesReloadToken', null)
const setCourseStudentsCount = inject('setCourseStudentsCount', null)
const setCourseCompetenciesLegend = inject('setCourseCompetenciesLegend', null)

const period = ref(null)
const bimesters = ref([])
const competencies = ref([])
const students = ref([])
const loading = ref(true)
const loadError = ref('')

const displayBimesters = computed(() => {
  const byNumber = new Map((bimesters.value || []).map((b) => [Number(b.number), b]))
  return [1, 2, 3, 4].map(
    (number) => byNumber.get(number) || { number, name: `Bimestre ${number}` }
  )
})

const shortBimesterLabel = (b) => {
  const labels = { 1: '1° bim.', 2: '2° bim.', 3: '3° bim.', 4: '4° bim.' }
  return labels[Number(b.number)] || `B${b.number}`
}

const scoreFor = (student, bimesterNumber, competencyId) => {
  const cell = student?.scores_by_bimester?.[String(bimesterNumber)]?.[String(competencyId)]
  return cell?.score || ''
}

const scoreTitle = (student, bimesterNumber, comp) => {
  const cell = student?.scores_by_bimester?.[String(bimesterNumber)]?.[String(comp.id)]
  const parts = [comp.name]
  if (cell?.observations) parts.push(cell.observations)
  return parts.filter(Boolean).join(' — ')
}

const loadGrades = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await CompetencyScoreService.listByCourseClassPeriod(courseClassId)
    if (response.data?.success) {
      const data = response.data.data || {}
      period.value = data.period || null
      bimesters.value = data.bimesters || []
      competencies.value = data.competencies || []
      students.value = data.students || []
      setCourseStudentsCount?.(students.value.length)
      setCourseCompetenciesLegend?.(competencies.value)
    } else {
      loadError.value = response.data?.message || 'No se pudieron cargar las notas.'
      setCourseStudentsCount?.(0)
      setCourseCompetenciesLegend?.([])
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar notas.'
    setCourseStudentsCount?.(0)
    setCourseCompetenciesLegend?.([])
  } finally {
    loading.value = false
  }
}

onMounted(loadGrades)

if (gradesReloadToken) {
  watch(gradesReloadToken, () => {
    loadGrades()
  })
}
</script>

<style scoped>
.grades-desktop {
  display: block;
}

.grades-mobile {
  display: none;
}

.grades-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  background: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
}

.grades-matrix {
  width: 100%;
  border-collapse: collapse;
  min-width: 48rem;
  font-size: 0.85rem;
}

.grades-matrix th,
.grades-matrix td {
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.45rem 0.4rem;
  vertical-align: middle;
}

.grades-matrix tbody td {
  border-color: var(--rp-border);
}

.grades-matrix thead th {
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  font-weight: var(--rp-weight-semibold);
  text-align: center;
}

.bimester-group {
  background: var(--rp-brand-600) !important;
  color: var(--rp-text-on-brand) !important;
  white-space: nowrap;
}

.comp-subcol {
  font-size: 0.75rem;
  min-width: 2.6rem;
  max-width: 3.2rem;
  background: var(--rp-brand-500) !important;
  color: var(--rp-text-on-brand) !important;
}

.grades-index-col {
  width: 2.5rem;
  text-align: center !important;
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-muted);
  background: var(--rp-surface);
}

thead .grades-index-col {
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
}

.grades-sticky-col {
  position: sticky;
  left: 2.5rem;
  z-index: 2;
  background: var(--rp-surface);
  min-width: 12rem;
  text-align: left !important;
  box-shadow: 1px 0 0 var(--rp-border);
}

thead .grades-sticky-col {
  z-index: 3;
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  left: 2.5rem;
}

.grades-index-col {
  position: sticky;
  left: 0;
  z-index: 2;
}

thead .grades-index-col {
  z-index: 4;
}

.student-name {
  font-size: 0.84rem;
  line-height: 1.25;
}

.score-cell {
  text-align: center;
}

.student-accordion {
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface);
  margin-bottom: 0.5rem;
}

.student-accordion summary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.65rem;
  padding: 0.7rem 0.85rem;
  cursor: pointer;
  list-style: none;
}

.student-accordion summary::-webkit-details-marker {
  display: none;
}

.student-accordion__index {
  font-weight: 700;
  color: var(--rp-text-muted);
  min-width: 1.5rem;
}

.student-accordion__name {
  font-weight: 700;
  color: var(--rp-text-heading);
}

.student-accordion__dni {
  font-size: 0.8rem;
  color: var(--rp-text-muted);
}

.student-accordion__body {
  padding: 0 0.75rem 0.75rem;
}

.mobile-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.mobile-matrix th,
.mobile-matrix td {
  border: 1px solid var(--rp-border);
  padding: 0.4rem;
  vertical-align: middle;
}

.mobile-matrix thead th {
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  text-align: center;
}

.comp-code {
  font-weight: 700;
}

.comp-name {
  font-size: 0.72rem;
  color: var(--rp-text-muted);
}

@media (max-width: 991.98px) {
  .grades-desktop {
    display: none;
  }

  .grades-mobile {
    display: block;
  }
}
</style>
