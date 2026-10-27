<template>
  <CCard class="shadow-sm border-0 mb-3 notes-card">
    <CCardBody class="p-3 p-md-4">
      <div class="notes-card__header">
        <div class="notes-card__intro">
          <div class="notes-card__icon" aria-hidden="true">
            <i :class="iconClass"></i>
          </div>
          <div class="notes-card__titles">
            <p class="notes-card__eyebrow mb-1">{{ eyebrow }}</p>
            <h1 class="notes-card__title mb-2">{{ title }}</h1>
            <p class="notes-card__desc mb-0">{{ description }}</p>
          </div>
        </div>
        <div class="notes-card__aside">
          <div v-if="periodYear" class="notes-chip" title="Periodo activo">
            <i class="fas fa-calendar-check" aria-hidden="true"></i>
            <div>
              <span>Periodo actual</span>
              <strong>{{ periodYear }}</strong>
            </div>
          </div>
          <div v-if="currentBimesterLabel" class="notes-chip" title="Bimestre vigente">
            <i class="fas fa-layer-group" aria-hidden="true"></i>
            <div>
              <span>Bimestre vigente</span>
              <strong>{{ currentBimesterLabel }}</strong>
            </div>
          </div>
        </div>
      </div>

      <hr class="notes-card__divider" />

      <div class="notes-filters" :class="{ 'notes-filters--course': showCourse }">
        <div class="notes-filters__field">
          <label class="notes-filters__label" for="notes-bimester">Bimestre</label>
          <CFormSelect
            id="notes-bimester"
            :model-value="bimester ?? ''"
            :disabled="loading || !bimesters.length"
            @change="$emit('update:bimester', Number($event.target.value))"
          >
            <option v-if="!bimesters.length" value="">Sin bimestres</option>
            <option v-for="item in bimesters" :key="item.id" :value="item.number">
              {{ item.name }}
            </option>
          </CFormSelect>
        </div>

        <div class="notes-filters__field">
          <label class="notes-filters__label" for="notes-grade">Grado</label>
          <CFormSelect
            id="notes-grade"
            :model-value="grade"
            :disabled="loading || !gradeOptions.length"
            @change="onGrade"
          >
            <option v-if="!gradeRequired" value="all">Todas</option>
            <option v-else value="">Seleccione</option>
            <option v-for="item in gradeOptions" :key="item" :value="item">{{ item }}°</option>
          </CFormSelect>
        </div>

        <div class="notes-filters__field">
          <label class="notes-filters__label" for="notes-section">Sección</label>
          <CFormSelect
            id="notes-section"
            :model-value="section"
            :disabled="loading || sectionDisabled"
            @change="onSection"
          >
            <option value="all">Todas</option>
            <option v-for="item in sectionOptions" :key="item" :value="item">{{ item }}</option>
          </CFormSelect>
        </div>

        <div v-if="showCourse" class="notes-filters__field">
          <label class="notes-filters__label" for="notes-course">Curso</label>
          <CFormSelect
            id="notes-course"
            :model-value="course"
            :disabled="loading || courseDisabled"
            @change="$emit('update:course', $event.target.value)"
          >
            <option value="">Seleccione</option>
            <option v-for="item in courseOptions" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </CFormSelect>
        </div>

        <div class="notes-filters__actions">
          <CButton
            color="primary"
            class="notes-filters__button"
            :disabled="loading || !canQuery"
            @click="$emit('apply')"
          >
            <i class="fas fa-search me-2" aria-hidden="true"></i>
            Consultar
          </CButton>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: 'Notas' },
  description: { type: String, default: '' },
  iconClass: { type: String, default: 'fas fa-chart-bar' },
  periodYear: { type: [String, Number], default: '' },
  currentBimesterLabel: { type: String, default: '' },
  bimesters: { type: Array, default: () => [] },
  classrooms: { type: Array, default: () => [] },
  bimester: { type: [Number, String], default: null },
  grade: { type: String, default: 'all' },
  section: { type: String, default: 'all' },
  course: { type: [String, Number], default: '' },
  courses: { type: Array, default: () => [] },
  showCourse: { type: Boolean, default: false },
  gradeRequired: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  canQuery: { type: Boolean, default: false },
})

const emit = defineEmits(['update:bimester', 'update:grade', 'update:section', 'update:course', 'apply'])

const gradeOptions = computed(() => {
  const set = new Set(props.classrooms.map((item) => String(item.grade)))
  return [...set].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
})

const sectionOptions = computed(() => {
  const grade = props.grade
  const source = grade && grade !== 'all'
    ? props.classrooms.filter((item) => String(item.grade) === String(grade))
    : props.classrooms
  const set = new Set(source.map((item) => String(item.section)))
  return [...set].sort((a, b) => a.localeCompare(b))
})

const sectionDisabled = computed(() => props.gradeRequired && (!props.grade || props.grade === 'all'))

const courseOptions = computed(() => {
  let list = props.courses
  if (props.grade && props.grade !== 'all') {
    list = list.filter((item) => String(item.grade) === String(props.grade))
  }
  if (props.section && props.section !== 'all') {
    list = list.filter((item) => String(item.section) === String(props.section))
  }
  const byId = new Map()
  list.forEach((item) => {
    if (!byId.has(Number(item.id))) byId.set(Number(item.id), item.name)
  })
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'))
})

const courseDisabled = computed(() => !props.grade || props.grade === 'all' || !courseOptions.value.length)

const onGrade = (event) => {
  emit('update:grade', event.target.value)
  emit('update:section', 'all')
  if (props.showCourse) emit('update:course', '')
}

const onSection = (event) => {
  emit('update:section', event.target.value)
}

watch(courseOptions, (options) => {
  if (!props.showCourse || props.course === '' || props.course == null) return
  const stillThere = options.some((item) => Number(item.id) === Number(props.course))
  if (!stillThere) emit('update:course', '')
})
</script>

<style scoped>
.notes-card__header {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.notes-card__intro {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.notes-card__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--rp-surface-brand-soft, #e8f1ff);
  color: var(--rp-text-brand, #1d4f91);
}

.notes-card__titles {
  min-width: 0;
}

.notes-card__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--rp-text-brand, #1d4f91);
}

.notes-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--rp-text-heading, #1e293b);
  overflow-wrap: anywhere;
}

.notes-card__desc {
  font-size: 0.9rem;
  color: var(--rp-text-muted, #64748b);
}

.notes-card__aside {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.notes-chip {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--rp-border, #e2e8f0);
  border-radius: 0.75rem;
  background: var(--rp-surface, #fff);
}

.notes-chip i {
  color: var(--rp-text-brand, #1d4f91);
}

.notes-chip span {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--rp-text-muted, #64748b);
}

.notes-chip strong {
  font-size: 0.95rem;
  color: var(--rp-text-heading, #1e293b);
}

.notes-card__divider {
  margin: 0.9rem 0;
  border-color: var(--rp-border, #e2e8f0);
  opacity: 1;
}

.notes-filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  align-items: end;
}

.notes-filters__field {
  min-width: 0;
}

.notes-filters__label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--rp-text-muted, #64748b);
}

.notes-filters__button {
  width: 100%;
  min-height: 44px;
}

@media (min-width: 768px) {
  .notes-card__header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  .notes-card__title {
    font-size: 1.45rem;
  }

  .notes-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .notes-filters:not(.notes-filters--course) {
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  }

  .notes-filters__button {
    width: auto;
    min-width: 9rem;
  }
}

@media (min-width: 1100px) {
  .notes-filters--course {
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  }
}
</style>
