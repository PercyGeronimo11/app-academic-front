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
        image: null,
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
  padding: 20px;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-bar {
  width: 70%;
  padding: 10px;
  font-size: 1rem;
  border-radius: 8px;
  margin-bottom: 10px;
}

.courses-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  justify-items: center;
}

@media (max-width: 480px) {
  .search-bar {
    width: 100%;
  }

  .courses-container {
    grid-template-columns: 1fr;
  }
}

.no-results {
  text-align: center;
  font-size: 1.25rem;
  color: #555;
}
</style>
