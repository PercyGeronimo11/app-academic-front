<template>
  <div class="courses-wrapper">
    <div class="filters">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar cursos ..."
        class="search-bar"
      />
    </div>

    <div v-if="loading" class="text-center text-body-secondary py-4">
      Cargando cursos...
    </div>

    <div v-else-if="loadError" class="alert alert-danger">
      {{ loadError }}
    </div>

    <div v-else-if="filteredCourses.length" class="courses-container">
      <CourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :title="course.title"
        :image="course.image"
        :url="course.url"
      />
    </div>

    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import CourseCard from '@/components/CourseCard.vue';
import StudentService from '@/services/StudentService';

const searchQuery = ref('');
const courses = ref([]);
const loading = ref(false);
const loadError = ref('');

const filteredCourses = computed(() =>
  courses.value.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const listItems = async () => {
  loading.value = true;
  loadError.value = '';
  courses.value = [];

  try {
    const response = await StudentService.getCourse({});
    const body = response?.data;

    if (!body?.success) {
      loadError.value = body?.message || 'No se pudieron cargar los cursos.';
      return;
    }

    const courseData = Array.isArray(body.data) ? body.data : [];

    courses.value = courseData
      .filter((course) => course?.id && course?.name)
      .map((course) => ({
        id: course.id,
        title: course.name,
        image: course.image || null,
        url: `/student/courseClass/${course.id}/detalle`,
      }));
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    loadError.value =
      error.response?.data?.message ||
      'Error al cargar los cursos. Verifique su sesión de estudiante.';
  } finally {
    loading.value = false;
  }
};

onMounted(listItems);
</script>

<style scoped>
.courses-wrapper {
  padding: var(--rp-space-5) 0 var(--rp-space-8);
  max-width: var(--rp-page-max-width);
  margin-inline: auto;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rp-space-3);
  margin-bottom: var(--rp-space-5);
}

.search-bar {
  flex: 1 1 min(100%, 22rem);
  min-width: 0;
  padding: var(--rp-space-2) var(--rp-space-3);
  font-size: var(--rp-text-base);
  color: var(--rp-text);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-strong);
  border-radius: var(--rp-radius-md);
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.search-bar::placeholder {
  color: var(--rp-text-subtle);
}

.search-bar:focus {
  outline: none;
  border-color: var(--rp-brand-400);
  box-shadow: var(--rp-shadow-focus);
}

.courses-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: var(--rp-space-4);
  justify-items: stretch;
}

.no-results {
  text-align: center;
  font-size: var(--rp-text-md);
  color: var(--rp-text-muted);
  padding: var(--rp-space-8) var(--rp-space-4);
}

@media (max-width: 575.98px) {
  .courses-wrapper {
    padding: var(--rp-space-4) 0 var(--rp-space-6);
  }

  .courses-container {
    gap: var(--rp-space-3);
  }
}
</style>
