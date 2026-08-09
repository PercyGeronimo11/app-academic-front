<template>
  <div class="courses-wrapper">
    <div v-if="courses.length" class="courses-container">
      <CourseCard
        v-for="(course, index) in courses"
        :key="course.url ?? index"
        :title="course.title"
        :subtitle="course.subtitle"
        :image="course.image"
        :url="course.url"
      />
    </div>

    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CourseCard from "@/components/CourseCard.vue";
import CourseClassService from "../../services/CourseClassService";

const courses = ref([]);

const formatGradeSection = (grade, section) => {
  if (!grade && !section) return '';
  if (grade && section) return `Grado ${grade} — Sección ${section}`;
  if (grade) return `Grado ${grade}`;
  return `Sección ${section}`;
};

// Función para obtener los cursos del API
const listItems = async () => {
  try {
    const data = { idPeriod: 1 };
    const response = await CourseClassService.listCoursesByTeacher()
    const courseData = response.data.data;
    
    courses.value = courseData.map((course) => ({
      title: course.course_name,
      subtitle: formatGradeSection(course.grade, course.section),
      image: course.course_image || null,
      url: `/courses/teacher/${course.course_class_id}/assistance`,
    }));

    console.log(courses.value); 
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
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

.search-bar,
.category-filter {
  flex: 1 1 min(100%, 16rem);
  min-width: 0;
  padding: var(--rp-space-2) var(--rp-space-3);
  font-size: var(--rp-text-base);
  color: var(--rp-text);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-strong);
  border-radius: var(--rp-radius-md);
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.search-bar:focus,
.category-filter:focus {
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
