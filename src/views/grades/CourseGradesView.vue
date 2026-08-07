<template>
  <div class="module-page course-grades-view">
    <ModulePageHeader
      icon="fas fa-chart-bar"
      title="Libreta de notas"
      :subtitle="headerSubtitle"
    >
      <template #actions>
        <CButton v-if="isTeacher" color="primary" variant="outline" @click="goImport">
          <i class="fas fa-file-import me-2"></i>Importar SIAGIE
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="period?.name" class="module-filter-bar grades-meta">
      <span class="text-body-secondary">
        Periodo activo: <strong>{{ period.name }}</strong>
        <template v-if="period.year"> ({{ period.year }})</template>
      </span>
      <span v-if="students.length" class="text-body-secondary small">
        <i class="fas fa-users me-1"></i>{{ students.length }} alumno(s)
      </span>
    </div>

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
              <tr v-for="student in students" :key="student.student_id">
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
        <p v-if="competencies.length" class="grades-legend">
          Subcolumnas:
          <span v-for="(comp, idx) in competencies" :key="comp.id">
            <strong>{{ comp.number || comp.code }}</strong> {{ comp.name }}<span v-if="idx < competencies.length - 1"> · </span>
          </span>
        </p>
      </div>

      <!-- Mobile: acordeón por alumno -->
      <div class="grades-mobile">
        <details
          v-for="student in students"
          :key="`m-${student.student_id}`"
          class="student-accordion"
        >
          <summary>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'
import ScoreLevelBadge from '@/components/academic/ScoreLevelBadge.vue'

const route = useRoute()
const router = useRouter()

const courseClassId = Number(route.params.courseClass)
const isTeacher = computed(() => route.path.includes('/courses/teacher/'))

const period = ref(null)
const bimesters = ref([])
const courseName = ref('')
const competencies = ref([])
const students = ref([])
const loading = ref(true)
const loadError = ref('')

const headerSubtitle = computed(() => {
  if (!courseName.value) return 'Niveles de logro de los 4 bimestres del periodo activo'
  return `${courseName.value} · 4 bimestres del periodo activo`
})

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
      courseName.value = data.course_name || ''
      period.value = data.period || null
      bimesters.value = data.bimesters || []
      competencies.value = data.competencies || []
      students.value = data.students || []
    } else {
      loadError.value = response.data?.message || 'No se pudieron cargar las notas.'
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar notas.'
  } finally {
    loading.value = false
  }
}

const goImport = () => router.push(`/courses/teacher/${courseClassId}/import`)
const goBack = () =>
  router.push(isTeacher.value ? '/courses/teacher/list' : '/courses/student/list')

onMounted(loadGrades)
</script>

<style scoped>
.grades-meta {
  justify-content: space-between;
  gap: 0.75rem;
}

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
  border: 1px solid var(--rp-border);
  padding: 0.45rem 0.4rem;
  vertical-align: middle;
}

.grades-matrix thead th {
  background: var(--rp-surface-sunken, #f3f4f6);
  color: var(--rp-text-heading);
  font-weight: var(--rp-weight-semibold);
  text-align: center;
}

.bimester-group {
  background: var(--rp-brand-50, #e8f0fe) !important;
  color: var(--rp-brand-700, #1d4ed8) !important;
  white-space: nowrap;
}

.comp-subcol {
  font-size: 0.75rem;
  min-width: 2.6rem;
  max-width: 3.2rem;
}

.grades-sticky-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--rp-surface);
  min-width: 12rem;
  text-align: left !important;
  box-shadow: 1px 0 0 var(--rp-border);
}

thead .grades-sticky-col {
  z-index: 3;
  background: var(--rp-surface-sunken, #f3f4f6);
}

.student-name {
  font-size: 0.84rem;
  line-height: 1.25;
}

.score-cell {
  text-align: center;
}

.grades-legend {
  margin: 0.75rem 0.15rem 0;
  font-size: 0.78rem;
  color: var(--rp-text-muted);
  line-height: 1.4;
}

.student-accordion {
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  background: var(--rp-surface);
  margin-bottom: 0.65rem;
  overflow: hidden;
}

.student-accordion summary {
  list-style: none;
  cursor: pointer;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.student-accordion summary::-webkit-details-marker {
  display: none;
}

.student-accordion__name {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.student-accordion__dni {
  font-size: 0.8rem;
  color: var(--rp-text-muted);
}

.student-accordion__body {
  border-top: 1px solid var(--rp-border);
  padding: 0.5rem;
  overflow-x: auto;
}

.mobile-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.mobile-matrix th,
.mobile-matrix td {
  border: 1px solid var(--rp-border);
  padding: 0.4rem 0.35rem;
  vertical-align: top;
}

.mobile-matrix thead th {
  background: var(--rp-surface-sunken, #f3f4f6);
  font-weight: var(--rp-weight-semibold);
}

.comp-code {
  font-weight: 700;
  font-size: 0.75rem;
}

.comp-name {
  font-size: 0.72rem;
  color: var(--rp-text-muted);
  line-height: 1.2;
}

@media (max-width: 767.98px) {
  .grades-desktop {
    display: none;
  }

  .grades-mobile {
    display: block;
  }
}
</style>
