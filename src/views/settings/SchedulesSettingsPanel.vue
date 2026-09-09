<template>
  <div class="schedules-panel">
    <div class="schedules-panel__toolbar">
      <div class="schedules-panel__intro">
        <div class="schedules-panel__title-row">
          <h5 class="schedules-panel__title mb-0">Horarios del periodo activo</h5>
          <span class="schedules-panel__badge">Solo lectura</span>
        </div>
        <p class="schedules-panel__meta mb-0">
          Periodo académico:
          <strong>{{ periodLabel }}</strong>
        </p>
        <div v-if="hasSearched && activeAulaLabel" class="schedules-panel__stats">
          <span class="schedules-panel__stat">
            Aula <strong>{{ activeAulaLabel }}</strong>
          </span>
          <span class="schedules-panel__stat">
            {{ rows.length }} horario{{ rows.length === 1 ? '' : 's' }}
          </span>
        </div>
      </div>

      <div class="schedules-panel__filters">
        <div class="schedules-panel__filter">
          <CFormLabel for="schedules-grade" class="schedules-panel__filter-label">
            Grado
          </CFormLabel>
          <CFormSelect
            id="schedules-grade"
            v-model="selectedGrade"
            class="schedules-panel__select"
            :disabled="loadingMeta || !gradeOptions.length"
            @change="onGradeChange"
          >
            <option value="">Seleccione</option>
            <option v-for="grade in gradeOptions" :key="grade" :value="grade">
              {{ grade }}°
            </option>
          </CFormSelect>
        </div>

        <div class="schedules-panel__filter">
          <CFormLabel for="schedules-section" class="schedules-panel__filter-label">
            Sección
          </CFormLabel>
          <CFormSelect
            id="schedules-section"
            v-model="selectedSection"
            class="schedules-panel__select"
            :disabled="loadingMeta || !selectedGrade || !sectionOptions.length"
            @change="onSectionChange"
          >
            <option value="">Seleccione</option>
            <option v-for="section in sectionOptions" :key="section" :value="section">
              {{ section }}
            </option>
          </CFormSelect>
        </div>

        <div class="schedules-panel__filter schedules-panel__filter--action">
          <span
            class="schedules-panel__filter-label schedules-panel__filter-label--spacer"
            aria-hidden="true"
          >
            &nbsp;
          </span>
          <CButton
            type="button"
            color="primary"
            class="schedules-panel__search"
            :disabled="loadingMeta || loading || !canSearch"
            @click="searchSchedules"
          >
            <i class="fas fa-search me-2" aria-hidden="true"></i>
            {{ loading ? 'Buscando...' : 'Buscar' }}
          </CButton>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="schedules-panel__error mb-0">{{ errorMessage }}</p>

    <div v-else-if="!hasSearched" class="schedules-panel__empty-state">
      <div class="schedules-panel__empty-icon" aria-hidden="true">
        <i class="fas fa-clock"></i>
      </div>
      <p class="schedules-panel__empty-title mb-1">Busque un aula</p>
      <p class="schedules-panel__empty-text mb-0">
        Elija grado y sección, luego pulse <strong>Buscar</strong> para consultar los horarios.
      </p>
    </div>

    <div v-else class="schedules-panel__list">
      <ElegantCrudList
        :columns="columns"
        :data="rows"
        empty-message="No hay horarios registrados para este aula en el periodo activo."
        empty-hint="Los horarios se registran desde Configuración → Asignación."
        empty-icon="🕒"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue'
import ScheduleService from '@/services/ScheduleService'

const loadingMeta = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const period = ref(null)
const aulas = ref([])
const schedules = ref([])
const selectedGrade = ref('')
const selectedSection = ref('')
const hasSearched = ref(false)
const activeAulaLabel = ref('')

const columns = [
  { key: 'day_label', label: 'Día' },
  { key: 'start_time', label: 'Inicio' },
  { key: 'end_time', label: 'Fin' },
  { key: 'course_name', label: 'Curso' },
  { key: 'teacher_name', label: 'Docente', hideOnMobile: true },
  { key: 'aula', label: 'Aula' },
]

const periodLabel = computed(() => period.value?.name || '—')

const gradeOptions = computed(() => {
  const grades = aulas.value.map((aula) => String(aula.grade ?? '')).filter(Boolean)
  return [...new Set(grades)].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
})

const sectionOptions = computed(() => {
  if (!selectedGrade.value) return []
  const sections = aulas.value
    .filter((aula) => String(aula.grade) === String(selectedGrade.value))
    .map((aula) => String(aula.section ?? ''))
    .filter(Boolean)
  return [...new Set(sections)].sort((a, b) => a.localeCompare(b))
})

const matchedAula = computed(() => {
  if (!selectedGrade.value || !selectedSection.value) return null
  return (
    aulas.value.find(
      (aula) =>
        String(aula.grade) === String(selectedGrade.value) &&
        String(aula.section) === String(selectedSection.value),
    ) || null
  )
})

const canSearch = computed(() => Boolean(matchedAula.value))

const rows = computed(() =>
  (schedules.value || []).map((item) => ({
    ...item,
    teacher_name: item.teacher_name || '—',
    course_name: item.course_name || '—',
    aula: item.aula || `${item.grade || ''}° ${item.section || ''}`.trim(),
  })),
)

const clearResults = () => {
  hasSearched.value = false
  activeAulaLabel.value = ''
  schedules.value = []
  errorMessage.value = ''
}

const loadMeta = async () => {
  loadingMeta.value = true
  errorMessage.value = ''
  try {
    const response = await ScheduleService.list({})
    const data = response.data?.data || {}
    period.value = data.period || null
    aulas.value = data.aulas || []
  } catch (error) {
    period.value = null
    aulas.value = []
    errorMessage.value =
      error.response?.data?.message || 'No se pudieron cargar las aulas del periodo activo.'
  } finally {
    loadingMeta.value = false
  }
}

const onGradeChange = () => {
  selectedSection.value = ''
  clearResults()
}

const onSectionChange = () => {
  clearResults()
}

const searchSchedules = async () => {
  if (!matchedAula.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Seleccione aula',
      text: 'Elija grado y sección antes de buscar.',
    })
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const response = await ScheduleService.list({
      grade_section_id: Number(matchedAula.value.id),
    })
    const data = response.data?.data || {}
    period.value = data.period || period.value
    if (data.aulas?.length) aulas.value = data.aulas
    schedules.value = data.schedules || []
    hasSearched.value = true
    activeAulaLabel.value = matchedAula.value.label || `${matchedAula.value.grade}° ${matchedAula.value.section}`
  } catch (error) {
    schedules.value = []
    hasSearched.value = false
    activeAulaLabel.value = ''
    errorMessage.value =
      error.response?.data?.message || 'No se pudieron cargar los horarios del aula.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMeta()
})
</script>

<style scoped>
.schedules-panel {
  background:
    linear-gradient(180deg, var(--rp-surface-brand-soft) 0, transparent 8rem),
    var(--rp-surface-muted);
  min-height: 16rem;
}

.schedules-panel__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
  padding: var(--rp-space-3);
  border-bottom: 1px solid var(--rp-border-brand);
  background:
    linear-gradient(
      135deg,
      rgba(var(--rp-brand-rgb), 0.12) 0%,
      rgba(var(--rp-brand-rgb), 0.04) 48%,
      var(--rp-surface) 100%
    );
}

.schedules-panel__intro {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-2);
}

.schedules-panel__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rp-space-2);
}

.schedules-panel__title {
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: var(--rp-leading-tight);
}

.schedules-panel__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: var(--rp-radius-sm);
  background: var(--rp-surface-muted, var(--rp-surface-sunken));
  color: var(--rp-text-muted);
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.schedules-panel__meta {
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
}

.schedules-panel__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.schedules-panel__stat {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.6rem;
  border-radius: var(--rp-radius-sm, 0.4rem);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-subtle, var(--rp-border));
  color: var(--rp-text-muted);
  font-size: var(--rp-text-2xs, 0.7rem);
  font-weight: var(--rp-weight-semibold, 600);
}

.schedules-panel__filters {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-2);
}

.schedules-panel__filter {
  width: 100%;
  min-width: 0;
}

.schedules-panel__filter-label {
  margin-bottom: 0.35rem;
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-muted);
}

.schedules-panel__filter-label--spacer {
  display: none;
}

.schedules-panel__select {
  min-height: 44px;
  width: 100%;
  background: var(--rp-surface);
}

.schedules-panel__search {
  width: 100%;
  min-height: 44px;
  font-weight: 600;
}

.schedules-panel__error {
  padding: var(--rp-space-3) var(--rp-space-4);
  color: var(--rp-danger-700, #b42318);
  background: var(--rp-danger-50, #fef3f2);
  border-bottom: 1px solid var(--rp-danger-200, #fecdca);
  font-size: var(--rp-text-sm);
}

.schedules-panel__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.35rem;
  padding: 2.5rem 1.25rem;
  color: var(--rp-text-muted);
}

.schedules-panel__empty-icon {
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-subtle, var(--rp-border));
  color: var(--rp-brand-500);
  font-size: 1.15rem;
}

.schedules-panel__empty-title {
  font-size: var(--rp-text-base, 1rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-heading, var(--rp-text));
}

.schedules-panel__empty-text {
  max-width: 22rem;
  font-size: var(--rp-text-sm, 0.875rem);
  line-height: 1.45;
  color: var(--rp-text-muted);
}

.schedules-panel__list :deep(.modern-list-wrapper) {
  border: none;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

@media (min-width: 768px) {
  .schedules-panel__toolbar {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    padding: var(--rp-space-3) var(--rp-space-4);
  }

  .schedules-panel__filters {
    width: auto;
    max-width: 28rem;
    flex-shrink: 0;
    grid-template-columns: minmax(5.5rem, 1fr) minmax(5.5rem, 1fr) auto;
    align-items: end;
    gap: var(--rp-space-2);
  }

  .schedules-panel__filter-label--spacer {
    display: block;
  }

  .schedules-panel__search {
    width: auto;
    min-width: 7.5rem;
    padding-inline: 1rem;
  }

  .schedules-panel__title {
    font-size: var(--rp-text-lg);
  }
}
</style>
