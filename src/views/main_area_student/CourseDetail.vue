<template>
  <div class="course-detail">
    <header class="course-header">
      <p class="course-eyebrow">Mi curso</p>
      <h1 class="course-title">{{ courseClassData.course_name || 'Curso' }}</h1>
      <p v-if="courseClassData.teacher_name" class="course-subtitle">
        Docente: {{ courseClassData.teacher_name }}
      </p>
    </header>

    <nav class="course-tabs" aria-label="Opciones del curso">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="course-tab"
        :class="{ 'course-tab--active': isTabActive(tab) }"
      >
        <i :class="tab.icon" aria-hidden="true"></i>
        <span>{{ tab.label }}</span>
      </router-link>
    </nav>

    <div class="course-tab-panel">
      <router-view :key="route.fullPath" />
    </div>

    <AnnouncementLoginModal :course-class-id="course_class_id" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import CourseClassService from '@/services/CourseClassService'
import AnnouncementLoginModal from '@/components/announcements/AnnouncementLoginModal.vue'

const route = useRoute()
const course_class_id = computed(() => Number(route.params.courseClass))

const courseClassData = ref({
  course_name: '',
  teacher_name: '',
})

const tabs = computed(() => {
  const id = course_class_id.value
  return [
    {
      label: 'Asistencias',
      to: `/courses/student/${id}/assistance`,
      match: 'assistance',
      icon: 'fas fa-clipboard-check',
    },
    {
      label: 'Horario',
      to: `/courses/student/${id}/schedule`,
      match: 'schedule',
      icon: 'fas fa-clock',
    },
    {
      label: 'Competencias',
      to: `/courses/student/${id}/competencies`,
      match: 'competencies',
      icon: 'fas fa-list-ul',
    },
    {
      label: 'Conducta',
      to: `/courses/student/${id}/conduct`,
      match: 'conduct',
      icon: 'fas fa-exclamation-triangle',
    },
  ]
})

const isTabActive = (tab) => {
  const base = `/courses/student/${course_class_id.value}/`
  return route.path === `${base}${tab.match}`
}

const loadCourse = async (id) => {
  try {
    const response = await CourseClassService.getCourseClass(id)
    courseClassData.value = response.data?.data || {
      course_name: '',
      teacher_name: '',
    }
  } catch (error) {
    console.error('Error al obtener datos del curso:', error)
  }
}

watch(
  course_class_id,
  (id) => {
    if (id) loadCourse(id)
  },
  { immediate: true }
)
</script>

<style scoped>
.course-detail {
  padding: var(--rp-space-4) 0 var(--rp-space-8);
  max-width: var(--rp-page-max-width);
  margin-inline: auto;
}

.course-header {
  margin-bottom: var(--rp-space-4);
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

.course-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.15rem;
  overflow-x: auto;
  margin-bottom: var(--rp-space-5);
  padding-bottom: 1px;
  border-bottom: 1px solid var(--rp-border);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.course-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex: 0 0 auto;
  padding: 0.7rem 1rem;
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-medium);
  color: var(--rp-text-muted);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  transition: color var(--rp-transition-fast), border-color var(--rp-transition-fast);
}

.course-tab i {
  font-size: 0.85em;
  opacity: 0.85;
}

.course-tab:hover {
  color: var(--rp-text-heading);
  text-decoration: none;
}

.course-tab--active {
  color: var(--rp-brand-600);
  border-bottom-color: var(--rp-brand-500);
  font-weight: var(--rp-weight-semibold);
}

.course-tab-panel {
  min-width: 0;
}

@media (max-width: 575.98px) {
  .course-tab {
    padding: 0.65rem 0.75rem;
    font-size: var(--rp-text-sm, 0.875rem);
  }
}
</style>
