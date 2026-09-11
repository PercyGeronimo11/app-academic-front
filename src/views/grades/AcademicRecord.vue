<template>
  <div class="module-page academic-record">
    <div class="module-card academic-record__header mb-4">
      <div class="module-card__body academic-record__header-body">
        <div class="academic-record__header-top">
          <div class="academic-record__header-main">
            <div class="academic-record__header-icon" aria-hidden="true">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="academic-record__header-text">
              <h1 class="academic-record__title">Record Académico</h1>
              <p class="academic-record__subtitle">{{ headerSubtitle }}</p>
            </div>
          </div>
          <div class="academic-record__header-actions">
            <CButton
              color="primary"
              class="academic-record__pdf-btn"
              :disabled="loading || !courses.length"
              @click="downloadPdf"
            >
              <i class="fas fa-file-pdf me-2" aria-hidden="true"></i>Descargar PDF
            </CButton>
          </div>
        </div>

        <div
          v-if="!loading && !loadError && (period?.name || gradeLabel || courses.length)"
          class="academic-record__summary-body"
        >
          <span v-if="gradeLabel" class="preview-meta__chip academic-record__grade-chip">
            <i class="fas fa-chalkboard me-1" aria-hidden="true"></i>
            {{ gradeLabel }}
          </span>
          <span v-if="period?.name" class="academic-record__period-badge">
            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
            <span>
              Periodo activo
              <template v-if="period.year"> · {{ period.year }}</template>
            </span>
          </span>
          <span v-if="courses.length" class="academic-record__courses-count">
            {{ courses.length }} área{{ courses.length === 1 ? '' : 's' }} curricular{{ courses.length === 1 ? '' : 'es' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando record académico...
    </div>

    <EmptyState
      v-else-if="!courses.length"
      icon="📖"
      title="Sin cursos en el periodo activo"
      hint="Cuando esté asignado a un aula del periodo vigente, aquí verá sus notas por bimestre."
    />

    <div v-else class="module-card academic-record__card">


      <div class="academic-record__table-wrap">
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
            <template v-for="(course, courseIndex) in courses" :key="course.course_id">
              <tr
                v-for="(comp, index) in course.competencies"
                :key="comp.competency_id"
                :class="{
                  'academic-record__row--alt': index % 2 === 1,
                  'academic-record__row--area-end':
                    index === course.competencies.length - 1 &&
                    courseIndex < courses.length - 1,
                }"
              >
                <td
                  v-if="index === 0"
                  class="col-area"
                  :class="{ 'col-area--group-end': courseIndex < courses.length - 1 }"
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
              <tr
                v-if="!course.competencies?.length"
                :class="{
                  'academic-record__row--area-end': courseIndex < courses.length - 1,
                }"
              >
                <td
                  class="col-area"
                  :class="{ 'col-area--group-end': courseIndex < courses.length - 1 }"
                >
                  {{ course.course_name }}
                </td>
                <td class="col-comp text-body-secondary" :colspan="1 + displayBimesters.length">
                  Sin competencias configuradas
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="academic-record__footer">
        <p class="academic-record__hint">
          Pase el cursor sobre un nivel de logro para ver la conclusión descriptiva cuando exista.
          El PDF incluye NL y conclusión de los 4 bimestres, al estilo de la libreta SIAGIE.
        </p>
        <div class="academic-record__legend" aria-label="Leyenda de niveles de logro">
          <span class="academic-record__legend-item">
            <ScoreLevelBadge score="AD" /> AD
          </span>
          <span class="academic-record__legend-item">
            <ScoreLevelBadge score="A" /> A
          </span>
          <span class="academic-record__legend-item">
            <ScoreLevelBadge score="B" /> B
          </span>
          <span class="academic-record__legend-item">
            <ScoreLevelBadge score="C" /> C
          </span>
          <span class="academic-record__legend-item">
            <ScoreLevelBadge score="" /> Sin nota
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CompetencyScoreService from '@/services/CompetencyScoreService'
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
const attendance = ref([])

const gradeLabel = computed(() => studentInfo.value?.grade_section?.label || '')

const headerSubtitle = computed(() => {
  if (!studentInfo.value?.name) {
    return 'Notas de todos los cursos del periodo activo'
  }
  return studentInfo.value.name
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
      attendance.value = data.attendance || []
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

const downloadPdf = async () => {
  await generateAcademicRecordPdf({
    student: studentInfo.value,
    period: period.value,
    bimesters: bimesters.value,
    courses: courses.value,
    institution: institution.value,
    attendance: attendance.value,
  })
}

onMounted(loadRecord)
</script>

<style scoped>
.academic-record__header-body {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-4);
}

.academic-record__header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rp-space-4);
  flex-wrap: wrap;
}

.academic-record__header-main {
  display: flex;
  align-items: center;
  gap: var(--rp-space-3);
  min-width: 0;
  flex: 1 1 16rem;
}

.academic-record__header-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-brand-soft);
  color: var(--rp-brand-500);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--rp-text-lg);
  flex-shrink: 0;
  border: 1px solid var(--rp-border-brand);
}

.academic-record__header-text {
  min-width: 0;
}

.academic-record__title {
  margin: 0;
  font-size: var(--rp-text-xl);
  font-weight: var(--rp-weight-bold);
  line-height: var(--rp-leading-tight);
  color: var(--rp-brand-500);
  letter-spacing: -0.02em;
}

.academic-record__subtitle {
  margin: var(--rp-space-1) 0 0;
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.academic-record__header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rp-space-2);
  align-items: center;
}

.academic-record__pdf-btn {
  min-height: 44px;
  font-weight: var(--rp-weight-medium);
}

.academic-record__summary-body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rp-space-3);
  padding-top: var(--rp-space-4);
  border-top: 1px solid var(--rp-border-subtle);
}

.academic-record__grade-chip {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
}

.academic-record__period-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rp-space-2);
  min-height: 2rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--rp-radius-pill);
  background: var(--rp-surface-brand-soft);
  color: var(--rp-text-brand);
  border: 1px solid var(--rp-border-brand);
  font-size: var(--rp-text-sm);
  line-height: 1.3;
}

.academic-record__period-badge i {
  color: var(--rp-brand-500);
  flex-shrink: 0;
}

.academic-record__period-badge strong {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.academic-record__courses-count {
  margin-inline-start: auto;
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
}

.academic-record__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rp-space-3);
  flex-wrap: wrap;
}

.academic-record__card-header-meta {
  font-size: var(--rp-text-xs);
  font-weight: var(--rp-weight-medium);
  color: var(--rp-text-muted);
  text-transform: none;
  letter-spacing: normal;
}

.academic-record__table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.academic-record__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 40rem;
  font-size: var(--rp-text-sm, 0.875rem);
}

.academic-record__table th,
.academic-record__table td {
  border-bottom: 1px solid var(--rp-border-subtle);
  padding: 0.65rem 0.75rem;
  vertical-align: top;
}

.academic-record__table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--rp-brand-500);
  color: #fff;
  font-weight: var(--rp-weight-semibold);
  font-size: var(--rp-text-2xs);
  text-transform: uppercase;
  letter-spacing: var(--rp-tracking-wide);
  text-align: center;
  white-space: nowrap;
  border-bottom: none;
}

.academic-record__table thead th.col-area,
.academic-record__table thead th.col-comp {
  text-align: left;
}

.col-area {
  width: 11rem;
  min-width: 9rem;
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  background: var(--rp-surface-brand-soft);
  border-inline-end: 1px solid var(--rp-border-brand);
  vertical-align: middle;
}

.col-comp {
  min-width: 14rem;
  text-align: left;
}

.col-nl {
  width: 4.75rem;
  text-align: center;
  vertical-align: middle;
}

.academic-record__row--alt .col-comp,
.academic-record__row--alt .col-nl {
  background: var(--rp-surface-muted);
}

/* Separación horizontal más marcada entre áreas curriculares */
.academic-record__row--area-end > td {
  border-bottom: 2px solid var(--rp-brand-400);
}

.col-area--group-end {
  border-bottom: 2px solid var(--rp-brand-500);
}

.comp-code {
  font-weight: var(--rp-weight-semibold);
  font-size: 0.75rem;
  color: var(--rp-text-heading);
}

.comp-name {
  color: var(--rp-text-muted);
  font-size: 0.78rem;
  line-height: 1.35;
  margin-top: 0.15rem;
}

.academic-record__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
  padding: var(--rp-space-3) var(--rp-space-5);
  border-top: 1px solid var(--rp-border-subtle);
  background: var(--rp-surface-muted);
}

.academic-record__hint {
  margin: 0;
  flex: 1 1 16rem;
  font-size: var(--rp-text-xs);
  color: var(--rp-text-subtle);
  line-height: 1.45;
}

.academic-record__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rp-space-2) var(--rp-space-3);
  flex: 0 1 auto;
}

.academic-record__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--rp-text-xs);
  color: var(--rp-text-muted);
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .academic-record__header-actions,
  .academic-record__pdf-btn {
    width: 100%;
  }

  .academic-record__summary-body {
    gap: var(--rp-space-2);
  }

  .academic-record__courses-count {
    margin-inline-start: 0;
    width: 100%;
  }

  .academic-record__table {
    min-width: 36rem;
    font-size: 0.8rem;
  }

  .academic-record__footer {
    padding: var(--rp-space-3) var(--rp-space-4);
  }

  .col-area {
    min-width: 7.5rem;
  }
}
</style>
