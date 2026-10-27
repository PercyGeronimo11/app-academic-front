<template>
  <div class="notes-page">
    <NotesFilterCard
      title="Distribución por nivel de logro"
      eyebrow="Notas · Reportes"
      description="Cantidad y porcentaje de alumnos según el promedio de las competencias del curso."
      icon-class="fas fa-chart-bar"
      :period-year="periodYear"
      :current-bimester-label="currentBimesterLabel"
      :bimesters="bimesters"
      :classrooms="classrooms"
      :courses="courses"
      :bimester="bimester"
      :grade="grade"
      :section="section"
      :course="course"
      grade-required
      show-course
      :loading="loading"
      :can-query="canQuery"
      @update:bimester="bimester = $event"
      @update:grade="grade = $event"
      @update:section="section = $event"
      @update:course="course = $event"
      @apply="loadReport"
    />

    <CAlert v-if="!queried && !loading" color="light" class="border">
      Elija bimestre, grado y curso. La sección es opcional: si queda en Todas, el gráfico junta las secciones de ese grado.
    </CAlert>

    <div v-else-if="loading" class="text-center py-5">
      <CSpinner color="primary" />
      <p class="mt-3 mb-0 text-body-secondary">Cargando distribución...</p>
    </div>

    <CAlert v-else-if="error" color="warning">{{ error }}</CAlert>

    <CCard v-else class="shadow-sm border-0">
      <CCardHeader class="bg-white border-0 pt-3 pb-0 px-3 px-md-4">
        <h2 class="notes-chart__title mb-1">Distribución de estudiantes por nivel de logro</h2>
        <p class="notes-chart__meta mb-0">
          {{ totalStudents }} alumno(s)
          <template v-if="scopeLabel"> · {{ scopeLabel }}</template>
        </p>
      </CCardHeader>
      <CCardBody class="px-3 px-md-4 pb-4">
        <p v-if="!totalStudents" class="notes-empty mb-0">
          No hay alumnos activos para el curso, grado y bimestre seleccionados.
        </p>
        <template v-else>
          <div class="notes-chart__layout">
            <div class="notes-chart__canvas">
              <CChartBar :data="chartData" :options="chartOptions" :plugins="plugins" />
            </div>
            <aside class="notes-legend" aria-label="Leyenda de niveles de logro">
              <p class="notes-legend__title">Niveles de logro</p>
              <ul class="notes-legend__list">
                <li v-for="level in levels" :key="level.key" class="notes-legend__item">
                  <span class="notes-legend__swatch" :style="{ background: colorOf(level.key) }"></span>
                  <div class="notes-legend__body">
                    <div class="notes-legend__row">
                      <strong>{{ level.label }}</strong>
                      <span class="notes-legend__badge">{{ level.letter || '—' }}</span>
                    </div>
                    <div class="notes-legend__meter" aria-hidden="true">
                      <span :style="{ width: `${Math.min(100, Number(level.percentage) || 0)}%`, background: colorOf(level.key) }"></span>
                    </div>
                  </div>
                  <div class="notes-legend__stats">
                    <strong>{{ level.count }}</strong>
                    <small>{{ formatPct(level.percentage) }}</small>
                  </div>
                </li>
              </ul>
            </aside>
          </div>
        </template>
      </CCardBody>
    </CCard>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import NotesFilterCard from '@/components/notas/NotesFilterCard.vue'
import NotesService from '@/services/NotesService'

const COLORS = {
  c: '#e07a3d',
  b: '#e6a317',
  a: '#2f6fed',
  ad: '#1f9d55',
  sin_nota: '#8b95a7',
}

const plugins = [ChartDataLabels]

const loading = ref(false)
const queried = ref(false)
const error = ref('')
const periodYear = ref('')
const bimesters = ref([])
const classrooms = ref([])
const courses = ref([])
const bimester = ref(null)
const grade = ref('')
const section = ref('all')
const course = ref('')
const totalStudents = ref(0)
const levels = ref([])
const appliedFilters = ref(null)

const currentBimesterLabel = computed(() => {
  const current = bimesters.value.find((item) => item.is_current)
  return current ? `B${current.number}` : ''
})

const canQuery = computed(() => Boolean(bimester.value) && Boolean(grade.value) && Boolean(course.value))

const scopeLabel = computed(() => {
  const filters = appliedFilters.value
  if (!filters) return ''
  const gradeText = filters.grade ? `${filters.grade}°` : ''
  const sectionText = filters.section ? `sección ${filters.section}` : 'todas las secciones'
  return [filters.course_name, filters.bimester_name, gradeText, sectionText].filter(Boolean).join(' · ')
})

const chartData = computed(() => ({
  labels: levels.value.map((level) => level.letter || 'S/N'),
  datasets: [
    {
      label: 'Alumnos',
      data: levels.value.map((level) => level.count),
      backgroundColor: levels.value.map((level) => colorOf(level.key)),
      borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 4, bottomRight: 4 },
      borderSkipped: false,
      maxBarThickness: 56,
      categoryPercentage: 0.72,
      barPercentage: 0.78,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 28 } },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 10,
      callbacks: {
        title(items) {
          const level = levels.value[items[0]?.dataIndex]
          if (!level) return ''
          return level.letter ? `${level.label} (${level.letter})` : level.label
        },
        label(context) {
          const level = levels.value[context.dataIndex]
          return ` ${level?.count ?? 0} alumnos · ${formatPct(level?.percentage)}`
        },
      },
    },
    datalabels: {
      anchor: 'end',
      align: 'end',
      offset: 2,
      clamp: true,
      color: '#1e293b',
      font: { weight: '700', size: 11 },
      formatter(value) {
        return String(value)
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { weight: '700', size: 13 },
        color: '#334155',
      },
    },
    y: {
      beginAtZero: true,
      grace: '12%',
      ticks: { precision: 0, color: '#64748b' },
      grid: { color: 'rgba(148, 163, 184, 0.25)' },
      title: {
        display: true,
        text: 'Alumnos',
        color: '#64748b',
        font: { size: 12, weight: '600' },
      },
    },
  },
}))

const colorOf = (key) => COLORS[key] || '#8b95a7'

const formatPct = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0%'
  const text = Number.isInteger(number)
    ? String(number)
    : number.toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${text}%`
}

const loadMeta = async () => {
  const response = await NotesService.reportMeta()
  const data = response.data?.data || {}
  periodYear.value = data.period?.year || ''
  bimesters.value = data.bimesters || []
  classrooms.value = data.classrooms || []
  courses.value = data.courses || []
  bimester.value = data.default_bimester || bimesters.value[0]?.number || null
}

const loadReport = async () => {
  if (!canQuery.value) return
  loading.value = true
  queried.value = true
  error.value = ''
  try {
    const response = await NotesService.report({
      bimester: bimester.value,
      grade: grade.value,
      section: section.value,
      course_id: course.value,
    })
    if (response.data?.success === false) {
      levels.value = []
      totalStudents.value = 0
      error.value = response.data?.message || 'No se pudo cargar el reporte.'
      return
    }
    const data = response.data?.data || {}
    levels.value = data.levels || []
    totalStudents.value = Number(data.total_students || 0)
    appliedFilters.value = data.filters || null
  } catch (err) {
    levels.value = []
    totalStudents.value = 0
    error.value = err.response?.data?.message || 'Error al cargar el reporte.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadMeta()
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudieron cargar los filtros.'
    queried.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.notes-page {
  width: 100%;
  min-width: 0;
}

.notes-chart__title {
  font-size: 1rem;
  font-weight: 700;
}

.notes-chart__meta,
.notes-empty {
  color: var(--rp-text-muted, #64748b);
  font-size: 0.9rem;
}

.notes-chart__canvas {
  position: relative;
  width: 100%;
  height: 280px;
  min-width: 0;
}

.notes-chart__layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.notes-legend {
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--rp-border, #e2e8f0);
  border-radius: 0.9rem;
  background: #f8fafc;
}

.notes-legend__title {
  margin: 0 0 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--rp-text-muted, #64748b);
}

.notes-legend__list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.notes-legend__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 44px;
}

.notes-legend__swatch {
  width: 0.7rem;
  align-self: stretch;
  min-height: 2.4rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.notes-legend__body {
  flex: 1;
  min-width: 0;
}

.notes-legend__row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.28rem;
}

.notes-legend__row strong {
  font-size: 0.86rem;
  color: var(--rp-text-heading, #1e293b);
  overflow-wrap: anywhere;
}

.notes-legend__badge {
  flex-shrink: 0;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--rp-border, #e2e8f0);
  font-size: 0.68rem;
  font-weight: 700;
  color: #475569;
}

.notes-legend__meter {
  height: 0.35rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.notes-legend__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.notes-legend__stats {
  flex-shrink: 0;
  min-width: 3.2rem;
  text-align: right;
}

.notes-legend__stats strong {
  display: block;
  font-size: 1rem;
  line-height: 1.1;
  color: var(--rp-text-heading, #1e293b);
}

.notes-legend__stats small {
  color: var(--rp-text-muted, #64748b);
  font-weight: 600;
}

@media (min-width: 768px) {
  .notes-chart__layout {
    flex-direction: row;
    align-items: stretch;
  }

  .notes-chart__canvas {
    flex: 1;
    height: 360px;
  }

  .notes-legend {
    width: 17.5rem;
    flex-shrink: 0;
  }
}
</style>
