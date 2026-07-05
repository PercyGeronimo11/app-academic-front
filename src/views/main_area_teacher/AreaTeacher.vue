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
      image: null,
      url: `/teacher/${course.course_class_id}/detalle`,
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

.category-filter {
  width: 25%;
  padding: 10px;
  font-size: 1rem;
}

.courses-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  justify-items: start;
}

@media (max-width: 480px) {
  .search-bar {
    width: 100%;
  }

  .category-filter {
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
