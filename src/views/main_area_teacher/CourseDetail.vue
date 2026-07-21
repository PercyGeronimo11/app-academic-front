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
  padding: 1rem 0 2rem;
}

.course-header {
  text-align: center;
  margin-bottom: 2rem;
}

.course-eyebrow {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}

.course-title {
  margin: 0.35rem 0 0.25rem;
  color: #034285;
  font-size: clamp(1.6rem, 2.5vw, 2rem);
  font-weight: 700;
}

.course-subtitle {
  margin: 0;
  color: #64748b;
}

.section-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.option-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 170px;
  padding: 1.25rem;
  border-radius: 14px;
  text-decoration: none;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.option-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  text-decoration: none;
}

.option-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  color: #fff;
}

.option-card__title {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.option-card__desc {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #64748b;
}

.option-card--attendance {
  border-color: #bfdbfe;
}
.option-card--attendance .option-card__icon {
  background: #2563eb;
}
.option-card--attendance:hover {
  border-color: #93c5fd;
}

.option-card--conduct {
  border-color: #fde68a;
}
.option-card--conduct .option-card__icon {
  background: #d97706;
}
.option-card--conduct:hover {
  border-color: #fcd34d;
}

.option-card--grades {
  border-color: #bbf7d0;
}
.option-card--grades .option-card__icon {
  background: #059669;
}
.option-card--grades:hover {
  border-color: #86efac;
}

.option-card--import {
  border-color: #c7d2fe;
}
.option-card--import .option-card__icon {
  background: #4f46e5;
}
.option-card--import:hover {
  border-color: #a5b4fc;
}
</style>
