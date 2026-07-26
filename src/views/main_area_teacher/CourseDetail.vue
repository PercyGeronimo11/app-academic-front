<template>
  <div class="course-detail">
    <header class="course-header">
      <p class="course-eyebrow">Aula virtual</p>
      <h1 class="course-title">{{ courseClassData.course_name || 'Curso' }}</h1>
      <p v-if="courseSubtitle" class="course-subtitle">{{ courseSubtitle }}</p>
    </header>

    <section class="options-section">
      <h2 class="section-heading">Opciones del curso</h2>
      <div class="options-grid">
        <router-link
          v-for="option in teacherOptions"
          :key="option.to"
          :to="option.to"
          class="option-card"
          :class="`option-card--${option.tone}`"
        >
          <div class="option-card__icon" aria-hidden="true">
            <i :class="option.icon"></i>
          </div>
          <div class="option-card__body">
            <h3 class="option-card__title">{{ option.title }}</h3>
            <p class="option-card__desc">{{ option.description }}</p>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CourseClassService from '@/services/CourseClassService'

const route = useRoute()
const course_class_id = Number(route.params.courseClass)

const courseClassData = ref({
  course_name: '',
  teacher_name: '',
  grade: null,
  section: null,
})

const courseSubtitle = computed(() => {
  const { grade, section } = courseClassData.value
  if (grade && section) return `Grado ${grade} — Sección ${section}`
  if (grade) return `Grado ${grade}`
  if (section) return `Sección ${section}`
  return ''
})

const teacherOptions = computed(() => [
  {
    title: 'Tomar asistencia',
    description: 'Registrar presentes, faltas y tardanzas del día.',
    to: `/teacher/${course_class_id}/assistance`,
    icon: 'fas fa-clipboard-check',
    tone: 'attendance',
  },
  {
    title: 'Incidentes de conducta',
    description: 'Documentar y revisar incidencias del aula.',
    to: `/teacher/${course_class_id}/conduct`,
    icon: 'fas fa-exclamation-triangle',
    tone: 'conduct',
  },
  {
    title: 'Notas por competencia',
    description: 'Consultar niveles de logro (AD, A, B, C).',
    to: `/teacher/${course_class_id}/grades`,
    icon: 'fas fa-chart-bar',
    tone: 'grades',
  },
  {
    title: 'Importar notas SIAGIE',
    description: 'Cargar calificaciones desde el Excel oficial.',
    to: `/teacher/${course_class_id}/grades/import`,
    icon: 'fas fa-file-excel',
    tone: 'import',
  },
])

onMounted(async () => {
  try {
    const response = await CourseClassService.getCourseClass(course_class_id)
    courseClassData.value = response.data?.data || courseClassData.value
  } catch (error) {
    console.error('Error al cargar datos del curso:', error)
  }
})
</script>

<style scoped>
.course-detail {
  padding: var(--rp-space-4) 0 var(--rp-space-8);
  max-width: var(--rp-page-max-width);
  margin-inline: auto;
}

.course-header {
  margin-bottom: var(--rp-space-6);
  padding-bottom: var(--rp-space-5);
  border-bottom: 1px solid var(--rp-border);
}

.course-eyebrow {
  margin: 0;
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: var(--rp-tracking-wide);
  text-transform: uppercase;
  color: var(--rp-text-subtle);
}

.course-title {
  margin: var(--rp-space-1) 0 0;
  color: var(--rp-text-heading);
  font-size: clamp(var(--rp-text-xl), 4vw, var(--rp-text-2xl));
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-tight);
  letter-spacing: -0.02em;
  overflow-wrap: break-word;
}

.course-subtitle {
  margin: var(--rp-space-1) 0 0;
  font-size: var(--rp-text-base);
  color: var(--rp-text-muted);
}

.section-heading {
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  margin: 0 0 var(--rp-space-4);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
  gap: var(--rp-space-4);
}

.option-card {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
  padding: var(--rp-space-5);
  border-radius: var(--rp-radius-lg);
  text-decoration: none;
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  box-shadow: var(--rp-shadow-xs);
  transition: border-color var(--rp-transition-base), background-color var(--rp-transition-base);
}

.option-card:hover {
  border-color: var(--rp-border-brand);
  background: var(--rp-surface-hover);
  text-decoration: none;
}

.option-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--rp-radius-md);
  display: grid;
  place-items: center;
  font-size: var(--rp-text-md);
  background: var(--rp-surface-brand-soft);
  color: var(--rp-brand-500);
}

.option-card__title {
  margin: 0 0 var(--rp-space-1);
  font-size: var(--rp-text-md);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.option-card__desc {
  margin: 0;
  font-size: var(--rp-text-base);
  line-height: var(--rp-leading-snug);
  color: var(--rp-text-muted);
}

/* El tono sólo tiñe el icono: la tarjeta mantiene el borde neutro del sistema. */
.option-card--conduct .option-card__icon {
  background: var(--rp-warning-50);
  color: var(--rp-warning-700);
}

.option-card--grades .option-card__icon {
  background: var(--rp-success-50);
  color: var(--rp-success-700);
}

.option-card--import .option-card__icon {
  background: var(--rp-brand-100);
  color: var(--rp-brand-600);
}

@media (max-width: 575.98px) {
  .option-card {
    padding: var(--rp-space-4);
  }
}
</style>
