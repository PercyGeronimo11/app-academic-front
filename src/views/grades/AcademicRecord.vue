<template>
  <div class="module-page academic-record">
    <ModulePageHeader
      icon="fas fa-graduation-cap"
      title="Record Académico"
      :subtitle="headerSubtitle"
    >
      <template #actions>
        <CButton
          color="primary"
          variant="outline"
          :disabled="loading || !courses.length"
          @click="downloadPdf"
        >
          <i class="fas fa-file-pdf me-2"></i>Descargar PDF
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="period?.name" class="module-filter-bar academic-record__meta">
      <span class="text-body-secondary">
        Periodo activo: <strong>{{ period.name }}</strong>
        <template v-if="period.year"> ({{ period.year }})</template>
      </span>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando record académico...
    </div>

    <EmptyState
      v-else-if="!courses.length"
      icon="📖"
      title="Sin cursos en el periodo activo"
      hint="Cuando esté asignado a un aula del periodo vigente, aquí verá sus notas por bimestre."
    />

    <div v-else class="academic-record__table-wrap">
      <table class="academic-record__table">
        <thead>
          <tr>
            <th class="col-area">Área curricular</th>
            <th class="col-comp">Competencias</th>
            <th
              v-for="b in displayBimesters"
              :key="`h-${b.number}`"
              class="col-nl"
            >
              {{ shortBimesterLabel(b) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="course in courses" :key="course.course_id">
            <tr
              v-for="(comp, index) in course.competencies"
              :key="comp.competency_id"
            >
              <td
                v-if="index === 0"
                class="col-area"
                :rowspan="course.competencies.length || 1"
              >
                {{ course.course_name }}
              </td>
              <td class="col-comp">
                <div class="comp-code">{{ comp.competency_number || comp.competency_code }}</div>
                <div class="comp-name">{{ comp.competency_name }}</div>
              </td>
              <td
                v-for="b in displayBimesters"
                :key="`${comp.competency_id}-${b.number}`"
                class="col-nl"
                :title="observationFor(comp, b.number) || undefined"
              >
                <ScoreLevelBadge :score="scoreFor(comp, b.number)" />
              </td>
            </tr>
            <tr v-if="!course.competencies?.length">
              <td class="col-area">{{ course.course_name }}</td>
              <td class="col-comp text-body-secondary" :colspan="1 + displayBimesters.length">
                Sin competencias configuradas
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p class="academic-record__hint">
        Pase el cursor sobre un nivel de logro para ver la conclusión descriptiva cuando exista.
        El PDF incluye NL y conclusión de los 4 bimestres, al estilo de la libreta SIAGIE.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'
import ScoreLevelBadge from '@/components/academic/ScoreLevelBadge.vue'
import { generateAcademicRecordPdf } from '@/utils/generateAcademicRecordPdf'

const loading = ref(true)
const loadError = ref('')
const studentInfo = ref(null)
const period = ref(null)
const bimesters = ref([])
const courses = ref([])
const institution = ref({})

const headerSubtitle = computed(() => {
  if (!studentInfo.value) return 'Notas de todos los cursos del periodo activo'
  const parts = [studentInfo.value.name]
  if (studentInfo.value.grade_section?.label) {
    parts.push(studentInfo.value.grade_section.label)
  }
  return parts.join(' · ')
})

const displayBimesters = computed(() => {
  const byNumber = new Map(
    (bimesters.value || []).map((b) => [Number(b.number), b])
  )
  return [1, 2, 3, 4].map(
    (number) =>
      byNumber.get(number) || {
        number,
        name: `Bimestre ${number}`,
      }
  )
})

const shortBimesterLabel = (b) => {
  const labels = { 1: '1° bim.', 2: '2° bim.', 3: '3° bim.', 4: '4° bim.' }
  return labels[Number(b.number)] || `B${b.number}`
}

const scoreFor = (comp, number) => {
  const entry = comp?.scores_by_bimester?.[String(number)]
  return entry?.score || ''
}

const observationFor = (comp, number) => {
  const entry = comp?.scores_by_bimester?.[String(number)]
  return entry?.observations || ''
}

const loadRecord = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await CompetencyScoreService.academicRecord()
    if (response.data?.success) {
      const data = response.data.data || {}
      studentInfo.value = data.student || null
      period.value = data.period || null
      bimesters.value = data.bimesters || []
      courses.value = data.courses || []
      institution.value = data.institution || {}
    } else {
      loadError.value = response.data?.message || 'No se pudo cargar el record académico.'
    }
  } catch (error) {
    loadError.value =
      error.response?.data?.message || 'Error al cargar el record académico.'
  } finally {
    loading.value = false
  }
}

const downloadPdf = () => {
  generateAcademicRecordPdf({
    student: studentInfo.value,
    period: period.value,
    bimesters: bimesters.value,
    courses: courses.value,
    institution: institution.value,
  })
}

onMounted(loadRecord)
</script>

<style scoped>
.academic-record__meta {
  justify-content: flex-start;
}

.academic-record__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  background: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
}

.academic-record__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 52rem;
  font-size: var(--rp-text-sm, 0.875rem);
}

.academic-record__table th,
.academic-record__table td {
  border: 1px solid var(--rp-border);
  padding: 0.55rem 0.65rem;
  vertical-align: top;
}

.academic-record__table thead th {
  background: var(--rp-surface-sunken, #f3f4f6);
  color: var(--rp-text-heading);
  font-weight: var(--rp-weight-semibold);
  text-align: center;
  white-space: nowrap;
}

.col-area {
  width: 11rem;
  min-width: 9rem;
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  background: var(--rp-surface-sunken, #f3f4f6);
}

.col-comp {
  min-width: 16rem;
  text-align: left;
}

.col-nl {
  width: 4.5rem;
  text-align: center;
  vertical-align: middle;
}

.comp-code {
  font-weight: var(--rp-weight-semibold);
  font-size: 0.75rem;
  color: var(--rp-text-heading);
}

.comp-name {
  color: var(--rp-text-muted);
  font-size: 0.78rem;
  line-height: 1.25;
  margin-top: 0.15rem;
}

.academic-record__hint {
  margin: 0.75rem 1rem 1rem;
  font-size: 0.8rem;
  color: var(--rp-text-subtle);
}

@media (max-width: 575.98px) {
  .academic-record__table {
    font-size: 0.8rem;
  }
}
</style>
