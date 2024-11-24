<template>
  <div class="courses-wrapper">
    <div class="filters">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar cursos - teacher ..."
        class="search-bar"
      />
    </div>

    <div v-if="filteredCourses.length" class="courses-container">
      <CourseCard
        v-for="(course, index) in filteredCourses"
        :key="index"
        :title="course.title"
        :image="course.image"
        :url="course.url"
      />
    </div>

    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import CourseCard from "@/components/CourseCard.vue";
import TeacherService from "@/services/TeacherService";
import CourseClassService from "../../services/CourseClassService";

// Definición de reactivas
const searchQuery = ref("");
const selectedCategory = ref("");
const courses = ref([]);

// Computed para filtrar cursos
const filteredCourses = computed(() =>
  courses.value.filter((course) => {
    const matchesCategory =
      !selectedCategory.value || course.category === selectedCategory.value;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  })
);

// Función para obtener los cursos del API
const listItems = async () => {
  try {
    const data = { idPeriod: 1 };
    const response = await CourseClassService.listCoursesByTeacher()
    const courseData = response.data.data;
    console.log(response.data.data);
    
    // Mapea los cursos al formato necesario para las tarjetas
    courses.value = courseData.map((course) => ({
      title: course.course_name,
      image: null,
      url: `/class/${course.course_class_id}/${course.course_id}`, 
      category: "Ciencias",
    }));

    console.log(courses.value); 
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
  }
};

// Llama a la función para obtener los datos cuando el componente se monta
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
  justify-items: center;
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
